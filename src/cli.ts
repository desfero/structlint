import chalk from "chalk";
import { join, sep } from "path";

import { parse } from "./parsers";
import { analyze } from "./analyzer";
import { prettyPrintViolations, printResult } from "./formatter";
import { Config, loadConfigs } from "./config";
import {
  debug,
  getImportType,
  getPathFilesAndDirectories,
  IMPORT_TYPE,
} from "./utils";

const log = console.log;
const error = console.error;

const logBold = chalk.bold;

const terminate = () => {
  // terminate the process with non zero exit code
  process.exit(1);
};

const runTask = async ({ relativePath, structure }: Config) => {
  const taskNested = await Promise.all(
    structure.map(async structure => {
      const path = join(relativePath, structure.path);

      debug("task", `Running task for ${path}`);

      // remap relative import paths from relative to absolute
      const disallowedImports = structure.disallowedImports.map(imp => {
        const importType = getImportType(imp.glob);

        if (importType === IMPORT_TYPE.RELATIVE) {
          return {
            ...imp,
            glob: join(sep, relativePath, imp.glob),
          };
        }

        return imp;
      });

      debug(
        "task",
        `Disallowed imports ${disallowedImports
          .map(imp => imp.glob)
          .join(", ")}`,
      );

      // remap relative import paths from relative to absolute
      const allowedImports = structure.allowedImports.map(imp => {
        const importType = getImportType(imp.glob);

        if (importType === IMPORT_TYPE.RELATIVE) {
          return {
            ...imp,
            glob: join(sep, relativePath, imp.glob),
          };
        }

        return imp;
      });

      debug(
        "task",
        `Allowed imports ${allowedImports.map(imp => imp.glob).join(", ")}`,
      );

      const { files, directories } = await getPathFilesAndDirectories(path, {
        expandDirectories: structure.recursive,
      });

      debug("task", `Files to parse ${files.join(", ")}`);

      debug("task", `Directories to lint ${directories.join(", ")}`);

      files.forEach(parse);

      return await analyze(
        [path, ...directories],
        disallowedImports,
        allowedImports,
      );
    }),
  );

  return taskNested.flat(Infinity);
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
