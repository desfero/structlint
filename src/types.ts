type Folder = {
    parent: undefined | Folder
    path: string,
    name: string,
    folders: Record<string, undefined | Folder>,
    files: Record<string, undefined | File>
}

type File = {
    path: string,
    name: string,
    parent: Folder,
    imports: string[],
}

export { File, Folder };
