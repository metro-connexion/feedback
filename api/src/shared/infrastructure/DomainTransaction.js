import { AsyncLocalStorage } from "node:async_hooks";

import { knex } from "../../../db/knex-database-connection.js";

const asyncLocalStorage = new AsyncLocalStorage();

class DomainTransaction {
  constructor(knexTransaction) {
    this.knexTransaction = knexTransaction;
  }

  /**
   * Execute a function within a transaction context.
   * If already within a transaction, reuses the existing transaction.
   * @param {Function} lambda - The function to execute within the transaction
   * @param {import('knex').Knex.TransactionConfig} transactionConfig - Optional transaction configuration
   * @returns {Promise<*>} The result of the lambda function
   */
  static execute(lambda, transactionConfig) {
    const existingConn = DomainTransaction.getConnection();
    if (existingConn.isTransaction) {
      return lambda();
    }
    return knex.transaction((trx) => {
      const domainTransaction = new DomainTransaction(trx);
      return asyncLocalStorage.run({ transaction: domainTransaction }, lambda);
    }, transactionConfig);
  }

  /**
   * Get the current Knex connection.
   * Returns the transaction connection if within a transaction context,
   * otherwise returns the standard Knex connection.
   * @returns {import('knex').Knex} The Knex connection or transaction
   */
  static getConnection() {
    const store = asyncLocalStorage.getStore();

    if (store?.transaction) {
      const domainTransaction = store.transaction;
      return domainTransaction.knexTransaction;
    }
    return knex;
  }
}

/**
 * Wraps a function to execute it within a transaction.
 * This allows you to mark a function as transactional without passing transaction parameters.
 * @template F
 * @param {F} func - The function to wrap
 * @param {import('knex').Knex.TransactionConfig=} transactionConfig - Optional transaction configuration
 * @returns {F} The wrapped function
 */
function withTransaction(func, transactionConfig) {
  return (...args) => DomainTransaction.execute(() => func(...args), transactionConfig);
}

export { asyncLocalStorage, DomainTransaction, withTransaction };
