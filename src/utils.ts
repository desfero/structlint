import partition from "lodash/fp/partition";
import { sep } from "path";
import { debug as debugP } from "debug";
import globby from "globby";
import compact from "lodash/fp/compact";
import curry from "lodash/fp/curry";

import { TDeepReadonly, TFolder, TDemand } from "./types";
import { StructlintError } from "./errors";
import micromatch from "micromatch";

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
  demand: TDeepReadonly<TDemand>,
): demand is TDeepReadonly<TFolder> => "folders" in demand;

/**
 * Get all files of a given demand.
 * If demand is a file itself wraps the file into array
 */
const getFiles = (demand: TDeepReadonly<TDemand>) => {
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

/**
 * A small wrapper around `micromatch` to negate matches.
 * Based on `micromatch.not` with a slightly difference in behaviour.
 */
const micromatchNot = (
  list: ReadonlyArray<string>,
  patterns: ReadonlyArray<string>,
  { onMatch, onResult, ...rest }: micromatch.Options = {},
) => {
  const result = new Set();

  const items: micromatch.Item[] = [];

  const onResultHandler = (item: micromatch.Item) => {
    if (onResult) {
      onResult(item);
    }

    items.push(item);
  };

  const matches = micromatch(list, patterns, {
    ...rest,
    onResult: onResultHandler,
  });

  for (const item of items) {
    if (!matches.includes(item.output) && !result.has(item.output)) {
      if (onMatch) {
        onMatch(item);
      }
      result.add(item.output);
    }
  }
  return Array.from(result);
};

export {
  nonNullable,
  getPathFilesAndDirectories,
  getImportType,
  IMPORT_TYPE,
  debug,
  isFolder,
  getFiles,
  micromatchNot,
};
