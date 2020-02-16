import { readFileSync } from "fs";
import { extname } from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

import { getLanguageExtensions } from "./utils";
import { FileParsingFailedError } from "../errors";
import { setFileImports } from "../store";

const getImports = (fileName: string, fileContent: string) => {
  const ast = parser.parse(fileContent, {
    sourceType: "unambiguous",
    sourceFilename: fileName,
    plugins: [
      "typescript",
      "jsx",
      "jsx",
      "doExpressions",
      "objectRestSpread",
      "classProperties",
      "exportDefaultFrom",
      "exportNamespaceFrom",
      "asyncGenerators",
      "functionBind",
      "functionSent",
      "dynamicImport",
      "numericSeparator",
      "importMeta",
      "optionalCatchBinding",
      "optionalChaining",
      "classPrivateProperties",
      ["pipelineOperator", { proposal: "minimal" }],
      "nullishCoalescingOperator",
      "bigInt",
      "throwExpressions",
      "logicalAssignment",
      "classPrivateMethods",
      "v8intrinsic",
      "partialApplication",
      "decorators-legacy",
    ],
  });

  const imports: string[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      imports.push(path.node.source.value);
    },
  });

  return imports;
};

const parse = (filePath: string): void => {
  try {
    const fileBuffer = readFileSync(filePath);

    const fileContent = fileBuffer.toString();

    const relativeImports = getImports(filePath, fileContent);

    if (relativeImports.length) {
      setFileImports(filePath, relativeImports);
    }
  } catch (e) {
    throw new FileParsingFailedError(filePath, e.message);
  }
};

const extensions = getLanguageExtensions([
  "JavaScript",
  "JSX",
  "TSX",
  "TypeScript",
]);

const canParse = (filePath: string): boolean => {
  const ext = extname(filePath);

  return extensions.includes(ext);
};

const babelParser = { name: "babel", canParse, parse };

export { babelParser };
