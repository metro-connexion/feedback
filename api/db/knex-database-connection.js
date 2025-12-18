import Knex from "knex";
import _ from "lodash";
import pg from "pg";

import { config } from "../config.js";
import * as knexConfigs from "./knexfile.js";

const types = pg.types;

/*
By default, node-postgres casts a DATE value (PostgreSQL type) as a Date Object (JS type).
But, when dealing with dates with no time (such as birthdate for example), we want to
deal with a 'YYYY-MM-DD' string.
*/
types.setTypeParser(types.builtins.DATE, (value) => value);

/*
The method Bookshelf.Model.count(), used with PostgreSQL, can sometimes returns a BIGINT.
This is not the common case (maybe in several years).
Even though, Bookshelf/Knex have decided to return String.
We decided to parse the result of #count() method to force a resulting INTEGER.

Links :
- problem: https://github.com/bookshelf/bookshelf/issues/1275
- solution: https://github.com/brianc/node-pg-types
*/
// Use explicit radix and handle null values safely
types.setTypeParser(types.builtins.INT8, (value) => (value === null ? null : Number.parseInt(value, 10)));

const { environment } = config;

const knexConfig = knexConfigs.default[environment];
const configuredKnex = Knex(knexConfig);

/**
 * Ferme la connexion Knex configurée.
 * @returns {Promise<void>}
 */
async function disconnect() {
  return configuredKnex.destroy();
}

const _dbSpecificQueries = {
  // Query that filters by database/catalog (requires a binding)
  listTablesWithCatalog:
    "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?",
  // Query that does not filter by catalog (no binding needed)
  listTablesWithoutCatalog: "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()",
  emptyTableQuery: "TRUNCATE ",
};

/**
 * List all table names of the current database.
 * Returns an array of table names (strings).
 * This function first tries to get the database name from the Knex client configuration,
 * Switching between two different queries depending on whether the database name is available.
 * @returns {Promise<string[]>} Promise resolving to an array of table names.
 */
async function listAllTableNamesOfDatabase() {
  const client = configuredKnex.client || {};

  // Essayer d'obtenir le nom de la base via plusieurs sources possibles.
  let databaseName = null;
  if (typeof client.database === "function") {
    try {
      databaseName = client.database();
    } catch {
      databaseName = null;
    }
  }

  if (!databaseName && client.config && client.config.connection) {
    const conn = client.config.connection;
    if (typeof conn === "object") {
      databaseName = conn.database || conn.dbname || null;
    }
  }

  let sql;
  let bindings = [];
  if (databaseName) {
    sql = _dbSpecificQueries.listTablesWithCatalog;
    bindings = [databaseName];
  } else {
    sql = _dbSpecificQueries.listTablesWithoutCatalog;
  }

  // Use centralised query and handle different shapes of raw result
  const resultSet = await configuredKnex.raw(sql, bindings);

  // Knex/pg returns { rows: [...] }, other drivers/versions can return an array
  const rows = resultSet.rows || resultSet[0] || resultSet;
  return _.map(rows, "table_name");
}

/**
 * Vide toutes les tables de la base (sauf celles de migration de Knex).
 * Utilise TRUNCATE ... RESTART IDENTITY CASCADE pour réinitialiser les séquences.
 * @returns {Promise<any>} Promise du raw SQL exécuté.
 */
async function emptyAllTablesOfDatabase() {
  const tableNames = await listAllTableNamesOfDatabase();
  const tablesToDelete = _.without(
    tableNames,
    "knex_migrations",
    "knex_migrations_lock",
  );

  if (!tablesToDelete || tablesToDelete.length === 0) {
    return Promise.resolve();
  }

  // Escape double quotes inside table names and wrap each identifier with double quotes.
  const tables = _.map(tablesToDelete, (tableToDelete) => `"${String(tableToDelete).replace(/"/g, "\"\"")}"`).join(", ");

  const query = `${_dbSpecificQueries.emptyTableQuery}${tables} RESTART IDENTITY CASCADE;`;
  return configuredKnex.raw(query);
}

export { disconnect, emptyAllTablesOfDatabase, configuredKnex as knex };
