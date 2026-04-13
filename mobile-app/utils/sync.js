import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getDB, initDB } from './db';

const SYNC_QUEUE_KEY = '@sync_queue';
const API_URL = 'http://10.0.2.2:5000/api';

// Initialize DB on first import
initDB();

export const queueAction = async (action) => {
    try {
        const db = await getDB();
        const actionStr = JSON.stringify({ ...action, offlineId: Date.now().toString() });
        const timestamp = Date.now();
        
        await db.runAsync(
            'INSERT INTO sync_queue (action, timestamp) VALUES (?, ?)',
            [actionStr, timestamp]
        );
        
        console.log('Action queued in SQLite');
    } catch (error) {
        console.error('Failed to queue action in SQLite', error);
        // Fallback or alert user
    }
};

export const syncData = async () => {
    try {
        const db = await getDB();
        
        // 1. Check legacy queue and migrate/clear if exists
        const legacyQueue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
        if (legacyQueue) {
            console.log('Clearing legacy AsyncStorage queue...');
            await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
        }

        // 2. Fetch all from SQLite
        const rows = await db.getAllAsync('SELECT * FROM sync_queue ORDER BY timestamp ASC');
        if (rows.length === 0) return;

        const actions = rows.map(row => JSON.parse(row.action));

        // 3. Post to backend
        const response = await axios.post(`${API_URL}/sync`, { actions });
        
        if (response.status === 200) {
            // 4. Clear SQLite queue on success
            await db.runAsync('DELETE FROM sync_queue');
            console.log('SQLite sync queue cleared');
            return response.data.results;
        }
    } catch (error) {
        console.error('Sync failed', error);
    }
};
