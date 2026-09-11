import type { FsErrorCode } from "./types.js";

export const fsErrorMessages: Record<FsErrorCode, string> = {
    ALREADY_EXISTS: "File or directory already exists",
    INVALID_NAME: "Invalid file or directory name",
    NO_SUCH_FILE: "No such file",
    NO_SUCH_DIRECTORY: "No such directory",
    NO_SUCH_FILE_OR_DIRECTORY: "No such file or directory",
    DIRECTORY_NOT_EMPTY: "Directory is not empty",
    CANNOT_MOVE_DESCENDANT: "Cannot move a directory into its descendant",
    CANNOT_MOVE_ROOT: "Cannot move the root directory",
    INVALID_ROOT: "Invalid root directory",
};
