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

    get(id: number): User | undefined {
        return this.userDb.get(id);
    }

    remove(id: number): void {
        this.userDb.remove(id);
    }

    update(user: User): User {
        this.userDb.save(user);
        return user;
    }
}
