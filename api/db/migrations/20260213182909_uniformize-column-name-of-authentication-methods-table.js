const TABLE_NAME = "authentication-methods";

/**
 * @param { import("knex").Knex } knex - The Knex instance
 * @returns { Promise<void> }
 */
async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.renameColumn("created_at", "createdAt");
    table.renameColumn("updated_at", "updatedAt");
  });
}

/**
 * @param { import("knex").Knex } knex - The Knex instance
 * @returns { Promise<void> }
 */
async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.renameColumn("createdAt", "created_at");
    table.renameColumn("updatedAt", "updated_at");
  });
}

export { down, up };
