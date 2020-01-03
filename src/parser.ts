import { readFileSync } from "fs";
import {sep, resolve} from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import {getFile, getFolder} from "./travelsar";
import {Folder} from "./types";

const root: Folder = {
    parent: undefined,
    path: "/",
    name: ".",
    files: {},
    folders: {},
};

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
        ]
    });

    const imports = [];

    traverse(ast, {
        ImportDeclaration(path) {
            imports.push(path.node.source.value);
        }
    });

    return imports;
};

const setFileImports = (rootMap: Folder, path: string[], relativeImports: string[]) => {
    const file = getFile(path, rootMap);

    file.imports = relativeImports.map(importPath => resolve(file.parent.path, importPath));
};

export const parse = (files: string[]) => {
    return files.reduce((acc, file) => {
        try {
            const fileBuffer = readFileSync(file);

            const fileContent = fileBuffer.toString();

            const relativeImports = getImports(file, fileContent);

            if (relativeImports.length) {
                const filePath = file.split(sep);

                setFileImports(acc, filePath, relativeImports);

                return acc;
            }

            return acc;
        } catch (e) {
            throw new Error(`Failed to parse "${file}"\n${e.message}`);
        }
    }, root);
};
