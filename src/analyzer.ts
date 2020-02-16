import { findFilesWithImports } from "./travelsar";
import { createDisallowedImportViolation, Violation } from "./violations";
import { getDemand } from "./store";
import { ImportConfig } from "./config";
import { getFiles } from "./utils";

export const analyze = async (
  paths: string[],
  disallowedImports: ImportConfig[],
): Promise<Violation[]> =>
  paths.flatMap(path => {
    const demand = getDemand(path);

    const filesWithMatchedImports = findFilesWithImports(
      getFiles(demand),
      disallowedImports,
    );

    return filesWithMatchedImports.map(match =>
      createDisallowedImportViolation(
        demand,
        match.file,
        match.matchedImports,
        match.matchedConfig,
      ),
    );
  });
