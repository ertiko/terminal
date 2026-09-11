import { DatabaseManager } from "../database/index.js";

import type { User } from "./user.js";

export class UserDatabase {
    private db: DatabaseManager;

    constructor() {
        this.db = new DatabaseManager();
        this.createTable();
    }

    private createTable(): void {
        this.db.makeTable("users", {
            id: ["INTEGER", "PRIMARY KEY"],
            username: ["TEXT", "NOT NULL", "UNIQUE"],
            password: ["TEXT", "NOT NULL"],
            isRoot: ["INTEGER", "NOT NULL"]
        });
    }

    save(user: User): void {
        this.db.insert("users", {
            id: user.id,
            username: user.username,
            password: user.password,
            isRoot: user.isRoot
        });
    }

    update(user: User): void {
        this.db.update(
            "users",
            {
                username: user.username,
                password: user.password,
                isRoot: user.isRoot
            },
            {
                id: user.id
            }
        );
    }

    getById(id: number): User | undefined {
        return this.db.get("users", { id });
    }

    getByUsername(username: string): User | undefined {
        return this.db.get("users", { username });
    }

    removeById(id: number): void {
        this.db.delete("users", { id });
    }

    removeByUsername(username: string): void {
        this.db.delete("users", { username });
    }
}
