import { UserManager } from "./users/index.js";
import { Terminal } from "./terminal/index.js";
import { Shell } from "./terminal/shell.js";
import { GameFileSystem } from "./filesystem/index.js";

const userManager = new UserManager();
const fs = new GameFileSystem();
const terminal = new Terminal(userManager, fs);

terminal.start();
