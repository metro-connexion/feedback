import { afterEach, vi } from "vitest";

// import { knex } from "../db/knex-database-connection.js";

// beforeEach(async () => {
//   const tables = await knex("pg_tables")
//     .select("tablename")
//     .where("schemaname", "public")
//     .pluck("tablename");
//
//   if (tables.length > 0) {
//     await knex.raw(
//       "TRUNCATE TABLE " +
//             tables.map((t) => `"${t}"`).join(", ") +
//             " RESTART IDENTITY CASCADE",
//     );
//   }
// });

afterEach(function() {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.clearAllMocks();
});

// afterAll(async () => {
//   await knex.destroy();
// });
