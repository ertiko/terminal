import type { Command } from "../terminal/types.js";

const id: Command = (_args, _stdin, shell) => {
    const user = shell.currentUser;

    if (!user) {
        return "uid=unknown";
    }

    return `uid=${user.id}(${user.username})`;
};

export default id;
