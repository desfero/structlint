import { join, sep } from "path";

import { Config } from "../config";
import {
  debug,
  getImportType,
  getPathFilesAndDirectories,
  IMPORT_TYPE,
} from "../utils";
import { parse } from "../parsers";
import { analyze } from "../analyzer";

const importTaskDebug = debug("imports-task");

const runTask = async ({ relativePath, structure }: Config) => {
  const taskNested = await Promise.all(
    structure.map(async structure => {
      const path = join(relativePath, structure.path);

      importTaskDebug(`Running task for ${path}`);

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

      importTaskDebug(
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

      importTaskDebug(
        `Allowed imports ${allowedImports.map(imp => imp.glob).join(", ")}`,
      );

      const { files, directories } = await getPathFilesAndDirectories(path, {
        expandDirectories: structure.recursive,
      });

      importTaskDebug(`Files to parse ${files.join(", ")}`);

      importTaskDebug(`Directories to lint ${directories.join(", ")}`);

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

/**
 * Task to analyse import rules validity
 */
const importsTask = {
  name: "imports-task",
  runTask,
};

export { importsTask };
