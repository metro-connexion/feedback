import { knex } from "../../knex-database-connection.js";

async function buildReportType({ name = "Default type" } = {}) {
  const [reportType] = await knex("report-types").insert({ name }).returning("*");
  return reportType;
}

export { buildReportType };
