import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    // Replace with your machine's IP address if testing on physical device
    // Android Emulator uses 10.0.2.2
    // Use your machine's IP address for both Android and iOS if testing on physical device
    // or specific emulator addresses.
    // DETECTED IP: 192.168.174.169
    return 'http://192.168.174.169:5000/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getImages = async (page = 1, limit = 10, search = '') => {
    try {
        const response = await api.get(`/images?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const likeImage = async (imageId: string) => {
    // Placeholder for backend like if implemented
};

export default api;
