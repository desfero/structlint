import micromatch from "micromatch";

import { File, DeepReadonly } from "./types";
import { ImportConfig } from "./config";

type FileWithMatchedImports = {
  file: DeepReadonly<File>;
  matchedImports: string[];
  matchedConfig: ImportConfig;
};

const findFilesWithImports = (
  files: DeepReadonly<File>[],
  importConfigs: ImportConfig[],
): FileWithMatchedImports[] =>
  files.flatMap(file =>
    importConfigs.flatMap(config => {
      const matchedImports = micromatch(file.imports, config.glob);

      if (matchedImports.length > 0) {
        return { file, matchedImports, matchedConfig: config };
      }

      return [];
    }),
  );

export { findFilesWithImports, FileWithMatchedImports };
