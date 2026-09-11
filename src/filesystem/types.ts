export interface FileInterface {
    id: number;
    name: string;
    content: string;
    permissions: number;
}

export interface DirectoryInterface {
    id: number;
    name: string;
    parent_id: number | null;
    permissions: number;

    files: FileInterface[];
    directories: DirectoryInterface[];
}
