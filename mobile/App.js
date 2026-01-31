import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Alert, Platform, Linking, ToastAndroid, Share, RefreshControl, useWindowDimensions, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Home, Heart, Settings, ArrowRight, Shield, HelpCircle, Info, ChevronLeft, ChevronRight, Copy, ExternalLink, Share2, User, Sparkles, ShoppingBag } from 'lucide-react-native';
import { useRef } from 'react';
import { Animated } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as IntentLauncher from 'expo-intent-launcher';

// API URL - Using Hostinger VPS (SSL Connected)
// API URL - Using Hostinger VPS (SSL Connected)
const API_URL = 'https://sdkv.online/api/prompts';

// Mock Data fallback
const MOCK_DATA = [
  { id: '1', title: 'Cyberpunk City', imageUrl: 'https://images.unsplash.com/photo-1515630278258-407f66498911?q=80', prompt: 'Prompt...', style: 'Cinematic' },
  { id: '2', title: 'Golden Puppy', imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?q=80', prompt: 'Prompt...', style: 'Realistic' },
];

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const FeedCard = ({ item, navigation, opacity }) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Details', { item })}
    >
      <View>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          onLoadEnd={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: '#1a1a1a',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1
              }
            ]}
          >
            <ActivityIndicator size="small" color="#D946EF" />
          </View>
        )}
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );
};

function FeedScreen({ setFavorites, favorites, category, navigation }) {
  const [allPrompts, setAllPrompts] = useState([]);
  const [displayedPrompts, setDisplayedPrompts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();

  // Animation for skeleton
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    // Filter and slice whenever search, allPrompts, or visibleCount changes
    const filtered = allPrompts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    setDisplayedPrompts(filtered.slice(0, visibleCount));
  }, [search, allPrompts, visibleCount]);

  const fetchPrompts = async () => {
    setLoading(true);

    // Strict Rule: The current API data is ONLY for the 'Men' section.
    if (category !== 'Men') {
      // For Women, Product, etc., we currently have no data.
      // So we set empty array and stop loading immediately (or with small delay).
      setTimeout(() => {
        setAllPrompts([]); // Show nothing
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const finalData = data.length ? data : MOCK_DATA;
      setAllPrompts(finalData);
    } catch (e) {
      console.log('Error fetching, using mock:', e);
      setAllPrompts(MOCK_DATA);
    } finally {
      // Fake delay for seeing animation implies premium feel (only for Men who have data)
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrompts();
    setRefreshing(false);
    setVisibleCount(10); // Reset on refresh
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  const LoadingSkeleton = () => (
    <View style={styles.columnWrapper}>
      {[...Array(6)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.card,
            {
              height: 200,
              backgroundColor: '#1a1a1a',
              borderColor: '#333',
              opacity: opacity
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{category === 'Men' ? 'AI Photo Prompt - Pearl' : category}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${category} styles...`}
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.grid}>
          <LoadingSkeleton />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D946EF"
              colors={['#D946EF']}
            />
          }
        >
          <View style={styles.columnWrapper}>
            {displayedPrompts.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                navigation={navigation}
                opacity={opacity}
              />
            ))}
          </View>

          {displayedPrompts.length < allPrompts.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).length && (
            <TouchableOpacity onPress={loadMore} style={styles.loadMoreBtn}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Stacks for each tab to handle navigation
function MenStackScreen({ favorites, setFavorites }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0a0a0a' } }}>
      <Stack.Screen name="MenFeed">
        {(props) => <FeedScreen {...props} category="Men" setFavorites={setFavorites} favorites={favorites} />}
      </Stack.Screen>
      <Stack.Screen name="Details">
        {(props) => <DetailsScreen {...props} setFavorites={setFavorites} favorites={favorites} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function WomenStackScreen({ favorites, setFavorites }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0a0a0a' } }}>
      <Stack.Screen name="WomenFeed">
        {(props) => <FeedScreen {...props} category="Women" setFavorites={setFavorites} favorites={favorites} />}
      </Stack.Screen>
      <Stack.Screen name="Details">
        {(props) => <DetailsScreen {...props} setFavorites={setFavorites} favorites={favorites} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function ProductStackScreen({ favorites, setFavorites }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0a0a0a' } }}>
      <Stack.Screen name="ProductFeed">
        {(props) => <FeedScreen {...props} category="Product" setFavorites={setFavorites} favorites={favorites} />}
      </Stack.Screen>
      <Stack.Screen name="Details">
        {(props) => <DetailsScreen {...props} setFavorites={setFavorites} favorites={favorites} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

function FavoritesStackScreen({ favorites, setFavorites }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0a0a0a' } }}>
      <Stack.Screen name="FavFeed">
        {(props) => <FavoritesScreen {...props} favorites={favorites} />}
      </Stack.Screen>
      <Stack.Screen name="Details">
        {(props) => <DetailsScreen {...props} setFavorites={setFavorites} favorites={favorites} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}


function DetailsScreen({ route, favorites, setFavorites }) {
  const { item } = route.params;
  const navigation = useNavigation();
  const isFav = favorites.find(f => f.id === item.id);

  // Standard Animated Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const toggleFavorite = () => {
    if (isFav) {
      setFavorites(favorites.filter(f => f.id !== item.id));
    } else {
      setFavorites([...favorites, item]);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(item.prompt);
    Alert.alert('Copied!', 'Prompt copied to clipboard.');
  }

  const onShare = async () => {
    try {
      const message = `${item.prompt}\n\nShared via AI Photo Prompt - Pearl`;

      await Share.share({
        message: message,
        title: 'Share Prompt'
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="white" size={24} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Heart fill={isFav ? "red" : "transparent"} color={isFav ? "red" : "#06B6D4"} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Animated.Image
          source={{ uri: item.imageUrl }}
          style={[styles.detailImage, { opacity: fadeAnim }]}
        />

        <Animated.View style={[styles.tagContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.tag}>{item.style}</Text>
        </Animated.View>

        <Animated.Text style={[styles.detailTitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {item.title}
        </Animated.Text>

        <Animated.View style={[styles.promptBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.promptLabel}>Prompt:</Text>
          <Text style={styles.promptText}>{item.prompt}</Text>
        </Animated.View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={copyToClipboard}
          >
            <Copy color="white" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Copy Prompt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={onShare}
          >
            <Share2 color="white" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Share Prompt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FavoritesScreen({ favorites, navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {favorites.length === 0 ? (
          <Text style={{ color: '#666', textAlign: 'center', marginTop: 50 }}>No favorites yet.</Text>
        ) : (
          favorites.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.favCard}
              onPress={() => navigation.navigate('Details', { item })}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.favImage} />
              <View style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={{ color: '#888', fontSize: 12 }}>{item.style}</Text>
              </View>
              <ChevronRight color="#666" size={20} style={{ alignSelf: 'center', marginRight: 10 }} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsListScreen() {
  const navigation = useNavigation();

  const menuItems = [
    { title: 'Privacy Policy', icon: Shield, screen: 'Privacy' },
    { title: 'How to Use', icon: HelpCircle, screen: 'HowToUse' },
    { title: 'App Version Info', icon: Info, screen: 'Version' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <View style={{ padding: 20 }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingsItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
              <item.icon color="#D946EF" size={24} />
              <Text style={styles.settingsText}>{item.title}</Text>
            </View>
            <ChevronRight color="#666" size={20} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <View style={{ padding: 20 }}>
        <Text style={styles.sectionText}>
          We collect user prompts and image data to provide this service.
          Data is stored securely. Contact admin@pearl.com for concerns.
        </Text>
      </View>
    </SafeAreaView>
  )
}

function HowToUseScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How to Use</Text>
      </View>
      <View style={{ padding: 20 }}>
        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.sectionText}>Browse the Home feed for inspiration.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.sectionText}>Tap any photo to view the full prompt.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.sectionText}>Use the "Copy Prompt" button to use it elsewhere.</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

function VersionScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>App Version</Text>
      </View>
      <View style={{ padding: 20 }}>
        <View style={styles.row}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0 (Beta)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Developer</Text>
          <Text style={styles.value}>Pearl Team</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

function SettingsStackScreen() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#0a0a0a' }
    }}>
      <Stack.Screen name="SettingsList" component={SettingsListScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="HowToUse" component={HowToUseScreen} />
      <Stack.Screen name="Version" component={VersionScreen} />
    </Stack.Navigator>
  )
}

// Helper for safe area
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Main App Component with Logic
function MainApp() {
  const [favorites, setFavorites] = useState([]);
  const insets = useSafeAreaInsets(); // Now safe to use

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0a0a0a',
            borderTopColor: '#333',
            height: 70 + insets.bottom,
            paddingBottom: insets.bottom + 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#D946EF',
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'Men') return <User color={color} size={size} />;
            if (route.name === 'Women') return <Sparkles color={color} size={size} />;
            if (route.name === 'Product') return <ShoppingBag color={color} size={size} />;
            if (route.name === 'Favorites') return <Heart color={color} size={size} />;
            if (route.name === 'Settings') return <Settings color={color} size={size} />;
            return null;
          },
          tabBarLabel: ({ focused }) => {
            return <Text style={{ color: focused ? '#D946EF' : 'gray', fontSize: 10, marginTop: 4 }}>{route.name}</Text>;
          }
        })}
      >
        <Tab.Screen name="Men">
          {(props) => <MenStackScreen {...props} favorites={favorites} setFavorites={setFavorites} />}
        </Tab.Screen>
        <Tab.Screen name="Women">
          {(props) => <WomenStackScreen {...props} favorites={favorites} setFavorites={setFavorites} />}
        </Tab.Screen>
        <Tab.Screen name="Product">
          {(props) => <ProductStackScreen {...props} favorites={favorites} setFavorites={setFavorites} />}
        </Tab.Screen>
        <Tab.Screen name="Favorites">
          {(props) => <FavoritesStackScreen {...props} favorites={favorites} setFavorites={setFavorites} />}
        </Tab.Screen>
        <Tab.Screen name="Settings" component={SettingsStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Root Component
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MainApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#0a0a0a',
    gap: 10, // Add gap between items
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18, // Slightly smaller to fit better
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1, // Allow title to shrink/grow and push neighbors
    textAlign: 'center', // Center title
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60, // Reserve space for button
  },
  backBtnText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  grid: {
    padding: 10,
  },
  columnWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 0.8,
  },
  cardTitle: {
    color: '#fff',
    padding: 10,
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
  },
  detailTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  promptBox: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  promptLabel: {
    color: '#06B6D4',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  promptText: {
    color: '#ccc',
    lineHeight: 22,
  },
  btn: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#D946EF',
  },
  btnSecondary: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  tag: {
    color: '#D946EF',
    backgroundColor: 'rgba(217, 70, 239, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  favCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  favImage: {
    width: 80,
    height: 80,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1a1a1a',
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  settingsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  },
  sectionText: {
    color: '#ccc',
    lineHeight: 20,
    fontSize: 16
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    color: '#D946EF',
    marginRight: 10,
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    color: '#888',
    fontSize: 16
  },
  value: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  loadMoreBtn: {
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  loadMoreText: {
    color: '#D946EF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
