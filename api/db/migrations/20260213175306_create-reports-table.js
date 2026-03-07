const TABLE_NAME = "reports";

/**
 * @param { import("knex").Knex } knex - The Knex instance
 * @returns { Promise<void> }
 */
async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments("id").primary();
    table.string("title").notNullable().comment("The title of the report");
    table.text("description").notNullable().comment("The description of the report");
    table.integer("typeId").notNullable().references("id").inTable("report-types").onDelete("CASCADE").comment("The type of the report");
    table.integer("createdByUserId").notNullable().references("id").inTable("users").onDelete("CASCADE").comment("The user who created the report");
    table.integer("reportedUserId").nullable().references("id").inTable("users").onDelete("CASCADE").comment("The user who is being reported");
    table.boolean("isResolved").defaultTo(false).comment("Whether the report has been resolved");
    table.boolean("isOpen").defaultTo(true).comment("Whether the report is open");
    table.integer("resolverUserId").references("id").inTable("users").onDelete("SET NULL").comment("The user who resolved the report");
    table.timestamp("resolvedAt").comment("The timestamp when the report was resolved");
    table.integer("closedByUserId").references("id").inTable("users").onDelete("SET NULL").comment("The user who closed the report");
    table.timestamp("closedAt").comment("The timestamp when the report was closed");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
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
