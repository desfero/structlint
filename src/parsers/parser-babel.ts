import { readFileSync } from "fs";
import { basename, dirname, join, resolve, sep, extname } from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { DeepReadonly, File, Folder } from "../types";
import { getImportType, IMPORT_TYPE } from "../utils";
import { getLanguageExtensions } from "./utils";

const internalRoot: Folder = {
  parent: undefined,
  path: "/",
  name: ".",
  files: {},
  folders: {},
};

const getRootFolder = (): DeepReadonly<Folder> => internalRoot;

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

const setFileImports = (path: string, relativeImports: string[]) => {
  const file = getFileInternal(path, internalRoot);

  file.imports = relativeImports.map(importPath => {
    const importType = getImportType(importPath);

    if (importType === IMPORT_TYPE.RELATIVE) {
      return resolve(file.parent.path, importPath);
    }

    return importPath;
  });
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
    throw new Error(`Failed to parse "${filePath}"\n${e.message}`);
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

export { getFolder, getFile, babelParser, getRootFolder };
