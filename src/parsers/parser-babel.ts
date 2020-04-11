import { readFileSync } from "fs";
import { extname } from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { ParserPlugin } from "@babel/parser";
import isString from "lodash/fp/isString";

import { getLanguageExtensions } from "./utils";
import { FileParsingFailedError } from "../errors";
import { setFileImports } from "../store";
import { ImportDefinition, Parser } from "./types";

const babelPlugins: ParserPlugin[] = [
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
];

const getImports = (fileName: string, fileContent: string) => {
  const ast = parser.parse(fileContent, {
    sourceType: "unambiguous",
    sourceFilename: fileName,
    plugins: babelPlugins,
  });

  const imports: ImportDefinition[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      imports.push(path.node.source.value);
    },
    Import(path) {
      const parentCallExpression = path.findParent(parent =>
        parent.isCallExpression(),
      );

      if (
        // `findParent` won't cast the `NodeType` to `CallExpression`
        // therefore we need to check it second time for type-safety
        parentCallExpression.isCallExpression() &&
        "value" in parentCallExpression.node.arguments[0] &&
        isString(parentCallExpression.node.arguments[0].value)
      ) {
        const importPath = parentCallExpression.node.arguments[0].value;

        imports.push(importPath);
      }
    },
    VariableDeclarator(path) {
      const init = path.get("init");

      if (init.isCallExpression()) {
        const callee = init.get("callee");

        if (
          callee.isIdentifier() &&
          callee.node.name === "require" &&
          "value" in init.node.arguments[0] &&
          isString(init.node.arguments[0].value)
        ) {
          const importPath = init.node.arguments[0].value;

          imports.push(importPath);
        }
      }
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

const babelParser: Parser = { name: "babel", canParse, parse };

export { babelParser };
