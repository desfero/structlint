import { readFileSync } from "fs";
import { basename, dirname, join, resolve, sep, extname } from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { DeepReadonly, Demand, File, Folder } from "../types";
import { getImportType, IMPORT_TYPE, isFolder } from "../utils";
import { getLanguageExtensions } from "./utils";
import { FileParsingFailedError, FolderNotFoundError } from "../errors";

const internalRoot: Folder = {
  parent: undefined,
  path: "/",
  name: ".",
  files: {},
  folders: {},
};

const getRootFolder = (): DeepReadonly<Folder> => internalRoot;

/**
 * For the given path returns either Folder or File
 */
const getDemand = (path: string): DeepReadonly<Demand> =>
  getDemandInternal(path, internalRoot);

const getDemandInternal = (path: string, currentFolder: Folder): Demand => {
  const [current, ...rest] = path.split(sep);

  if (current === ".") {
    return currentFolder;
  }

  const file = currentFolder.files[current];

  // if the path is a file path return the file
  if (file) {
    return file;
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

  return getDemandInternal(join(...rest), folder);
};

const getFile = (path: string): DeepReadonly<File> => {
  return getFileInternal(path, internalRoot);
};

const getFileInternal = (path: string, root: Folder): File => {
  const fileName = basename(path);
  const dirName = dirname(path);

  const demand = getDemandInternal(dirName, root);

  if (!isFolder(demand)) {
    throw new FolderNotFoundError(path);
  }

  let file = demand.files[fileName];

  if (file === undefined) {
    file = demand.files[fileName] = {
      path: join(demand.path, fileName),
      name: fileName,
      parent: demand,
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

export { getDemand, getFile, babelParser, getRootFolder };
