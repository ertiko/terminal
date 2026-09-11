export interface FileInterface {
    id: number;
    name: string;
    content: string;
    permissions: number;
    owner_id: number;
}

export interface DirectoryInterface {
    id: number;
    name: string;
    parent_id: number | null;
    permissions: number;
    owner_id: number;
}

export type FsNode = FileInterface | DirectoryInterface;

export type FsErrorCode =
    | "ALREADY_EXISTS"
    | "INVALID_NAME"
    | "NO_SUCH_FILE"
    | "NO_SUCH_DIRECTORY"
    | "NO_SUCH_FILE_OR_DIRECTORY"
    | "DIRECTORY_NOT_EMPTY"
    | "CANNOT_MOVE_DESCENDANT"
    | "CANNOT_MOVE_ROOT"
    | "INVALID_ROOT"

export type FsResult<T> =
    | {
        success: true;
        value: T;
        error: null;
    }
    | {
        success: false;
        value: null;
        error: {
            code: FsErrorCode;
        };
    };
