import { UserDatabase } from './userDatabase.js';
import { User } from './user.js';

export class UserManager {
    private userDb: UserDatabase;

    constructor() {
        this.userDb = new UserDatabase();
    }

    create(username: string, password: string, isRoot: number): User {
        const user = new User(username, password, isRoot);
        this.userDb.save(user);
        return user;
    }

    getById(id: number): User | undefined {
        return this.userDb.getById(id);
    }

    getByUsername(username: string): User | undefined {
        return this.userDb.getByUsername(username);
    }

    removeById(id: number): void {
        this.userDb.removeById(id);
    }

    removeByUsername(username: string): void {
        this.userDb.removeByUsername(username);
    }

    update(user: User): User {
        this.userDb.save(user);
        return user;
    }
}
