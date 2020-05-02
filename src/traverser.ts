import micromatch from "micromatch";

import { File, DeepReadonly } from "./types";
import { ImportConfig } from "./config";
import { debug, nonNullable } from "./utils";
import { BABEL_PARSER, getParser } from "./parsers";

const traversalDebug = debug("traversal");

type FileWithMatchedImports = {
  file: DeepReadonly<File>;
  matchedImports: string[];
  matchedConfig: ImportConfig;
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

export const findMatchedImports = (
  file: DeepReadonly<File>,
  importConfig: ImportConfig,
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

export { findFilesWithImports, FileWithMatchedImports, findMatchedImports };
