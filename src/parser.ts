import { readFileSync } from "fs";
import { basename, dirname, join, resolve, sep } from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { File, Folder } from "./types";
import { DeepReadonly } from "./utils";

const internalRoot: Folder = {
  parent: undefined,
  path: "/",
  name: ".",
  files: {},
  folders: {},
};

const getFolder = (
  path: string,
  root: DeepReadonly<Folder>,
): DeepReadonly<Folder> => {
  if (internalRoot !== root) {
    throw new Error("Invalid root object passed.");
  }

  return getFolderInternal(path, internalRoot);
};

const getFolderInternal = (path: string, currentFolder: Folder): Folder => {
  const [current, ...rest] = path.split(sep);

  if (current === ".") {
    return currentFolder;
  }

  let folder = currentFolder.folders[current];

  if (folder === undefined) {
    folder = currentFolder.folders[current] = {
      path: join(currentFolder.path, current),
      name: current,
      files: {},
      folders: {},
      parent: currentFolder,
    };
  }

  return getFolderInternal(join(...rest), folder);
};

const getFile = (
  path: string,
  root: DeepReadonly<Folder>,
): DeepReadonly<File> => {
  if (internalRoot !== root) {
    throw new Error("Invalid root object passed.");
  }

  return getFileInternal(path, internalRoot);
};

const getFileInternal = (path: string, root: Folder): File => {
  const fileName = basename(path);
  const dirName = dirname(path);

  const folder = getFolderInternal(dirName, root);

  let file = folder.files[fileName];

  if (file === undefined) {
    file = folder.files[fileName] = {
      path: join(folder.path, fileName),
      name: fileName,
      parent: folder,
      imports: [],
    };
  }

  return file;
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

const setFileImports = (
  path: string,
  relativeImports: string[],
  root: Folder,
) => {
  const file = getFileInternal(path, root);

  file.imports = relativeImports.map(importPath =>
    resolve(file.parent.path, importPath),
  );

  return root;
};

const parse = (files: string[]): DeepReadonly<Folder> => {
  return files.reduce((acc, file) => {
    try {
      const fileBuffer = readFileSync(file);

      const fileContent = fileBuffer.toString();

      const relativeImports = getImports(file, fileContent);

      if (relativeImports.length) {
        return setFileImports(file, relativeImports, acc);
      }

      return acc;
    } catch (e) {
      throw new Error(`Failed to parse "${file}"\n${e.message}`);
    }
  }, internalRoot);
};

export { getFolder, getFile, parse };
