import { knex } from "../../knex-database-connection.js";

async function buildReport({
  typeId,
  title = "The title",
  description = "The description",
  createdByUserId,
  reportedUserId = null,
  isResolved = false,
  isOpen = true,
  resolverUserId = null,
  resolvedAt = null,
  closedByUserId = null,
  closedAt = null,
} = {}) {
  const [report] = await knex("reports").insert({
    typeId,
    title,
    description,
    createdByUserId,
    reportedUserId,
    isResolved,
    isOpen,
    resolverUserId,
    resolvedAt,
    closedByUserId,
    closedAt,
  }).returning("*");
  return report;
}

export { buildReport };
