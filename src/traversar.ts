import micromatch from "micromatch";

import { File, DeepReadonly } from "./types";
import { debug } from "./utils";
import { TImportConfig } from "./config/types";

const traversalDebug = debug("traversal");

type FileWithMatchedImports = {
  file: DeepReadonly<File>;
  matchedImports: string[];
  matchedConfig: TImportConfig;
};

const findFilesWithImports = (
  files: DeepReadonly<File>[],
  importConfigs: TImportConfig[],
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
  importConfig: TImportConfig,
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
