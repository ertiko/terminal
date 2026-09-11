import type { DirectoryInterface, FileInterface } from "./types.js";

import { DatabaseManager } from "../database/index.js";

export class FileSystemDatabase {
    private db: DatabaseManager;

    constructor() {
        this.db = new DatabaseManager();
        this.createTables();
    }

    private createTables(): void {
        this.db.makeTable("files", {
            id: ["INTEGER", "PRIMARY KEY", "AUTOINCREMENT"],
            parent_id: ["INTEGER", "NOT NULL"],
            name: ["TEXT", "NOT NULL"],
            owner_id: ["INTEGER", "NOT NULL"],
            content: ["TEXT", "NOT NULL", "DEFAULT", "''"],
            permissions: ["INTEGER", "NOT NULL"]
        });

        this.db.makeTable("directories", {
            id: ["INTEGER", "PRIMARY KEY", "AUTOINCREMENT"],
            parent_id: ["INTEGER"],
            name: ["TEXT", "NOT NULL"],
            owner_id: ["INTEGER", "NOT NULL"],
            permissions: ["INTEGER", "NOT NULL"]
        });
    }

    //files
    createFile(parentId: number, name: string, ownerId: number, content: string, permissions: number): void {
        this.db.insert(
            "files",
            { parent_id: parentId, name, owner_id: ownerId, content, permissions }
        );
    }

    getFileById(id: number): FileInterface | undefined {
        return this.db.get(
            "files",
            { id }
        );
    }

    getFileByName(parentId: number, name: string): FileInterface | undefined {
        return this.db.get(
            "files",
            { parent_id: parentId, name }
        );
    }

    getFiles(parentId: number): FileInterface[] {
        return this.db.getAll(
            "files",
            { parent_id: parentId }
        );
    }


    updateFile(id: number, data: {
        parent_id?: number;
        name?: string;
        owner_id?: number;
        content?: string;
        permissions?: number;
    }): void {
        this.db.update(
            "files",
            data,
            { id }
        );
    }

    deleteFile(id: number): void {
        this.db.delete(
            "files",
            { id }
        );
    }

    //directories
    createDirectory(parentId: number | null, name: string, ownerId: number, permissions: number): void {
        this.db.insert(
            "directories",
            { parent_id: parentId, name, owner_id: ownerId, permissions }
        );
    }

    getDirectoryById(id: number): DirectoryInterface | undefined {
        return this.db.get(
            "directories",
            { id }
        );
    }

    getDirectoryByName(parentId: number | null, name: string): DirectoryInterface | undefined {
        return this.db.get(
            "directories",
            { parent_id: parentId, name }
        );
    }

    getDirectories(parentId: number): DirectoryInterface[] {
        return this.db.getAll(
            "directories",
            { parent_id: parentId }
        );
    }

    updateDirectory(id: number, data: {
        parent_id?: number;
        name?: string;
        owner_id?: number;
        permissions?: number;
    }): void {
        this.db.update(
            "directories",
            data,
            { id }
        );
    }

    deleteDirectory(id: number): void {
        this.db.delete(
            "directories",
            { id }
        );
    }
}
