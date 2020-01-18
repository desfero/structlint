import { babelParser } from "./parser-babel";

const parsers = [babelParser];

const parse = (filePath: string) => {
  const matchedParsers = parsers.filter(parser => parser.canParse(filePath));

  if (matchedParsers.length > 1) {
    throw new Error(
      `More than one parsed matched "${filePath}": ${matchedParsers
        .map(parser => parser.name)
        .join(", ")}.`,
    );
  }

  if (matchedParsers.length === 0) {
    return;
  }

  const parser = matchedParsers[0];

  return parser.parse(filePath);
};

export { parse, parsers };
