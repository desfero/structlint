import { basename, dirname, join, resolve, sep } from "path";
import defaultTo from "lodash/fp/defaultTo";

import { TDeepReadonly, TDemand, TFile, TFolder } from "./types";
import { getImportType, IMPORT_TYPE, isFolder } from "./utils";
import { FileNotFoundError, FolderNotFoundError } from "./errors";
import { TImportDefinition } from "./parsers/types";

const storeInternalRoot: TFolder = {
  parent: undefined,
  path: "/",
  name: ".",
  files: {},
  folders: {},
};

const defaultToEmpty = defaultTo({});

// TODO: Refactor to just throw in case folder do not exist and on top of that introduce `set` method
const getDemandInternal = (path: string, currentFolder: TFolder): TDemand => {
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
 * For the given path returns either TFolder or TFile
 */
const getDemand = (path: string): TDeepReadonly<TDemand> =>
  getDemandInternal(path, storeInternalRoot);

/**
 * Recursively gets the file for the given path.
 * In case file is not yet fulfilled returns `undefined`
 * @internal Use in store.ts only
 */
const getFileInternal = (path: string, root: TFolder): TFile | undefined => {
  const fileName = basename(path);
  const dirName = dirname(path);

  const demand = getDemandInternal(dirName, root);

  if (!isFolder(demand)) {
    throw new FolderNotFoundError(path);
  }

  return demand.files[fileName];
};
/**
 * Recursively gets the file for the given path.
 * Throws FileNotFoundError in case the file metadata not yet provided or the file doesn't exist
 */
const getFile = (path: string): TDeepReadonly<TFile> => {
  const file = getFileInternal(path, storeInternalRoot);

  if (!file) {
    throw new FileNotFoundError(path);
  }

  return file;
};

const getFileInitialFile = (name: string, parent: TFolder) => ({
  name,
  parent,
  path: join(parent.path, name),
  imports: [],
});

/**
 * Updates the file current state.
 * Merges the `updatedFile` with the current file state
 */
const setFile = (path: string, updateFile: (file: TFile) => Partial<TFile>) => {
  const fileName = basename(path);
  const dirName = dirname(path);

  const demand = getDemandInternal(dirName, storeInternalRoot);

  if (!isFolder(demand)) {
    throw new FolderNotFoundError(path);
  }

  const currentFile: TFile = {
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
const setFileImports = (path: string, relativeImports: TImportDefinition[]) => {
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
