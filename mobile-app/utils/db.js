import * as SQLite from 'expo-sqlite';

const dbName = 'healthhub.db';

export const initDB = async () => {
    const db = await SQLite.openDatabaseAsync(dbName);
    
    // Create sync_queue table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );
    `);
    
    return db;
};

export const getDB = async () => {
    return await SQLite.openDatabaseAsync(dbName);
};
