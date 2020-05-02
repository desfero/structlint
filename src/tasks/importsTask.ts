import { join, sep } from "path";

import {
  debug,
  getImportType,
  getPathFilesAndDirectories,
  IMPORT_TYPE,
} from "../utils";
import { parse } from "../parsers";
import { analyze } from "../analyzer";
import {
  TLoadConfigs,
  TImportConfig,
  TStructureConfig,
} from "../config/schemas";

const importTaskDebug = debug("imports-task");

const logDebugItems = (label: string, items: Array<string>) =>
  importTaskDebug(`${label}: ${items.length > 0 ? items.join(", ") : "none"}`);

const runTask = async ({ relativePath, structure }: TLoadConfigs) => {
  /**
   * Remap relative import paths from relative to absolute
   */
  const remapImports = (imp: TImportConfig) => {
    const importType = getImportType(imp.glob);
    if (importType === IMPORT_TYPE.RELATIVE) {
      return {
        ...imp,
        glob: join(sep, relativePath, imp.glob),
      };
    }

    return imp;
  };

  async function lint(structureItem: TStructureConfig) {
    const path = join(relativePath, structureItem.path);

    importTaskDebug(`Running task for ${path}`);

    const disallowedImports = structureItem.disallowedImports.map(remapImports);

    logDebugItems(
      "Disallowed imports",
      disallowedImports.map(imp => imp.glob),
    );

    const allowedImports = structureItem.allowedImports.map(remapImports);

    logDebugItems(
      "Allowed imports",
      allowedImports.map(imp => imp.glob),
    );

    const { files, directories } = await getPathFilesAndDirectories(path, {
      expandDirectories: structureItem.recursive,
    });

    logDebugItems("Files to parse", files);
    logDebugItems("Directories to lint", directories);

    files.forEach(parse);

    return await analyze(
      [path, ...directories],
      disallowedImports,
      allowedImports,
    );
  }

  const taskNested = await Promise.all(structure.map(lint));
  return taskNested.flat(Infinity);
};

/**
 * Task to analyse import rules validity
 */
const importsTask = {
  name: "imports-task",
  runTask,
};

export { importsTask };
