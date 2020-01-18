import * as chalk from "chalk";
import { join, sep } from "path";

import { parse } from "./parsers";
import { analyze } from "./analyzer";
import { prettyPrintViolations, printResult } from "./printer";
import { Config, loadConfigs } from "./config";
import { getRootFolder } from "./parsers/parser-babel";
import { getPathFilesAndDirectories } from "./utils";

const log = console.log;
const error = console.error;
const debug = console.debug;

const logBold = chalk.bold;

const terminate = () => {
  // terminate the process with non zero exit code
  process.exit(1);
};

const runTask = async ({ relativePath, structure }: Config) => {
  const taskNested = await Promise.all(
    structure.map(async structure => {
      const path = join(relativePath, structure.path);

      const disallowedImports = structure.disallowedImports.map(imp => ({
        ...imp,
        glob: join(sep, relativePath, imp.glob),
      }));

      const { files, directories } = await getPathFilesAndDirectories(path, {
        expandDirectories: structure.recursive,
      });

      files.forEach(parse);

      const root = getRootFolder();

      return await analyze([path, ...directories], disallowedImports, root);
    }),
  );

  return taskNested.flat(Infinity);
};

const run = async () => {
  try {
    debug(`Root: ${process.cwd()}`);

    log("Resolving configs...");

    const configs = loadConfigs();

    if (configs.length === 0) {
      log(logBold.red("You need to specify structure config to run linter."));
      terminate();
    }

    log("Linting folder structure...");

    const violationsNested = await Promise.all(configs.map(runTask));

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
