import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useLikes, AIImage } from '../../hooks/useLikes';
import ImageCard from '../../components/ImageCard';
import { useFocusEffect } from 'expo-router';

export default function LikesScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { likedImages, toggleLike, loading, refreshLikes } = useLikes();

    // Refresh likes when screen comes into focus in case changes happened elsewhere
    useFocusEffect(
        useCallback(() => {
            refreshLikes();
        }, [refreshLikes])
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Liked AI Images</Text>

            {/* Loading State */}
            {loading && <ActivityIndicator size="small" color={theme.tint} style={{ marginTop: 20 }} />}

            {!loading && likedImages.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: theme.icon }]}>No liked images yet.</Text>
                    <Text style={[styles.subText, { color: theme.icon }]}>Explore and double tap to like!</Text>
                </View>
            ) : (
                <FlatList<AIImage>
                    data={likedImages}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <ImageCard
                            item={item}
                            isLiked={true}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 60,
        paddingHorizontal: 20,
    },
    list: {
        paddingBottom: 20,
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
    },
    subText: {
        fontSize: 14,
    },
});
