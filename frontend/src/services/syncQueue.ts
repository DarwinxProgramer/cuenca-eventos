/**
 * Sync Queue Manager - Gestiona la sincronización de operaciones offline
 * Se encarga de procesar la cola de operaciones pendientes cuando hay conexión
 */

import { dbService, PendingOperation } from './db';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const MAX_RETRIES = 3;

class SyncQueueManager {
    private isSync: boolean = false;
    private listeners: Set<() => void> = new Set();

    constructor() {
        // Escuchar evento online para auto-sync
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                console.log('🌐 Conexión recuperada, iniciando sincronización...');
                this.processPendingOperations();
            });
        }
    }

    /**
     * Subscribirse a cambios en el estado de sincronización
     */
    subscribe(callback: () => void) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Notificar a los listeners sobre cambios
     */
    private notify() {
        this.listeners.forEach(callback => callback());
    }

    /**
     * Agregar operación a la cola
     */
    async queueOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries' | 'status'>) {
        console.log('[SyncQueue] Adding operation to queue:', operation);
        await dbService.addPendingOperation(operation);
        this.notify();

        console.log('[SyncQueue] Showing toast notification');
        toast('Datos guardados EN MODO OFFLINE. Se sincronizarán automáticamente al recuperar la conexión.', {
            icon: '📡',
            duration: 6000,
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                border: '1px solid #fbbf24', // Amber warning border
            },
        });
        console.log('[SyncQueue] Toast called');
    }

    /**
     * Obtener conteo de operaciones pendientes
     */
    async getPendingCount(): Promise<number> {
        const operations = await dbService.getPendingOperations();
        return operations.filter(op => op.status === 'pending').length;
    }

    /**
     * Procesar todas las operaciones pendientes
     */
    async processPendingOperations(): Promise<void> {
        if (this.isSync) {
            console.log('⚠️ Sincronización ya en progreso');
            return;
        }

        const operations = await dbService.getPendingOperations();
        const pending = operations.filter(op => op.status === 'pending' && op.retries < MAX_RETRIES);

        if (pending.length === 0) {
            return;
        }

        this.isSync = true;
        this.notify();

        let successCount = 0;
        let failedCount = 0;

        for (const operation of pending) {
            try {
                await this.syncOperation(operation);
                await dbService.removePendingOperation(operation.id);
                successCount++;
            } catch (error) {
                failedCount++;
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

                if (operation.retries + 1 >= MAX_RETRIES) {
                    await dbService.updateOperationStatus(operation.id, 'failed', errorMessage);
                } else {
                    await dbService.updateOperationStatus(operation.id, 'pending', errorMessage);
                }
            }
        }

        this.isSync = false;
        this.notify();

        // Notificar resultado
        console.log('[SyncQueue] Sync completed. Success:', successCount, 'Failed:', failedCount);

        if (successCount > 0) {
            console.log('[SyncQueue] Showing success toast');
            toast.success(`✅ ${successCount} operación(es) sincronizadas correctamente`, {
                duration: 4000,
            });
        }

        if (failedCount > 0) {
            console.log('[SyncQueue] Showing error toast');
            toast.error(`❌ ${failedCount} operación(es) fallaron. Se reintentará más tarde.`, {
                duration: 4000,
            });
        }
    }

    /**
     * Sincronizar una operación individual
     */
    private async syncOperation(operation: PendingOperation): Promise<void> {
        await dbService.updateOperationStatus(operation.id, 'syncing');

        const response = await fetch(`${API_BASE_URL}${operation.endpoint}`, {
            method: operation.method,
            headers: {
                ...operation.headers,
                'Content-Type': 'application/json',
            },
            body: operation.data ? JSON.stringify(operation.data) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return response.json();
    }

    /**
     * Obtener estado de sincronización
     */
    isSyncing(): boolean {
        return this.isSync;
    }

    /**
     * Limpiar operaciones fallidas manualmente
     */
    async clearFailedOperations(): Promise<void> {
        const operations = await dbService.getPendingOperations();
        const failed = operations.filter(op => op.status === 'failed');

        for (const op of failed) {
            await dbService.removePendingOperation(op.id);
        }

        this.notify();
        toast.success(`🗑️ ${failed.length} operación(es) falladas eliminadas`);
    }
}

// Exportar instancia singleton
export const syncQueue = new SyncQueueManager();
