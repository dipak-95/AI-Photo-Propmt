import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ImageCardProps {
    item: {
        _id: string;
        imageUrl: string;
        prompt: string;
        style?: string;
    };
    isLiked?: boolean;
    onLike?: () => void;
}

export default function ImageCard({ item, isLiked, onLike }: ImageCardProps) {
    const router = useRouter();

    const handlePress = () => {
        router.push({ pathname: '/image/[id]', params: { id: item._id, imageUrl: item.imageUrl, prompt: item.prompt } });
    };

    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handlePress}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <Text style={styles.prompt} numberOfLines={2}>{item.prompt}</Text>
                    <View style={styles.actions}>
                        {item.style && <View style={styles.badge}><Text style={styles.badgeText}>{item.style}</Text></View>}
                        {onLike && (
                            <TouchableOpacity
                                style={styles.likeBtn}
                                onPress={(e) => { e.stopPropagation(); onLike(); }}
                            >
                                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? "#ff4757" : "#fff"} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: (width / 2) - 15, // Grid width (2 columns)
        height: 250, // Reduced height
        borderRadius: 15,
        marginBottom: 15,
        backgroundColor: '#333',
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginHorizontal: 5
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        justifyContent: 'flex-end',
        padding: 15,
    },
    content: {
        marginBottom: 5,
    },
    prompt: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 10,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    likeBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 50,
    }
});
