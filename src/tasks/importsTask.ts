import { join, sep } from "path";

import {
  debug,
  getImportType,
  getPathFilesAndDirectories,
  IMPORT_TYPE,
} from "../utils";
import { parse } from "../parsers";
import { analyze } from "../analyzer";
import { TLoadConfigs, TImportConfig, TStructureConfig } from "../config/types";

const importTaskDebug = debug("imports-task");

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

    importTaskDebug(
      `Disallowed imports ${disallowedImports.map(imp => imp.glob).join(", ")}`,
    );

    const allowedImports = structureItem.allowedImports.map(remapImports);

    importTaskDebug(
      `Allowed imports ${allowedImports.map(imp => imp.glob).join(", ")}`,
    );

    const { files, directories } = await getPathFilesAndDirectories(path, {
      expandDirectories: structureItem.recursive,
    });

    importTaskDebug(`Files to parse ${files.join(", ")}`);
    importTaskDebug(`Directories to lint ${directories.join(", ")}`);

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
