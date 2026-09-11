import type { FileInterface, DirectoryInterface, FsResult, FsErrorCode } from "./types.js";

import { FileSystemDatabase } from "./fileSystemDatabase.js";

export class GameFileSystem {
    public db: FileSystemDatabase;

    constructor() {
        this.db = new FileSystemDatabase();
    }

    init(rootUserId: number): void {
        const result = this.getRoot();

        if (!result.success) {
            this.createDirectory(null, "/", rootUserId, 755);
        }
    }


    //files
    createFile(parentId: number, name: string, ownerId: number, content: string = '', permissions: number = 644): FsResult<null> {
        if (this.exists(parentId, name)) {
            return { success: false, value: null, error: { code: 'ALREADY_EXISTS' } };
        }

        if (this.isBadName(name)) {
            return { success: false, value: null, error: { code: 'INVALID_NAME' } };
        }

        this.db.createFile(parentId, name, ownerId, content, permissions);
        return { success: true, value: null, error: null };
    }

    getFile(parentId: number, name: string): FsResult<FileInterface> {
        const file = this.db.getFileByName(parentId, name);
        if (file) {
            return { success: true, value: file, error: null };
        } else {
            return { success: false, value: null, error: { code: 'NO_SUCH_FILE' } };
        }
    }

    readFile(parentId: number, name: string): FsResult<string> {
        const file = this.db.getFileByName(parentId, name);
        if (file) {
            return { success: true, value: file.content, error: null };
        } else {
            return { success: false, value: null, error: { code: 'NO_SUCH_FILE' } };
        }
    }

    writeFile(parentId: number, name: string, content: string): FsResult<null> {
        const file = this.db.getFileByName(parentId, name);
        if (file) {
            this.db.updateFile(file.id, { content });
            return { success: true, value: null, error: null };
        } else {
            return { success: false, value: null, error: { code: 'NO_SUCH_FILE' } };
        }
    }

    deleteFile(parentId: number, name: string): FsResult<null> {
        const file = this.db.getFileByName(parentId, name);
        if (file) {
            this.db.deleteFile(file.id);
            return { success: true, value: null, error: null };
        } else {
            return { success: false, value: null, error: { code: 'NO_SUCH_FILE' } };
        }
    }

    moveFile(parentId: number, name: string, newParentId: number, newName: string): FsResult<null> {
        if (this.exists(newParentId, newName)) {
            return { success: false, value: null, error: { code: 'ALREADY_EXISTS' } };
        }

        const file = this.db.getFileByName(parentId, name);

        if (file) {
            this.db.updateFile(file.id, { parent_id: newParentId, name: newName });
            return { success: true, value: null, error: null };
        } else {
            return { success: false, value: null, error: { code: 'NO_SUCH_FILE' } };
        }
    }

    //directories
    createDirectory(parentId: number | null, name: string, ownerId: number, permissions: number = 755): FsResult<null> {
        if (parentId === null && name !== "/") {
            return { success: false, value: null, error: { code: 'INVALID_ROOT' } };
        }

        if (parentId !== null && name === "/") {
            return { success: false, value: null, error: { code: 'INVALID_NAME' } };
        }

        if (this.exists(parentId, name)) {
            return { success: false, value: null, error: { code: 'ALREADY_EXISTS' } };
        }

        if (name !== "/" && this.isBadName(name)) {
            return { success: false, value: null, error: { code: 'INVALID_NAME' } };
        }

        this.db.createDirectory(
            parentId,
            name,
            ownerId,
            permissions
        );
        return { success: true, value: null, error: null };
    }

    getDirectory(parentId: number | null, name: string): FsResult<DirectoryInterface> {
        const dir = this.db.getDirectoryByName(parentId, name);
        if (dir) {
            return { success: true, value: dir, error: null };
        } else {
            return { success: false, value: null, error: { code: 'NO_SUCH_DIRECTORY' } };
        }
    }

    getDirectoryById(id: number): FsResult<DirectoryInterface> {
        const dir = this.db.getDirectoryById(id);
        if (dir) {
            return { success: true, value: dir, error: null };
        } else {
            return { success: false, value: null, error: { code: 'NO_SUCH_DIRECTORY' } };
        }
    }

    deleteDirectory(parentId: number, name: string, recursive: boolean = false): FsResult<null> {
        const dir = this.db.getDirectoryByName(parentId, name);

        if (!dir) {
            return {
                success: false,
                value: null,
                error: { code: "NO_SUCH_DIRECTORY" }
            };
        }

        const files = this.db.getFiles(dir.id);
        const directories = this.db.getDirectories(dir.id);

        if (!recursive && (files.length > 0 || directories.length > 0)) {
            return {
                success: false,
                value: null,
                error: { code: "DIRECTORY_NOT_EMPTY" }
            };
        }

        if (recursive) {
            for (const file of files) {
                this.db.deleteFile(file.id);
            }

            for (const directory of directories) {
                const result = this.deleteDirectory(
                    dir.id,
                    directory.name,
                    true
                );

                if (!result.success) {
                    return result;
                }
            }
        }

        this.db.deleteDirectory(dir.id);

        return {
            success: true,
            value: null,
            error: null
        };
    }

    moveDirectory(parentId: number, name: string, newParentId: number, newName: string): FsResult<null> {
        const dir = this.db.getDirectoryByName(parentId, name);

        if (!dir) {
            return { success: false, value: null, error: { code: 'NO_SUCH_DIRECTORY' } };
        }

        if (this.exists(newParentId, newName)) {
            return { success: false, value: null, error: { code: 'ALREADY_EXISTS' } };
        }

        if (this.isDescendant(dir.id, newParentId)) {
            return { success: false, value: null, error: { code: 'CANNOT_MOVE_DESCENDANT' } };
        }

        if (dir.parent_id === null) {
            return { success: false, value: null, error: { code: 'CANNOT_MOVE_ROOT' } };
        }

        this.db.updateDirectory(
            dir.id,
            {
                parent_id: newParentId,
                name: newName
            }
        );
        return { success: true, value: null, error: null };
    }

    listDirectory(parentId: number): FsResult<{ directories: DirectoryInterface[], files: FileInterface[] }> {
        const directories = this.db.getDirectories(parentId);
        const files = this.db.getFiles(parentId);
        return { success: true, value: { directories, files }, error: null  };
    }

    //permissions

    chmod(parentId: number, name: string, permissions: number): FsResult<null> {
        const file = this.db.getFileByName(parentId, name);

        if (file) {
            this.db.updateFile(file.id, { permissions });
            return { success: true, value: null, error: null };
        }

        const directory = this.db.getDirectoryByName(parentId, name);

        if (directory) {
            this.db.updateDirectory(directory.id, { permissions });
            return { success: true, value: null, error: null };
        }

        return { success: false, value: null, error: { code: 'NO_SUCH_FILE_OR_DIRECTORY' } };
    }

    chown(parentId: number, name: string, ownerId: number): FsResult<null> {
        const file = this.db.getFileByName(parentId, name);

        if (file) {
            this.db.updateFile(file.id, { owner_id: ownerId });
            return { success: true, value: null, error: null };
        }

        const directory = this.db.getDirectoryByName(parentId, name);

        if (directory) {
            this.db.updateDirectory(directory.id, { owner_id: ownerId });
            return { success: true, value: null, error: null };
        }

        return { success: false, value: null, error: { code: 'NO_SUCH_FILE_OR_DIRECTORY' } };
    }

    //other

    private isDescendant(directoryId: number, possibleParentId: number): boolean {
        let currentId: number | null = possibleParentId;

        while (currentId !== null) {
            if (currentId === directoryId) {
                return true;
            }

            const directory = this.db.getDirectoryById(currentId);

            if (!directory) {
                return false;
            }

            currentId = directory.parent_id;
        }

        return false;
    }

    exists(parentId: number | null, name: string): boolean {
        if (parentId === null) {
            return !!this.db.getDirectoryByName(parentId, name);
        }

        return (
            !!this.db.getFileByName(parentId, name) ||
            !!this.db.getDirectoryByName(parentId, name)
        );
    }

    remove(parentId: number, name: string): FsResult<null> {
        if (!this.exists(parentId, name)) {
            return { success: false, value: null, error: { code: 'NO_SUCH_FILE_OR_DIRECTORY' } };
        }

        const file = this.db.getFileByName(parentId, name);

        if (file) {
            const result = this.deleteFile(parentId, name);
            return result;
        }

        const directory = this.db.getDirectoryByName(parentId, name);

        if (directory) {
            const result = this.deleteDirectory(parentId, name);
            return result;
        }

        return { success: false, value: null, error: { code: 'NO_SUCH_FILE_OR_DIRECTORY' } };
    }

    move(parentId: number, name: string, newParentId: number, newName: string): FsResult<null> {
        if (!this.exists(parentId, name)) {
            return { success: false, value: null, error: { code: 'NO_SUCH_FILE_OR_DIRECTORY' } };
        }

        const file = this.db.getFileByName(parentId, name);

        if (file) {
            const result = this.moveFile(parentId, name, newParentId, newName);
            return result;
        }

        const directory = this.db.getDirectoryByName(parentId, name);

        if (directory) {
            const result = this.moveDirectory(parentId, name, newParentId, newName);
            return result;
        }

        return { success: false, value: null, error: { code: 'NO_SUCH_FILE_OR_DIRECTORY' } };
    }

    isBadName(name: string): boolean {
        return (
            !name ||
            name === "." ||
            name === ".." ||
            name.includes("/")
        );
    }

    getRoot(): FsResult<DirectoryInterface> {
        const root = this.getDirectory(null, '/');
        return root;
    }
}
