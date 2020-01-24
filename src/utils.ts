import { partition } from "lodash/fp";
import { sep } from "path";
import * as globby from "globby";

/**
 *  Cast a `value` to exclude `null` and `undefined`.
 *  Throws if either `null` or `undefined` was passed
 */
function nonNullable<T>(
  value: T,
  message?: string,
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(
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

export { nonNullable, getPathFilesAndDirectories, getImportType, IMPORT_TYPE };
