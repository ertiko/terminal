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

        const output = command(
            commandArgs,
            stdin,
            this.shell
        );

        return this.handleRedirects(node.redirects, output);
    }

    private executePipeline(node: any, stdin: string = ""): string {
        let output = stdin;

        for (const statement of node.commands) {
            output = this.execute(statement.command, output);
        }

        return output;
    }

    private handleRedirects(
        redirects: any[] | undefined,
        output: string
    ): string {
        if (!redirects || redirects.length === 0) {
            return output;
        }

        for (const redirect of redirects) {
            if (redirect.op !== ">" && redirect.op !== ">>") {
                continue;
            }

            const target = this.getRedirectTarget(redirect.target);

            if (!target) {
                return "bash: redirect: invalid target";
            }

            if (this.shell.currentDirectoryId === null) {
                return "bash: redirect: cannot determine current directory";
            }

            if (this.shell.currentUser === null) {
                return "bash: redirect: no current user";
            }

            const parent = this.shell.paths.resolveParent(
                target,
                this.shell.currentDirectoryId
            );

            const name = this.shell.paths.getName(target);

            if (!parent || !name) {
                return `bash: ${target}: No such file or directory`;
            }

            const existing = this.shell.paths.resolve(
                target,
                this.shell.currentDirectoryId
            );

            if (existing && !("content" in existing)) {
                return `bash: ${target}: Is a directory`;
            }

            if (!existing) {
                const createResult = this.shell.fs.createFile(
                    parent.id,
                    name,
                    this.shell.currentUser.id,
                    "",
                    0o644
                );

                if (!createResult.success) {
                    return `bash: ${target}: Cannot create file`;
                }
            }

            if (redirect.op === ">") {
                const writeResult = this.shell.fs.writeFile(
                    parent.id,
                    name,
                    output
                );

                if (!writeResult.success) {
                    return `bash: ${target}: Cannot write file`;
                }

                continue;
            }

            const readResult = this.shell.fs.readFile(
                parent.id,
                name
            );

            if (!readResult.success) {
                return `bash: ${target}: Cannot read file`;
            }

            const separator =
                readResult.value.length > 0 && output.length > 0
                    ? "\n"
                    : "";

            const writeResult = this.shell.fs.writeFile(
                parent.id,
                name,
                readResult.value + separator + output
            );

            if (!writeResult.success) {
                return `bash: ${target}: Cannot write file`;
            }
        }

        return "";
    }

    private getRedirectTarget(target: any): string | undefined {
        if (!target) {
            return undefined;
        }

        if (target.value !== undefined) {
            return target.value;
        }

        if (target.parts) {
            return target.parts
                .map((part: any) => part.value ?? "")
                .join("");
        }

        return undefined;
    }
}
