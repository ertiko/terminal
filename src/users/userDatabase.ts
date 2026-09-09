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
            username: ["TEXT", "NOT NULL"],
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

    get(id: number): User | undefined {
        return this.db.get("users", { id: id });
    }

    remove(id: number): void {
        this.db.delete("users", { id: id });
    }
}
