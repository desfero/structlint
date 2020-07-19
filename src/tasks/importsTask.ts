import { join, sep } from "path";

import {
  debug,
  flatAll,
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

const runTask = async (config: TLoadConfigs) => {
  /**
   * Remap relative import paths from relative to absolute
   */
  const remapImports = (imp: TImportConfig) => {
    const importType = getImportType(imp.glob);
    if (importType === IMPORT_TYPE.RELATIVE) {
      return {
        ...imp,
        glob: join(sep, config.relativePath, imp.glob),
      };
    }

    return imp;
  };

  async function lint(structureConfig: TStructureConfig) {
    const path = join(config.relativePath, structureConfig.path);

    importTaskDebug(`Running task for ${path}`);

    const disallowedImports = structureConfig.disallowedImports.map(
      remapImports,
    );

    logDebugItems(
      "Disallowed imports",
      disallowedImports.map(imp => imp.glob),
    );

    const allowedImports = structureConfig.allowedImports.map(remapImports);

    logDebugItems(
      "Allowed imports",
      allowedImports.map(imp => imp.glob),
    );

    const { files, directories } = await getPathFilesAndDirectories(path, {
      expandDirectories: structureConfig.recursive,
    });

    logDebugItems("Files to parse", files);
    logDebugItems("Directories to lint", directories);

    files.forEach(parse);

    return analyze([path, ...directories], disallowedImports, allowedImports);
  }

  const violations = await flatAll(config.structure.map(lint));

  return { violations, config };
};

/**
 * Task to analyse import rules validity
 */
const importsTask = {
  name: "imports-task",
  runTask,
};

export { importsTask };
