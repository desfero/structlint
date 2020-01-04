import { join } from "path";
import * as micromatch from "micromatch";

import { Folder, File } from "./types";
import { nonNullable } from "./utils";

const getFolder = ([folderName, ...rest]: string[], rootMap: Folder): Folder => {
    if (folderName === undefined) {
        return rootMap;
    }

    let folder = folderName === "." ? rootMap : rootMap.folders[folderName];

    if (folder === undefined) {
        folder = rootMap.folders[folderName] = {
            path: join(rootMap.path, folderName),
            name: folderName,
            files: {},
            folders: {},
            parent: rootMap,
        }
    }

    return getFolder(rest, folder);
};

const getFile = (path: string[], rootMap: Folder): File => {
    const fileName = path[path.length - 1];
    const foldersNames = path.slice(0, -1);

    const folder = getFolder(foldersNames, rootMap);

    let file = folder.files[fileName];

    if (file === undefined) {
        file = folder.files[fileName] = {
            path: join(folder.path, fileName),
            name: fileName,
            parent: folder,
            imports: [],
        };
    }

    return file
};

type FileWithMatchedImports = { file: File, matchedImports: string[] };

const findFilesWithImports = ({ files }: Folder, importsGlobs: string[]): FileWithMatchedImports[] => {
    return Object.values(files).flatMap(file => {
        nonNullable(file);

        const matchedImports = micromatch(file.imports, importsGlobs);

        if (matchedImports.length > 0) {
            return [{ file, matchedImports }];
        }

        return [];
    })
};

export { getFolder, getFile, findFilesWithImports, FileWithMatchedImports };
