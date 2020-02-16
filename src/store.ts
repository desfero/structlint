import defaultTo from "lodash/fp/defaultTo";

import { DeepReadonly, Demand, File, Folder } from "./types";
import { basename, dirname, join, resolve, sep } from "path";
import { getImportType, IMPORT_TYPE, isFolder } from "./utils";
import { FolderNotFoundError } from "./errors";

const storeInternalRoot: Folder = {
  parent: undefined,
  path: "/",
  name: ".",
  files: {},
  folders: {},
};

const defaultToEmpty = defaultTo({});

/**
 * For the given path returns either Folder or File
 */
const getDemand = (path: string): DeepReadonly<Demand> =>
  getDemandInternal(path, storeInternalRoot);

const getDemandInternal = (path: string, currentFolder: Folder): Demand => {
  const [current, ...rest] = path.split(sep);

  if (current === ".") {
    return currentFolder;
  }

  const file = currentFolder.files[current];

  // if the path is a file path return the file
  if (file) {
    return file;
  }

  let folder = currentFolder.folders[current];

  if (folder === undefined) {
    folder = currentFolder.folders[current] = {
      path: join(currentFolder.path, current),
      name: current,
      files: {},
      folders: {},
      parent: currentFolder,
    };
  }

  return getDemandInternal(join(...rest), folder);
};

/**
 * Recursively gets the file for the given path.
 * Throws FileNotFoundError in case the file metadata not yet provided or the file doesn't exist
 */
const getFile = (path: string): DeepReadonly<File> => {
  const file = getFileInternal(path, storeInternalRoot);

  if (!file) {
    throw new Error("File missing");
  }

  return file;
};

/**
 * Recursively gets the file for the given path.
 * In case file is not yet fulfilled returns `undefined`
 * @internal Use in store.ts only
 */
const getFileInternal = (path: string, root: Folder): File | undefined => {
  const fileName = basename(path);
  const dirName = dirname(path);

  const demand = getDemandInternal(dirName, root);

  if (!isFolder(demand)) {
    throw new FolderNotFoundError(path);
  }

  return demand.files[fileName];
};

const getFileInitialFile = (name: string, parent: Folder) => ({
  name,
  parent,
  path: join(parent.path, name),
  imports: [],
});

/**
 * Updates the file current state.
 * Merges the `updatedFile` with the current file state
 */
const setFile = (path: string, updateFile: (file: File) => Partial<File>) => {
  const fileName = basename(path);
  const dirName = dirname(path);

  const demand = getDemandInternal(dirName, storeInternalRoot);

  if (!isFolder(demand)) {
    throw new FolderNotFoundError(path);
  }

  const currentFile: File = {
    ...getFileInitialFile(fileName, demand),
    ...defaultToEmpty(demand.files[fileName]),
  };

  demand.files[fileName] = {
    ...currentFile,
    ...updateFile(currentFile),
  };
};

/**
 * Set imports for the given file under provided path.
 */
const setFileImports = (path: string, relativeImports: string[]) => {
  setFile(path, currentFile => ({
    imports: relativeImports.map(importPath => {
      const importType = getImportType(importPath);

      if (importType === IMPORT_TYPE.RELATIVE) {
        return resolve(currentFile.parent.path, importPath);
      }

      return importPath;
    }),
  }));
};

export { setFileImports, getFile, getDemand };
