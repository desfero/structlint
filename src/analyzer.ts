import { findFilesWithImports } from "./travelsar";
import { createDisallowedImportViolation, Violation } from "./violations";
import { getFolder } from "./parser";
import { Folder } from "./types";
import { DeepReadonly } from "./utils";

export const analyze = async (
  directories: string[],
  disallowedImports: string[],
  root: DeepReadonly<Folder>,
): Promise<Violation[]> => {
  return directories.flatMap(directory => {
    const folder = getFolder(directory, root);

    const filesWithMatchedImports = findFilesWithImports(
      folder,
      disallowedImports,
    );

    return filesWithMatchedImports.map(match =>
      createDisallowedImportViolation(folder, match.file, match.matchedImports),
    );
  });
};
