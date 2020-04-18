import micromatch from "micromatch";

import { TFile, TDeepReadonly } from "./types";
import { debug } from "./utils";
import { TImportConfig } from "./config/types";
import { TImportDefinition } from "./parsers/types";

const traversalDebug = debug("traversal");

type TFileWithMatchedImports = {
  file: TDeepReadonly<TFile>;
  matchedImports: string[];
  matchedConfig: TImportConfig;
};

const findMatchedImports = (
  imports: readonly string[],
  glob: string,
): TImportDefinition[] => {
  console.log(imports);
  const matchedImports = micromatch(imports, glob);
  traversalDebug(
    `Found ${matchedImports.length} matched imports.\n ${matchedImports.join(
      "\n",
    )}`,
  );

  return matchedImports;
};

const findFilesWithImports = (
  files: TDeepReadonly<TFile>[],
  importConfigs: TImportConfig[],
): TFileWithMatchedImports[] =>
  files.flatMap(file =>
    importConfigs.flatMap(config => {
      traversalDebug(
        `Finding matched imports in ${file.path} for ${config.glob} glob`,
      );
      const matchedImports = findMatchedImports(file.imports, config.glob);

      if (matchedImports.length > 0) {
        return { file, matchedImports, matchedConfig: config };
      }

      return [];
    }),
  );

export { findFilesWithImports, TFileWithMatchedImports, findMatchedImports };
