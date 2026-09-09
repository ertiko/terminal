import type { Column } from "./types.ts";

import Database from "better-sqlite3";

export class DatabaseManager {
    private db: Database.Database;

    constructor() {
        this.db = new Database("database.db");
    }

    makeTable(
        tableName: string,
        columns: Record<string, Column>
    ): void {
        const columnDefinitions = Object.entries(columns)
            .map(([name, definition]) => {
                return `${name} ${definition.join(" ")}`;
            })
            .join(", ");

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                ${columnDefinitions}
            )
        `);
    }

    insert(
        tableName: string,
        data: Record<string, unknown>
    ): void {
        const columns = Object.keys(data);
        const values = Object.values(data);

        const columnNames = columns.join(", ");
        const placeholders = columns.map(() => "?").join(", ");

        this.db.prepare(`
            INSERT INTO ${tableName} (${columnNames})
            VALUES (${placeholders})
        `).run(...values);
    }

    get<T>(
        tableName: string,
        where: Record<string, unknown>
    ): T | undefined {
        const conditions = Object.keys(where)
            .map(column => `${column} = ?`)
            .join(" AND ");

        const values = Object.values(where);

        return this.db.prepare(`
            SELECT *
            FROM ${tableName}
            WHERE ${conditions}
        `).get(...values) as T | undefined;
    }

    delete(
        tableName: string,
        where: Record<string, unknown>
    ): void {
        const conditions = Object.keys(where)
            .map(column => `${column} = ?`)
            .join(" AND ");

        const values = Object.values(where);

        this.db.prepare(`
            DELETE FROM ${tableName}
            WHERE ${conditions}
        `).run(...values);
    }

    getAll<T>(tableName: string): T[] {
        return this.db
            .prepare(`SELECT * FROM ${tableName}`)
            .all() as T[];
    }

    close(): void {
        this.db.close();
    }
}
