// User storage utilities for sessionStorage-based registration
import { User } from './eventData';

const REGISTERED_USERS_KEY = 'cuenca-eventos-registered-users';

// Get all registered users from sessionStorage
export function getRegisteredUsers(): User[] {
    const stored = sessionStorage.getItem(REGISTERED_USERS_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    return [];
}

// Register a new user
export function registerUser(userData: Omit<User, 'id'>): User {
    const users = getRegisteredUsers();

    // Generate new ID (start from 100 to avoid conflicts with mock users)
    const newId = users.length > 0
        ? Math.max(...users.map(u => u.id)) + 1
        : 100;

    const newUser: User = {
        ...userData,
        id: newId,
    };

    users.push(newUser);
    sessionStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    return newUser;
}

// Find a user by email (for login)
export function findUserByEmail(email: string): User | undefined {
    const users = getRegisteredUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Check if email already exists
export function emailExists(email: string): boolean {
    const users = getRegisteredUsers();
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}
