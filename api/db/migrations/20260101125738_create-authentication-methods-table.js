const TABLE_NAME = "authentication-methods";

/**
 * @param { import("knex").Knex } knex - The Knex instance
 * @returns { Promise<void> }
 */
async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments("id").primary();
    table.integer("userId").notNullable().references("id").inTable("users").onDelete("CASCADE").comment("Reference to the user");
    table.string("identityProvider").notNullable().comment("The identity provider (e.g., google, facebook, or login)");
    table.string("hashedPassword").nullable().comment("Password when identityProvider is login").defaultTo(null);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.unique(["userId", "identityProvider"]);
  });
};

/**
 * @param { import("knex").Knex } knex - The Knex instance
 * @returns { Promise<void> }
 */
async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
