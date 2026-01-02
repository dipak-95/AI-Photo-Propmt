import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKES_KEY = '@fusion_gallery_likes';

export interface AIImage {
    _id: string;
    imageUrl: string;
    prompt: string;
    style?: string;
}

export const useLikes = () => {
    const [likedImages, setLikedImages] = useState<AIImage[]>([]);
    const [loading, setLoading] = useState(true);

    const loadLikes = useCallback(async () => {
        try {
            const storedLikes = await AsyncStorage.getItem(LIKES_KEY);
            if (storedLikes) {
                setLikedImages(JSON.parse(storedLikes));
            }
        } catch (error) {
            console.error('Error loading likes', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLikes();
    }, [loadLikes]);

    const isLiked = (id: string) => {
        return likedImages.some(img => img._id === id);
    };

    const toggleLike = async (image: AIImage) => {
        let newLikes;
        if (isLiked(image._id)) {
            newLikes = likedImages.filter(img => img._id !== image._id);
        } else {
            newLikes = [image, ...likedImages];
        }

        setLikedImages(newLikes);
        try {
            await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(newLikes));
        } catch (error) {
            console.error('Error saving likes', error);
        }
    };

    return { likedImages, isLiked, toggleLike, loading, refreshLikes: loadLikes };
};
