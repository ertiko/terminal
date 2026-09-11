import { getArgs, loadCommands } from "../libs/parser.js";

import type { Shell } from "./shell.js";
import type { Command } from "./types.js";

export class Executor {
    private commands: Map<string, Command>;

    constructor(private shell: Shell) {
        this.commands = new Map();
        this.loadCommands();
    }

    async loadCommands(): Promise<void> {
        this.commands = await loadCommands();
    }

    execute(node: any, stdin: string = ""): string {
        switch (node.type) {
            case "Program":
                return this.executeProgram(node, stdin);

            case "Statement":
                return this.executeStatement(node, stdin);

            case "SimpleCommand":
                return this.executeSimpleCommand(node, stdin);

            case "Pipeline":
                return this.executePipeline(node, stdin);

            default:
                throw new Error(`Unsupported node: ${node.type}`);
        }
    }

    private executeProgram(node: any, stdin: string): string {
        let output = stdin;

        for (const statement of node.body) {
            output = this.execute(statement, output);
        }

        return output;
    }

    private executeStatement(node: any, stdin: string): string {
        return this.execute(node.command, stdin);
    }

    private executeSimpleCommand(node: any, stdin: string): string {
        const args = getArgs(node);

        const [name, ...commandArgs] = args;

        if (!name) {
            return "";
        }

        const command = this.commands.get(name);

        if (!command) {
            return `bash: ${name}: command not found`;
        }

        return command(
            commandArgs,
            stdin,
            this.shell
        );
    }

    private executePipeline(node: any, stdin: string = ""): string {
        let output = stdin;

        for (const statement of node.commands) {
            output = this.execute(statement.command, output);
        }

        return output;
    }
}
