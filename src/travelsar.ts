import * as micromatch from "micromatch";

import { Folder, File } from "./types";
import { DeepReadonly, nonNullable } from "./utils";

type FileWithMatchedImports = {
  file: DeepReadonly<File>;
  matchedImports: string[];
};

const findFilesWithImports = (
  { files }: DeepReadonly<Folder>,
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

export { findFilesWithImports, FileWithMatchedImports };
