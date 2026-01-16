import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { EventFromAPI } from './eventsApi';
// Importar tipos oficiales para asegurar consistencia
import type { Alert, Route, User } from './adminApi';

export interface PendingOperation {
    id: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    endpoint: string;
    method: 'POST' | 'PUT' | 'DELETE';
    data?: any;
    headers: Record<string, string>;
    timestamp: number;
    retries: number;
    status: 'pending' | 'syncing' | 'failed';
    error?: string;
}

// Reutilizar tipos de adminApi para consistencia total
export type AlertFromAPI = Alert;
export type RouteFromAPI = Route;
export type UserFromAPI = User;

interface CuencaEventosDB extends DBSchema {
    events: {
        key: string;
        value: EventFromAPI;
        indexes: { 'by-date': string };
    };
    alerts: {
        key: string;
        value: AlertFromAPI;
        indexes: { 'by-active': number };
    };
    routes: {
        key: string;
        value: RouteFromAPI;
    };
    users: {
        key: string;
        value: UserFromAPI;
        indexes: { 'by-role': string };
    };
    pendingOperations: {
        key: string;
        value: PendingOperation;
        indexes: { 'by-timestamp': number };
    };
    agenda: {
        key: string;
        value: {
            userId: string;
            attending: string[];
            interested: string[];
        };
    };
}

const DB_NAME = 'cuenca-eventos-db';
const DB_VERSION = 4; // Incrementado para nuevos stores

let dbPromise: Promise<IDBPDatabase<CuencaEventosDB>>;

export const initDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<CuencaEventosDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                // Events store (v1)
                if (!db.objectStoreNames.contains('events')) {
                    const store = db.createObjectStore('events', { keyPath: '_id' });
                    store.createIndex('by-date', 'date');
                }

                // Pending operations store (v2)
                if (oldVersion < 2 && !db.objectStoreNames.contains('pendingOperations')) {
                    const opsStore = db.createObjectStore('pendingOperations', { keyPath: 'id' });
                    opsStore.createIndex('by-timestamp', 'timestamp');
                }

                // Alerts, Routes, Users stores (v3)
                if (oldVersion < 3) {
                    if (!db.objectStoreNames.contains('alerts')) {
                        const alertsStore = db.createObjectStore('alerts', { keyPath: '_id' });
                        alertsStore.createIndex('by-active', 'is_active');
                    }

                    if (!db.objectStoreNames.contains('routes')) {
                        db.createObjectStore('routes', { keyPath: '_id' });
                    }

                    if (!db.objectStoreNames.contains('users')) {
                        const usersStore = db.createObjectStore('users', { keyPath: '_id' });
                        usersStore.createIndex('by-role', 'role');
                    }
                }

                // Agenda store (v4)
                if (oldVersion < 4) {
                    if (!db.objectStoreNames.contains('agenda')) {
                        db.createObjectStore('agenda', { keyPath: 'userId' });
                    }
                }
            },
        });
    }
    return dbPromise;
};

export const dbService = {
    async saveEvents(events: EventFromAPI[]) {
        const db = await initDB();
        const tx = db.transaction('events', 'readwrite');
        const store = tx.objectStore('events');

        // Clear old events or merge? For simplified cache, we might want to clear and replace
        // or upsert. Let's upsert.
        for (const event of events) {
            await store.put(event);
        }
        await tx.done;
    },

    async getEvents(): Promise<EventFromAPI[]> {
        const db = await initDB();
        return db.getAllFromIndex('events', 'by-date');
    },

    async getEvent(id: string): Promise<EventFromAPI | undefined> {
        const db = await initDB();
        return db.get('events', id);
    },

    async clearEvents() {
        const db = await initDB();
        await db.clear('events');
    },

    async deleteEvent(id: string) {
        const db = await initDB();
        await db.delete('events', id);
    },

    async saveEvent(event: EventFromAPI) {
        const db = await initDB();
        await db.put('events', event);
    },

    // Alerts Cache
    async saveAlerts(alerts: AlertFromAPI[]) {
        const db = await initDB();
        const tx = db.transaction('alerts', 'readwrite');
        for (const alert of alerts) {
            await tx.store.put(alert);
        }
        await tx.done;
    },

    async getAlerts(): Promise<AlertFromAPI[]> {
        const db = await initDB();
        return db.getAll('alerts');
    },

    async clearAlerts() {
        const db = await initDB();
        await db.clear('alerts');
    },

    async deleteAlert(id: string) {
        const db = await initDB();
        await db.delete('alerts', id);
    },

    async saveAlert(alert: AlertFromAPI) {
        const db = await initDB();
        await db.put('alerts', alert);
    },

    // Routes Cache
    async saveRoutes(routes: RouteFromAPI[]) {
        const db = await initDB();
        const tx = db.transaction('routes', 'readwrite');
        for (const route of routes) {
            await tx.store.put(route);
        }
        await tx.done;
    },

    async getRoutes(): Promise<RouteFromAPI[]> {
        const db = await initDB();
        return db.getAll('routes');
    },

    async clearRoutes() {
        const db = await initDB();
        await db.clear('routes');
    },

    async deleteRoute(id: string) {
        const db = await initDB();
        await db.delete('routes', id);
    },

    async saveRoute(route: RouteFromAPI) {
        const db = await initDB();
        await db.put('routes', route);
    },

    // Users Cache
    async saveUsers(users: UserFromAPI[]) {
        const db = await initDB();
        const tx = db.transaction('users', 'readwrite');
        for (const user of users) {
            await tx.store.put(user);
        }
        await tx.done;
    },

    async getUsers(): Promise<UserFromAPI[]> {
        const db = await initDB();
        return db.getAll('users');
    },

    async clearUsers() {
        const db = await initDB();
        await db.clear('users');
    },

    async deleteUser(id: string) {
        const db = await initDB();
        await db.delete('users', id);
    },

    async saveUser(user: UserFromAPI) {
        const db = await initDB();
        await db.put('users', user);
    },

    // Pending Operations Queue
    async addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries' | 'status'>) {
        const db = await initDB();
        const pendingOp: PendingOperation = {
            ...operation,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            retries: 0,
            status: 'pending'
        };
        await db.add('pendingOperations', pendingOp);
        return pendingOp;
    },

    async getPendingOperations(): Promise<PendingOperation[]> {
        const db = await initDB();
        return db.getAllFromIndex('pendingOperations', 'by-timestamp');
    },

    async updateOperationStatus(id: string, status: PendingOperation['status'], error?: string) {
        const db = await initDB();
        const op = await db.get('pendingOperations', id);
        if (op) {
            op.status = status;
            if (error) op.error = error;
            if (status === 'syncing') op.retries++;
            await db.put('pendingOperations', op);
        }
    },

    async removePendingOperation(id: string) {
        const db = await initDB();
        await db.delete('pendingOperations', id);
    },

    async clearPendingOperations() {
        const db = await initDB();
        await db.clear('pendingOperations');
    },

    // User Agenda Cache
    async saveAgenda(userId: string, agenda: { attending: string[], interested: string[] }) {
        const db = await initDB();
        await db.put('agenda', { userId, ...agenda });
    },

    async getAgenda(userId: string) {
        const db = await initDB();
        return db.get('agenda', userId);
    }
};
