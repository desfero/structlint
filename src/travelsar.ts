import { join, basename, dirname, sep } from "path";
import * as micromatch from "micromatch";

import { Folder, File } from "./types";
import { nonNullable } from "./utils";

const getFolder = (path: string, rootMap: Folder): Folder => {
  const [current, ...rest] = path.split(sep);

  if (current === ".") {
    return rootMap;
  }

  let folder = rootMap.folders[current];

  if (folder === undefined) {
    folder = rootMap.folders[current] = {
      path: join(rootMap.path, current),
      name: current,
      files: {},
      folders: {},
      parent: rootMap,
    };
  }

  return getFolder(join(...rest), folder);
};

const getFile = (path: string, rootMap: Folder): File => {
  const fileName = basename(path);
  const dirName = dirname(path);

  const folder = getFolder(dirName, rootMap);

  let file = folder.files[fileName];

  if (file === undefined) {
    file = folder.files[fileName] = {
      path: join(folder.path, fileName),
      name: fileName,
      parent: folder,
      imports: [],
    };
  }

  return file;
};

type FileWithMatchedImports = { file: File; matchedImports: string[] };

const findFilesWithImports = (
  { files }: Folder,
  importsGlobs: string[],
): FileWithMatchedImports[] => {
  return Object.values(files).flatMap(file => {
    nonNullable(file);

    const matchedImports = micromatch(file.imports, importsGlobs);

    if (matchedImports.length > 0) {
      return [{ file, matchedImports }];
    }

    return [];
  });
};

export { getFolder, getFile, findFilesWithImports, FileWithMatchedImports };
