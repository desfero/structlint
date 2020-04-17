import micromatch from "micromatch";

import { TFile, TDeepReadonly } from "./types";
import { debug } from "./utils";
import { TImportConfig } from "./config/types";

const traversalDebug = debug("traversal");

type TFileWithMatchedImports = {
  file: TDeepReadonly<TFile>;
  matchedImports: string[];
  matchedConfig: TImportConfig;
};

const findFilesWithImports = (
  files: TDeepReadonly<TFile>[],
  importConfigs: TImportConfig[],
): TFileWithMatchedImports[] =>
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
  file: TDeepReadonly<TFile>,
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

export { findFilesWithImports, TFileWithMatchedImports, findMatchedImports };
