import partition from "lodash/fp/partition";
import { sep } from "path";
import { debug as debugP } from "debug";
import globby from "globby";
import compact from "lodash/fp/compact";
import curry from "lodash/fp/curry";

import { DeepReadonly, Folder, Demand } from "./types";
import { StructlintError } from "./errors";

const structLintDebug = debugP("struct-lint");

/**
 *  Cast a `value` to exclude `null` and `undefined`.
 *  Throws if either `null` or `undefined` was passed
 */
function nonNullable<T>(
  value: T,
  message?: string,
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new StructlintError(
      message || `Non nullable values expected, received ${value}`,
    );
  }
}

type TOptions = { expandDirectories: boolean };

const getPathFilesAndDirectories = async (
  path: string,
  { expandDirectories }: TOptions,
) => {
  const filesAndFolders = await globby(path, {
    expandDirectories,
    onlyFiles: false,
    gitignore: true,
    markDirectories: true,
  });

  const [directories, files] = partition(
    path => path.endsWith(sep),
    filesAndFolders,
  );

  return { directories, files };
};

/**
 * Check if a given demand is a folder
 */
const isFolder = (
  demand: DeepReadonly<Demand>,
): demand is DeepReadonly<Folder> => "folders" in demand;

/**
 * Get all files of a given demand.
 * If demand is a file itself wraps the file into array
 */
const getFiles = (demand: DeepReadonly<Demand>) => {
  if (!isFolder(demand)) {
    return [demand];
  }

  return compact(Object.values(demand.files));
};

enum IMPORT_TYPE {
  NAMED = "named",
  RELATIVE = "relative",
  ABSOLUTE = "absolute",
}

const getImportType = (importPath: string) => {
  if (importPath.startsWith(".")) {
    return IMPORT_TYPE.RELATIVE;
  }

  if (importPath.startsWith("/")) {
    return IMPORT_TYPE.ABSOLUTE;
  }

  return IMPORT_TYPE.NAMED;
};

const debug = curry((module: string, message: string) =>
  structLintDebug.extend(module)(message),
);

export {
  nonNullable,
  getPathFilesAndDirectories,
  getImportType,
  IMPORT_TYPE,
  debug,
  isFolder,
  getFiles,
};
