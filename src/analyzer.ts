import * as fg from "fast-glob";
import { sep, join } from "path";
import { findFilesWithImports, getFolder } from "./travelsar";
import { createDisallowedImportViolation, Violation } from "./violations";
import { Folder } from "./types";

export const analyze = async (root: Folder, config: any): Promise<Violation[]> => {
    const array = await Promise.all(
        config.structure.map(async struct => {
            const subFoldersGlob = join(struct.path, "**");
            const directories = await fg([struct.path, subFoldersGlob], { onlyDirectories: true, followSymbolicLinks: false });

            return directories.flatMap(directory => {
                const folder = getFolder(directory.split(sep), root);

                const filesWithMatchedImports = findFilesWithImports(folder, struct.disallowedImports);

                return filesWithMatchedImports
                    .map(match => createDisallowedImportViolation(folder, match.file, match.matchedImports));
            })
        })
    );

    return array.flat();
};
