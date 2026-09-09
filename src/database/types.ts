type ColumnType = "TEXT" | "INTEGER" | "REAL" | "BLOB";

export type Column = [
    type: ColumnType,
    ...constraints: string[]
];
