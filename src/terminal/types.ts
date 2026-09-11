import type { Shell } from "./shell.js";

export type Command = (
    args: string[],
    stdin: string,
    shell: Shell
) => string;
