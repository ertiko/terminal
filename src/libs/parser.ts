import { parse } from "@aliou/sh";
import { readdir } from "node:fs/promises";

import type { Command } from "../terminal/types.js";

export function parseCommand(input: string) {
    return parse(input).ast;
}


export async function loadCommands(): Promise<Map<string, Command>> {
    const commands = new Map<string, Command>();

    const commandsDirectory = new URL("../commands/", import.meta.url);

    const files = await readdir(commandsDirectory);

    for (const file of files) {
        if (!file.endsWith(".ts") && !file.endsWith(".js")) {
            continue;
        }

        if (file === "index.ts" || file === "index.js") {
            continue;
        }

        const module: { default: Command } = await import(
            `../commands/${file}`
        );

        const commandName = file.replace(/\.(ts|js)$/, "");

        commands.set(commandName, module.default);
    }

    return commands;
}

export function getArgs(node: any): string[] {
    return node.words.map((word: any) => {
        return word.parts
            .map((part: any) => {
                if (part.value !== undefined) {
                    return part.value;
                }

                if (part.parts) {
                    return part.parts
                        .map((child: any) => child.value ?? "")
                        .join("");
                }

                return "";
            })
            .join("");
    });
}
