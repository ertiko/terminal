import type { UserInterface } from "../users/types.js";
import type { PathResolver } from "../filesystem/pathResolver.js";

import { Shell } from "./shell.js";
import { UserManager } from "../users/index.js";
import { GameFileSystem } from "../filesystem/index.js";

export class Terminal {
    private shell: Shell;
    private userManager: UserManager;
    private fs: GameFileSystem;

    constructor(userManager: UserManager, fs: GameFileSystem, pathResolver: PathResolver) {
        this.shell = new Shell(fs, pathResolver);
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
                const rootDirectoryResult = this.fs.getRoot();

                if (rootDirectoryResult.success) {
                    this.shell.currentDirectoryId = rootDirectoryResult.value.id;
                }

                this.runShell();
            });
        });
    }

    private runShell(): void {
        process.stdout.write(this.shell.getPrompt());

        process.stdin.on("data", (data) => {
            const input = data.toString().trim();

            const output = this.shell.execute(input);

            if (output) {
                process.stdout.write(output + "\n");
            }

            process.stdout.write(this.shell.getPrompt());
        });
    }
}
