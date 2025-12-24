import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { knex } from "../../../../db/knex-database-connection.js";
import { DomainTransaction, withTransaction } from "../../../../src/shared/infrastructure/DomainTransaction.js";

describe("Shared | Integration | Infrastructure | DomainTransaction", () => {
  beforeEach(async () => {
    // Ensure we have a clean test table for transaction testing
    const exists = await knex.schema.hasTable("test_transactions");
    if (!exists) {
      await knex.schema.createTable("test_transactions", (table) => {
        table.increments("id").primary();
        table.string("key", 255).notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
      });
    }
  });

  afterEach(async () => {
    // Clean up test table
    await knex.schema.dropTableIfExists("test_transactions");
  });

  describe("#getConnection", () => {
    it("should return standard knex connection when not in transaction", async () => {
      // when
      const connection = DomainTransaction.getConnection();

      // then
      expect(connection).toBe(knex);
    });

    it("should return transaction connection when inside transaction", async () => {
      // given
      let transactionConnection;

      // when
      await DomainTransaction.execute(async () => {
        transactionConnection = DomainTransaction.getConnection();
      });

      // then
      expect(transactionConnection).toBeDefined();
      expect(transactionConnection).not.toBe(knex);
      expect(transactionConnection.isTransaction).toBe(true);
    });
  });

  describe("#execute", () => {
    it("should commit changes when no error occurs", async () => {
      // when
      await DomainTransaction.execute(async () => {
        const knexConn = DomainTransaction.getConnection();
        await knexConn("test_transactions").insert({ key: "test-value" });
      });

      // then
      const rows = await knex("test_transactions").select("*");
      expect(rows).toHaveLength(1);
      expect(rows[0].key).toBe("test-value");
    });

    it("should rollback changes when an error occurs", async () => {
      // given
      let errorThrown = false;

      // when
      try {
        await DomainTransaction.execute(async () => {
          const knexConn = DomainTransaction.getConnection();
          await knexConn("test_transactions").insert({ key: "will-rollback" });
          throw new Error("Transaction error");
        });
      } catch {
        errorThrown = true;
      }

      // then
      expect(errorThrown).toBe(true);
      const rows = await knex("test_transactions").select("*");
      expect(rows).toHaveLength(0);
    });

    it("should support nested transactions using the same transaction", async () => {
      // given
      let outerConnectionId;
      let innerConnectionId;

      // when
      await DomainTransaction.execute(async () => {
        const outerConn = DomainTransaction.getConnection();
        outerConnectionId = outerConn;

        await outerConn("test_transactions").insert({ key: "outer" });

        await DomainTransaction.execute(async () => {
          const innerConn = DomainTransaction.getConnection();
          innerConnectionId = innerConn;

          await innerConn("test_transactions").insert({ key: "inner" });
        });
      });

      // then
      expect(outerConnectionId).toBe(innerConnectionId);
      const rows = await knex("test_transactions").select("*").orderBy("key");
      expect(rows).toHaveLength(2);
      expect(rows[0].key).toBe("inner");
      expect(rows[1].key).toBe("outer");
    });

    it("should rollback all nested changes when inner transaction fails", async () => {
      // given
      let errorThrown = false;

      // when
      try {
        await DomainTransaction.execute(async () => {
          const outerConn = DomainTransaction.getConnection();
          await outerConn("test_transactions").insert({ key: "outer" });

          await DomainTransaction.execute(async () => {
            const innerConn = DomainTransaction.getConnection();
            await innerConn("test_transactions").insert({ key: "inner" });
            throw new Error("Inner transaction error");
          });
        });
      } catch {
        errorThrown = true;
      }

      // then
      expect(errorThrown).toBe(true);
      const rows = await knex("test_transactions").select("*");
      expect(rows).toHaveLength(0);
    });
  });

  describe("#withTransaction", () => {
    it("should wrap a function to execute within a transaction", async () => {
      // given
      const insertData = withTransaction(async (key) => {
        const knexConn = DomainTransaction.getConnection();
        await knexConn("test_transactions").insert({ key });
      });

      // when
      await insertData("wrapped-value");

      // then
      const rows = await knex("test_transactions").select("*");
      expect(rows).toHaveLength(1);
      expect(rows[0].key).toBe("wrapped-value");
    });

    it("should rollback when wrapped function throws error", async () => {
      // given
      const insertWithError = withTransaction(async (key) => {
        const knexConn = DomainTransaction.getConnection();
        await knexConn("test_transactions").insert({ key });
        throw new Error("Wrapped function error");
      });

      let errorThrown = false;

      // when
      try {
        await insertWithError("error-value");
      } catch {
        errorThrown = true;
      }

      // then
      expect(errorThrown).toBe(true);
      const rows = await knex("test_transactions").select("*");
      expect(rows).toHaveLength(0);
    });

    it("should support nested withTransaction calls", async () => {
      // given
      const insertOuter = withTransaction(async (outerKey) => {
        const outerConn = DomainTransaction.getConnection();
        await outerConn("test_transactions").insert({ key: outerKey });

        const insertInner = withTransaction(async (innerKey) => {
          const innerConn = DomainTransaction.getConnection();
          await innerConn("test_transactions").insert({ key: innerKey });
        });

        await insertInner("inner-value");
      });

      // when
      await insertOuter("outer-value");

      // then
      const rows = await knex("test_transactions").select("*").orderBy("key");
      expect(rows).toHaveLength(2);
      expect(rows[0].key).toBe("inner-value");
      expect(rows[1].key).toBe("outer-value");
    });

    it("should work with withTransaction nested in DomainTransaction.execute", async () => {
      // given
      const insertInner = withTransaction(async (key) => {
        const knexConn = DomainTransaction.getConnection();
        await knexConn("test_transactions").insert({ key });
      });

      // when
      await DomainTransaction.execute(async () => {
        const outerConn = DomainTransaction.getConnection();
        await outerConn("test_transactions").insert({ key: "outer-execute" });
        await insertInner("inner-wrapped");
      });

      // then
      const rows = await knex("test_transactions").select("*").orderBy("key");
      expect(rows).toHaveLength(2);
      expect(rows[0].key).toBe("inner-wrapped");
      expect(rows[1].key).toBe("outer-execute");
    });
  });

  describe("Repository usage pattern", () => {
    it("should allow repository functions to work both with and without transactions", async () => {
      // given - simulate a repository function
      async function createEntry(key) {
        const knexConn = DomainTransaction.getConnection();
        await knexConn("test_transactions").insert({ key });
      }

      // when - call without transaction
      await createEntry("without-transaction");

      // when - call with transaction
      await DomainTransaction.execute(async () => {
        await createEntry("with-transaction");
      });

      // then
      const rows = await knex("test_transactions").select("*").orderBy("key");
      expect(rows).toHaveLength(2);
      expect(rows[0].key).toBe("with-transaction");
      expect(rows[1].key).toBe("without-transaction");
    });

    it("should allow multiple repository calls within single transaction", async () => {
      // given - simulate repository functions
      async function createEntry(key) {
        const knexConn = DomainTransaction.getConnection();
        await knexConn("test_transactions").insert({ key });
      }

      async function countEntries() {
        const knexConn = DomainTransaction.getConnection();
        const result = await knexConn("test_transactions").count("* as count").first();
        return parseInt(result.count, 10);
      }

      // when
      await DomainTransaction.execute(async () => {
        await createEntry("entry-1");
        await createEntry("entry-2");

        const count = await countEntries();
        expect(count).toBe(2);

        await createEntry("entry-3");
      });

      // then
      const finalCount = await countEntries();
      expect(finalCount).toBe(3);
    });
  });
});
