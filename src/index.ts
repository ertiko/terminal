import { UserManager } from "./users/index.js";

const userManager = new UserManager();

const user2 = userManager.get(51521);

console.log(user2);
