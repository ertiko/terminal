import type { Command } from "../terminal/types.js";

const clear: Command = (_args, _stdin, _shell) => {
    return "\x1b[2J\x1b[H";
};

export default clear;
