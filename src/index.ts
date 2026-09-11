import { UserManager } from "./users/index.js";
import { Terminal } from "./terminal/index.js";
import { GameFileSystem } from "./filesystem/index.js";
import { PathResolver } from "./filesystem/pathResolver.js";

const userManager = new UserManager();
const fs = new GameFileSystem();
const pathResolver = new PathResolver(fs);
const terminal = new Terminal(userManager, fs, pathResolver);

terminal.start();
