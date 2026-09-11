import type { FileInterface, DirectoryInterface } from "./types.js";

import { FileSystemDatabase } from "./fileSystemDatabase.js";

export class GameFileSystem {
    public db: FileSystemDatabase;

    constructor() {
        this.db = new FileSystemDatabase();
    }

    init(rootUserId: number): void {

        if (!this.getRoot()) {
            this.createDirectory(null, "/", rootUserId, 755);
        }
    }


    //files
    createFile(parentId: number, name: string, ownerId: number, content: string = '', permissions: number = 644): void {
        if (this.exists(parentId, name)) {
            console.log("Already exists.");
            return;
        }

        if (this.isBadName(name)) {
            console.log("Invalid name.");
            return;
        }

        this.db.createFile(parentId, name, ownerId, content, permissions);
    }

    getFile(parentId: number, name: string): FileInterface | undefined {
        return this.db.getFileByName(parentId, name);
    }

    readFile(parentId: number, name: string): string {
        const file = this.db.getFileByName(parentId, name);
        return file?.content ?? '';
    }

    writeFile(parentId: number, name: string, content: string): void {
        const file = this.db.getFileByName(parentId, name);
        if (file) {
            this.db.updateFile(file.id, { content });
        } else {
            console.log('No such file.');
        }
    }

    deleteFile(parentId: number, name: string): void {
        const file = this.db.getFileByName(parentId, name);
        if (file) {
            this.db.deleteFile(file.id);
        } else {
            console.log('No such file.');
        }
    }

    moveFile(parentId: number, name: string, newParentId: number, newName: string): void {
        if (this.exists(newParentId, newName)) {
            console.log("Already exists.");
            return;
        }

        const file = this.db.getFileByName(parentId, name);

        if (file) {
            this.db.updateFile(file.id, { parent_id: newParentId, name: newName });
        } else {
            console.log('No such file.');
        }
    }

    //directories
    createDirectory(parentId: number | null, name: string, ownerId: number, permissions: number = 755): void {
        if (parentId === null && name !== "/") {
            console.log("Invalid root directory.");
            return;
        }

        if (parentId !== null && name === "/") {
            console.log("Invalid directory name.");
            return;
        }

        if (this.exists(parentId, name)) {
            console.log("Already exists.");
            return;
        }

        if (name !== "/" && this.isBadName(name)) {
            console.log("Invalid name.");
            return;
        }

        this.db.createDirectory(
            parentId,
            name,
            ownerId,
            permissions
        );
    }

    getDirectory(parentId: number | null, name: string): DirectoryInterface | undefined {
        return this.db.getDirectoryByName(parentId, name);
    }

    getDirectoryById(id: number): DirectoryInterface | undefined {
        return this.db.getDirectoryById(id);
    }

    deleteDirectory(parentId: number, name: string): void {
        const dir = this.db.getDirectoryByName(parentId, name);

        if (!dir) {
            console.log("No such directory.");
            return;
        }

        const files = this.db.getFiles(dir.id);
        const directories = this.db.getDirectories(dir.id);

        if (files.length > 0 || directories.length > 0) {
            console.log("Directory not empty.");
            return;
        }

        this.db.deleteDirectory(dir.id);
    }

    moveDirectory(parentId: number, name: string, newParentId: number, newName: string): void {
        const dir = this.db.getDirectoryByName(parentId, name);

        if (!dir) {
            console.log("No such directory.");
            return;
        }

        if (this.exists(newParentId, newName)) {
            console.log("Already exists.");
            return;
        }

        if (this.isDescendant(dir.id, newParentId)) {
            console.log("Cannot move directory to a descendant.");
            return;
        }

        if (dir.parent_id === null) {
            console.log("Cannot move root directory.");
            return;
        }

        this.db.updateDirectory(
            dir.id,
            {
                parent_id: newParentId,
                name: newName
            }
        );
    }

    listDirectory(parentId: number): { directories: DirectoryInterface[], files: FileInterface[] } {
        const directories = this.db.getDirectories(parentId);
        const files = this.db.getFiles(parentId);
        return { directories, files };
    }

    //permissions

    chmod(parentId: number, name: string, permissions: number): void {
        const file = this.db.getFileByName(parentId, name);

        if (file) {
            this.db.updateFile(file.id, { permissions });
            return;
        }

        const directory = this.db.getDirectoryByName(parentId, name);

        if (directory) {
            this.db.updateDirectory(directory.id, { permissions });
            return;
        }

        console.log("No such file or directory.");
    }

    chown(parentId: number, name: string, ownerId: number): void {
        const file = this.db.getFileByName(parentId, name);

        if (file) {
            this.db.updateFile(file.id, { owner_id: ownerId });
            return;
        }

        const directory = this.db.getDirectoryByName(parentId, name);

        if (directory) {
            this.db.updateDirectory(directory.id, { owner_id: ownerId });
            return;
        }

        console.log("No such file or directory.");
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

    remove(parentId: number, name: string): void {
        if (!this.exists(parentId, name)) {
            console.log("No such file or directory.");
            return;
        }

        const file = this.db.getFileByName(parentId, name);

        if (file) {
            this.deleteFile(parentId, name);
            return;
        }

        const directory = this.db.getDirectoryByName(parentId, name);

        if (directory) {
            this.deleteDirectory(parentId, name);
            return;
        }
    }

    move(parentId: number, name: string, newParentId: number, newName: string): void {
        if (!this.exists(parentId, name)) {
            console.log("No such file or directory.");
            return;
        }

        const file = this.db.getFileByName(parentId, name);

        if (file) {
            this.moveFile(parentId, name, newParentId, newName);
            return;
        }

        const directory = this.db.getDirectoryByName(parentId, name);

        if (directory) {
            this.moveDirectory(parentId, name, newParentId, newName);
            return;
        }
    }

    isBadName(name: string): boolean {
        return (
            !name ||
            name === "." ||
            name === ".." ||
            name.includes("/")
        );
    }

    getRoot(): DirectoryInterface | undefined {
        const root = this.getDirectory(null, '/');
        return root;
    }
}
