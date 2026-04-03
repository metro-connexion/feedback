import { createHealthCommand } from "./commands/health-command.js";
import { createLoginCommand } from "./commands/login-command.js";
import { createProgram } from "./program.js";

export function buildProgram() {
  const program = createProgram();

  program.addCommand(createHealthCommand());
  program.addCommand(createLoginCommand());

  return program;
}

// If run as CLI, parse args
if (process.argv && process.argv.length > 1 && import.meta.url === `file://${process.argv[1]}`) {
  const program = buildProgram();
  program.parse();
}

export default buildProgram;

