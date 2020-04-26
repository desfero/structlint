import { babelParser, BABEL_PARSER } from "./parser-babel";
import { MoreThanOneParserError } from "../errors";
import { TParser } from "./types";

const parsers: readonly TParser[] = [babelParser];

const getParser = (filePath: string) => {
  const matchedParsers = parsers.filter(parser => parser.canParse(filePath));

  // add an extra safety to catch all edge cases where more than one parser can parse given file
  if (matchedParsers.length > 1) {
    throw new MoreThanOneParserError(
      filePath,
      matchedParsers.map(parser => parser.name),
    );
  }

  return matchedParsers.length === 1 ? matchedParsers[0] : undefined;
};

const parse = (filePath: string) => {
  const parser = getParser(filePath);

  if (!parser) {
    return;
  }

  return parser.parse(filePath);
};

export { parse, parsers, BABEL_PARSER, getParser };
