import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SYNC_QUEUE_KEY = '@sync_queue';
const API_URL = 'http://10.0.2.2:5000/api';

export const queueAction = async (action) => {
    const queue = JSON.parse(await AsyncStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    queue.push({ ...action, offlineId: Date.now().toString() });
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

export const syncData = async () => {
    const queue = JSON.parse(await AsyncStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    try {
        const response = await axios.post(`${API_URL}/sync`, { actions: queue });
        if (response.status === 200) {
            await AsyncStorage.setItem(SYNC_QUEUE_KEY, '[]'); // Clear queue on success
            return response.data.results;
        }
    } catch (error) {
        console.error('Sync failed', error);
    }
};
