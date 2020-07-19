import chalk from "chalk";
import { program } from "commander";

import { prettyPrintViolations, prettyPrintViolationsByConfig, printResult } from "./formatter";
import { loadConfigs } from "../config/loadConfigs";
import { debug } from "../utils";
import { importsTask } from "../tasks/importsTask";
import { version } from "../../package.json";

const log = console.log;
const error = console.error;
const logBold = chalk.bold;

program
  .version(version)
  .description('Project structure linter')
  .option('--print-config', 'Group violations by configs', false);

const terminate = () => {
  // terminate the process with non zero exit code
  process.exit(1);
};

const run = async (argv: string[]) => {
  program.parse(argv);

  try {
    debug("cli", `Root: ${process.cwd()}`);

    log("Resolving configs...");
    const configs = loadConfigs();

    if (configs.length === 0) {
      log(logBold.red("You need to specify structure config to run linter."));
      terminate();
    }

    log("Linting folder structure...");

    const importTaskResults = await Promise.all(
      configs.map(importsTask.runTask),
    );

    const allViolations = importTaskResults.flatMap(({ violations}) => violations);

    log(printResult(allViolations));

    if (allViolations.length > 0) {
      if (program.printConfig) {
        log(importTaskResults.map(({ violations, config }) => prettyPrintViolationsByConfig(violations, config)).join("\n\n"))
      } else {
        log(prettyPrintViolations(allViolations))
      }

      terminate();
    }
  } catch (e) {
    error(e);
    terminate();
  }
};

export { run };
