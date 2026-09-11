import type { Command } from "../terminal/types.js";

const whoami: Command = (_args, _stdin, shell) => {
    return shell.currentUser?.username ?? "unknown";
};

export default whoami;
