import { sep } from "path";
import { findFilesWithImports, getFolder } from "./travelsar";
import { createDisallowedImportViolation, Violation } from "./violations";
import { Folder } from "./types";

export const analyze = async (root: Folder, directories: string[], disallowedImports: string[]): Promise<Violation[]> => {
    return directories.flatMap(directory => {
        const folder = getFolder(directory.split(sep), root);

        const filesWithMatchedImports = findFilesWithImports(folder, disallowedImports);

        return filesWithMatchedImports
            .map(match => createDisallowedImportViolation(folder, match.file, match.matchedImports));
    });
};
