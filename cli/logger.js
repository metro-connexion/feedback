import chalk from "chalk";
import ora from "ora";

function info(msg) {
  console.log(chalk.blue("ℹ"), msg);
}

function success(msg) {
  console.log(chalk.green("✔"), msg);
}

function warn(msg) {
  console.log(chalk.yellow("⚠"), msg);
}

function error(msg) {
  console.error(chalk.red("✖"), msg);
}

function createSpinner(text) {
  return ora({ text }).start();
}

export const logger = {
  info,
  success,
  warn,
  error,
  spinner: createSpinner,
};
