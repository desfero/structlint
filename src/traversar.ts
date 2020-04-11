import micromatch from "micromatch";

import { File, DeepReadonly } from "./types";
import { ImportConfig } from "./config";
import { debug } from "./utils";

const traversalDebug = debug("traversal");

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
      const matchedImports = findMatchedImports(file, config);

      if (matchedImports.length > 0) {
        return { file, matchedImports, matchedConfig: config };
      }

      return [];
    }),
  );

const findMatchedImports = (
  file: DeepReadonly<File>,
  importConfig: ImportConfig,
) => {
  traversalDebug(
    `Finding matched imports in ${file.path} for ${importConfig.glob} glob`,
  );

  const matchedImports = micromatch(file.imports, importConfig.glob);

  traversalDebug(
    `Found ${matchedImports.length} matched imports.\n ${matchedImports.join(
      "\n",
    )}`,
  );

  return matchedImports;
};

export { findFilesWithImports, FileWithMatchedImports, findMatchedImports };
