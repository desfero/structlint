import chalk from "chalk";

import { prettyPrintViolations, printResult } from "./formatter";
import { loadConfigs } from "../config/loadConfigs";
import { debug } from "../utils";
import { importsTask } from "../tasks/importsTask";

const log = console.log;
const error = console.error;

const logBold = chalk.bold;

const terminate = () => {
  // terminate the process with non zero exit code
  process.exit(1);
};

const run = async () => {
  try {
    debug("cli", `Root: ${process.cwd()}`);

    log("Resolving configs...");
    const configs = loadConfigs();

    if (configs.length === 0) {
      log(logBold.red("You need to specify structure config to run linter."));
      terminate();
    }

    log("Linting folder structure...");
    const violationsNested = await Promise.all(
      configs.map(importsTask.runTask),
    );
    const violations = violationsNested.flat(Infinity);
    log(printResult(violations));

    if (violations.length > 0) {
      log(prettyPrintViolations(violations));
      terminate();
    }
  } catch (e) {
    error(e);
    terminate();
  }
};

export { run };
