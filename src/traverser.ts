import micromatch from "micromatch";

import { TFile, TDeepReadonly } from "./types";
import { TImportConfig } from "./config/schemas";
import { debug, nonNullable } from "./utils";
import { BABEL_PARSER, getParser } from "./parsers";

const traversalDebug = debug("traversal");

type FileWithMatchedImports = {
  file: TDeepReadonly<TFile>;
  matchedImports: string[];
  matchedConfig: TImportConfig;
};

/**
 * For some environments we need to adjust glob to catch more env specific imports
 *
 * For e.g. node env has a concept of barrel imports (index.js) that can be imported
 * just with folder name.
 *
 */
const adjustGlobToParser = (filePath: string, glob: string) => {
  const parser = getParser(filePath);

  nonNullable(parser);

  switch (parser.name) {
    case BABEL_PARSER:
      // to support barrel imports replace add
      // additional glob to match folder root
      if (glob.endsWith("/*")) {
        return [glob, `${glob.slice(0, -2)}`];
      }

      return glob;
    default:
      return glob;
  }
};

const findMatchedImports = (
  file: TDeepReadonly<TFile>,
  importConfig: TImportConfig,
) => {
  traversalDebug(
    `Finding matched imports in ${file.path} for ${importConfig.glob} glob`,
  );

  const glob = adjustGlobToParser(file.path, importConfig.glob);

  const matchedImports = micromatch(file.imports, glob);

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

export { findFilesWithImports, FileWithMatchedImports, findMatchedImports };
