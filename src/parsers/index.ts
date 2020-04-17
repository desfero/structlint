import { babelParser } from "./parser-babel";
import { MoreThanOneParserError } from "../errors";
import { TParser } from "./types";

const parsers: readonly TParser[] = [babelParser];

const parse = (filePath: string) => {
  const matchedParsers = parsers.filter(parser => parser.canParse(filePath));

  if (matchedParsers.length > 1) {
    throw new MoreThanOneParserError(
      filePath,
      matchedParsers.map(parser => parser.name),
    );
  }

  if (matchedParsers.length === 0) {
    return;
  }

  const parser = matchedParsers[0];

  return parser.parse(filePath);
};

export { parse, parsers };
