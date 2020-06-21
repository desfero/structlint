import { findFilesWithImports } from "./traverser";
import { createDisallowedImportViolation, TViolation } from "./violations";
import { getDemand } from "./store";
import { getFiles } from "./utils";
import { TImportConfig } from "./config/schemas";

export const analyze = async (
  paths: string[],
  disallowedImports: TImportConfig[],
  allowedImports: TImportConfig[],
): Promise<TViolation[]> =>
  paths.flatMap(path => {
    const demand = getDemand(path);
    const files = getFiles(demand);

    const filesWithAllowedMatchedImports = findFilesWithImports(
      files,
      allowedImports,
      true,
    );

    const filesWithDisallowedMatchedImports = findFilesWithImports(
      files,
      disallowedImports,
    );

    return filesWithAllowedMatchedImports
      .concat(filesWithDisallowedMatchedImports)
      .map(match =>
        createDisallowedImportViolation(
          match.file,
          match.matchedImport,
          match.matchedConfig,
        ),
      );
  });
