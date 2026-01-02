import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ImageCard from '../../components/ImageCard';
import { getImages } from '../../services/api';
import { useLikes, AIImage } from '../../hooks/useLikes';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { isLiked, toggleLike } = useLikes();

  const [images, setImages] = useState<AIImage[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Reset when search changes
  useEffect(() => {
    setPage(1);
    setImages([]);
    setHasMore(true);
    fetchImages(1, debouncedSearch, true);
  }, [debouncedSearch]);

  const fetchImages = async (pageNum: number, searchTerm: string, isNewSearch = false) => {
    if (loading && !isNewSearch) return;
    setLoading(true);
    try {
      const data = await getImages(pageNum, 10, searchTerm);
      if (data.images.length === 0) {
        setHasMore(false);
      } else {
        setImages(prev => isNewSearch ? data.images : [...prev, ...data.images]);
      }
    } catch (error) {
      console.log('Error fetching images:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchImages(nextPage, debouncedSearch);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchImages(1, debouncedSearch, true);
  }, [debouncedSearch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>AI Photo Gallery</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }]}>
        <Ionicons name="search" size={20} color={theme.icon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search prompts, styles..."
          placeholderTextColor={theme.icon}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={theme.icon} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList<AIImage>
        data={images}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ImageCard
            item={item}
            isLiked={isLiked(item._id)}
            onLike={() => toggleLike(item)}
          />
        )}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={loading && !refreshing ? <ActivityIndicator size="small" color={theme.tint} /> : null}
        ListEmptyComponent={!loading ? <Text style={[styles.empty, { color: theme.icon }]}>No images found.</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchBar: {
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
