import type { UserInterface } from "../users/types.js";
import type { CommandResult } from "./types.js";

import { Shell } from "./shell.js";
import { UserManager } from "../users/index.js";
import { GameFileSystem } from "../filesystem/index.js";

export class Terminal {
    private shell: Shell;
    private userManager: UserManager;
    private fs: GameFileSystem;

    private interactive:
        ((input: string) => CommandResult) | null = null;

    constructor(userManager: UserManager, fs: GameFileSystem) {
        this.shell = new Shell(fs);
        this.userManager = userManager;
        this.fs = fs;
    }

    start(): void {
        this.ensureRoot((root) => {
            this.fs.init(root.id);
            this.login();
        });
    }

    private ensureRoot(callback: (root: UserInterface) => void): void {
        const root = this.userManager.getByUsername("root");

        if (root) {
            callback(root);
            return;
        }

        console.log("Please create a root user.");
        process.stdout.write("Password: ");

        process.stdin.once("data", (data) => {
            const password = data.toString().trim();
            const root = this.userManager.create("root", password, 1);

            console.log("Root user created. Login now.");

            callback(root);
        });
    }

    private login(): void {
        process.stdout.write("Username: ");

        process.stdin.once("data", (data) => {
            const username = data.toString().trim();

            process.stdout.write("Password: ");

            process.stdin.once("data", (data) => {
                const password = data.toString().trim();

                const user = this.userManager.getByUsername(username);

                if (!user || user.password !== password) {
                    console.log("Invalid username or password.");
                    return this.login();
                }

                console.log(`Fuck you, ${user.username}!`);

                this.shell.currentUser = user;
                this.shell.currentDirectoryId = this.fs.getRoot()!.id;

                this.runShell();
            });
        });
    }

    private runShell(): void {
        process.stdout.write(this.shell.getPrompt());

        process.stdin.on("data", (data) => {
            const input = data.toString().replace(/\r?\n$/, "");

            if (this.interactive !== null) {
                const result = this.interactive(input);

                this.handleResult(result);

                return;
            }

            const result = this.shell.execute(input);

            this.handleResult(result);

            if (this.interactive === null) {
                process.stdout.write(this.shell.getPrompt());
            }
        });
    }

    private handleResult(result: CommandResult): void {
        if (typeof result === "string") {
            if (result) {
                process.stdout.write(result + "\n");
            }

            this.interactive = null;
            return;
        }

        if (result.output) {
            process.stdout.write(result.output + "\n");
        }

        this.interactive = result.onInput;
    }
}
