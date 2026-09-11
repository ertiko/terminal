import type { Command } from "../terminal/types.js";

const echo: Command = (args, _stdin, _shell) => {
    let start = 0;

    if (args[0] === "-n") {
        start = 1;
    }

    return args.slice(start).join(" ");
};

export default echo;