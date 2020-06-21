import micromatch from "micromatch";

import { TFile, TDeepReadonly } from "./types";
import { TImportConfig } from "./config/schemas";
import { debug, micromatchNot, nonNullable } from "./utils";
import { BABEL_PARSER, getParser } from "./parsers";

const traversalDebug = debug("traversal");

type Match = { config: TImportConfig; import: string };

type FileWithMatchedImports = {
  file: TDeepReadonly<TFile>;
  matchedImport: string;
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

      return [glob];
    default:
      return [glob];
  }
};

const findMatchedImports = (
  file: TDeepReadonly<TFile>,
  importConfig: TImportConfig[],
  negate: boolean,
) => {
  traversalDebug(
    `Finding matched imports in ${file.path} for ${importConfig
      .map(c => c.glob)
      .join(", ")} globs`,
  );

  const adjustedConfigs = importConfig.map(config => {
    const globs = adjustGlobToParser(file.path, config.glob);

    return { config, globs };
  });

  const matches: Match[] = [];

  const match = negate ? micromatchNot : micromatch;

  match(
    file.imports,
    adjustedConfigs.flatMap(aC => aC.globs),
    {
      onMatch: ({ glob, input }) => {
        const { config } = adjustedConfigs.find(c => c.globs.includes(glob))!;

        // we filter all matches that are related to the same config
        // single config can be adjusted to more than one glob
        // see `adjustGlobToParser` function
        if (
          !matches.some(
            match => match.config === config && match.import === input,
          )
        ) {
          matches.push({ config, import: input });
        }
      },
    },
  );

  traversalDebug(
    `Found ${matches.length} matched imports in ${file.path}.\n ${matches.join(
      "\n",
    )}`,
  );

  return matches;
};

const findFilesWithImports = (
  files: TDeepReadonly<TFile>[],
  importConfigs: TImportConfig[],
  negate: boolean = false,
): FileWithMatchedImports[] =>
  files.flatMap(file => {
    const matches = findMatchedImports(file, importConfigs, negate);

    if (matches.length > 0) {
      return matches.map(match => ({
        file,
        matchedImport: match.import,
        matchedConfig: match.config,
      }));
    }

    return [];
  });

export { findFilesWithImports, FileWithMatchedImports, findMatchedImports };
