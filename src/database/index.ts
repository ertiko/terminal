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
        const { conditions, values } = this.buildWhere(where);

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
        const { conditions, values } = this.buildWhere(where);

        this.db.prepare(`
            DELETE FROM ${tableName}
            WHERE ${conditions}
        `).run(...values);
    }

    getAll<T>(
        tableName: string,
        where: Record<string, unknown>
    ): T[] {
        const { conditions, values } = this.buildWhere(where);

        return this.db
            .prepare(`
                SELECT *
                FROM ${tableName}
                WHERE ${conditions}
            `)
            .all(...values) as T[];
    }

    update(
        tableName: string,
        data: Record<string, unknown>,
        where: Record<string, unknown>
    ): void {
        const setColumns = Object.keys(data)
            .map(column => `${column} = ?`)
            .join(", ");

        const { conditions, values: whereValues } = this.buildWhere(where);

        const values = [
            ...Object.values(data),
            ...whereValues
        ];

        this.db.prepare(`
            UPDATE ${tableName}
            SET ${setColumns}
            WHERE ${conditions}
        `).run(...values);
    }

    private buildWhere(where: Record<string, unknown>): {
        conditions: string;
        values: unknown[];
    } {
        const conditions = Object.keys(where)
            .map(column => {
                if (where[column] === null) {
                    return `${column} IS NULL`;
                }

                return `${column} = ?`;
            })
            .join(" AND ");

        const values = Object.values(where)
            .filter(value => value !== null);

        return { conditions, values };
    }

    close(): void {
        this.db.close();
    }
}
