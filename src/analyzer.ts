import { findFilesWithImports } from "./traversar";
import { createDisallowedImportViolation, Violation } from "./violations";
import { getDemand } from "./store";
import { ImportConfig } from "./config";
import { getFiles } from "./utils";

export const analyze = async (
  paths: string[],
  disallowedImports: ImportConfig[],
  allowedImports: ImportConfig[],
): Promise<Violation[]> =>
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
          match.file,
          match.matchedImports,
          match.matchedConfig,
        ),
      );
  });
