import { USER_TYPES } from "../../src/identities-access-management/constants.js";

const TABLE_NAME = "users";

/**
 * @param { import("knex").Knex } knex - The Knex instance
 * @returns { Promise<void> }
 */
async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments("id").primary().comment("Primary key");
    table.boolean("isActive").defaultTo(false).comment("Indicates if the user is active");
    table.string("firstname").notNullable().comment("User first name");
    table.string("lastname").notNullable().comment("User last name");
    table.string("username").unique().notNullable().comment("Public user name displayed on platform");
    table.string("email").notNullable().unique().comment("User email address");
    table.string("userType").notNullable().comment("The user type, with different rules").defaultTo(USER_TYPES.USER);
    table.timestamp("lastLoggedAt").nullable().comment("The last time the user logged in");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
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
