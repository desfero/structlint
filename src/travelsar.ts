import * as micromatch from "micromatch";

import { Folder, File, DeepReadonly } from "./types";
import { nonNullable } from "./utils";
import { ImportConfig } from "./config";

type FileWithMatchedImports = {
  file: DeepReadonly<File>;
  matchedImports: string[];
  matchedConfig: ImportConfig;
};

const findFilesWithImports = (
  { files }: DeepReadonly<Folder>,
  importConfigs: ImportConfig[],
): FileWithMatchedImports[] => {
  return Object.values(files).flatMap(file => {
    nonNullable(file);

    return importConfigs.flatMap(config => {
      const matchedImports = micromatch(file.imports, config.glob);

      if (matchedImports.length > 0) {
        return { file, matchedImports, matchedConfig: config };
      }

      return [];
    });
  });
};

export { findFilesWithImports, FileWithMatchedImports };
