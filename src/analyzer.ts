import { findFilesWithImports } from "./traverser";
import { createDisallowedImportViolation, TViolation } from "./violations";
import { getDemand } from "./store";
import { getFiles } from "./utils";
import { TImportConfig } from "./config/types";

export const analyze = async (
  paths: string[],
  disallowedImports: TImportConfig[],
  allowedImports: TImportConfig[],
): Promise<TViolation[]> =>
  paths.flatMap(path => {
    const demand = getDemand(path);
    const files = getFiles(demand);

    // negate allowed imports glob to catch all disallowed imports
    const allowedImportsNegated = allowedImports.map(imp => ({
      ...imp,
      glob: `!${imp.glob}`,
    }));

    const filesWithAllowedNegatedMatchedImports = findFilesWithImports(
      files,
      allowedImportsNegated,
    );

    const filesWithDisallowedMatchedImports = findFilesWithImports(
      files,
      disallowedImports,
    );

    return filesWithAllowedNegatedMatchedImports
      .concat(filesWithDisallowedMatchedImports)
      .map(match =>
        createDisallowedImportViolation(
          demand,
          match.file,
          match.matchedImports,
          match.matchedConfig,
        ),
      );
  });
