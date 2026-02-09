import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Alert, Share, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Zap, Heart, Settings, Shield, HelpCircle, Info, ChevronLeft, Copy, Share2, User, Sparkles, TrendingUp } from 'lucide-react-native';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, BannerAdSize, InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType, AppOpenAd } from 'react-native-google-mobile-ads';

const { width } = Dimensions.get('window');

// API URL
const API_URL = 'https://sdkv.online/api/prompts';

// AdMob IDs
const BANNER_AD_ID = 'ca-app-pub-9701184278274967/2110282579'; // Production ID
const INTERSTITIAL_AD_ID = 'ca-app-pub-3940256099942544/1033173712'; // Test ID
const REWARDED_AD_ID = 'ca-app-pub-3940256099942544/5224354917'; // Test ID
const APP_OPEN_AD_ID = 'ca-app-pub-9701184278274967/6376665373'; // Production ID

// Initialize Ads
const interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_ID);
const rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_ID);
const appOpenAd = AppOpenAd.createForAdRequest(APP_OPEN_AD_ID);

// --- Context ---
const FavoritesContext = React.createContext({
  favorites: [],
  setFavorites: () => { },
});

// --- Components ---

// Gradient Card Component
const GradientCard = ({ item, navigation }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.gradientCard}
        onPress={() => navigation.navigate('Details', { item })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            onLoadEnd={() => setImageLoading(false)}
          />
          {imageLoading && (
            <View style={[StyleSheet.absoluteFill, styles.imagePlaceholder]}>
              <ActivityIndicator size="small" color="#FF6B9D" />
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.cardTag}>
            <Text style={styles.cardTagText}>{item.style || 'Art'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Section Header
const SectionHeader = ({ title, icon: Icon, color }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLeft}>
      <View style={[styles.iconBadge, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={20} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={[styles.trendingBadge, { backgroundColor: color + '15' }]}>
      <TrendingUp color={color} size={14} />
      <Text style={[styles.trendingText, { color }]}>Trending</Text>
    </View>
  </View>
);

// --- Screens ---

// New Arrival Screen with Men/Women Sections
function NewArrivalScreen({ navigation }) {
  const [menPrompts, setMenPrompts] = useState([]);
  const [womenPrompts, setWomenPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // Filter prompts from last 24 hours
      const now = new Date();
      const last24h = data.filter(item => {
        if (!item.createdAt) return false;
        const createdDate = new Date(item.createdAt);
        const hoursDiff = (now - createdDate) / (1000 * 60 * 60);
        return hoursDiff <= 24;
      });

      // Separate by category
      const men = last24h.filter(item => (item.category || 'Men') === 'Men').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
      const women = last24h.filter(item => item.category === 'Women').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

      setMenPrompts(men);
      setWomenPrompts(women);
    } catch (e) {
      console.log('Error fetching:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrompts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Gradient */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Discover Fresh</Text>
            <Text style={styles.headerTitle}>New Arrivals ✨</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('SettingsList')}
            style={styles.settingsBtn}
          >
            <Settings color="#FF6B9D" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>Loading fresh content...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B9D" colors={['#FF6B9D']} />}
        >
          {/* Men Section */}
          {menPrompts.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Men's Collection" icon={User} color="#00D9FF" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {menPrompts.map((item) => (
                  <View key={item.id} style={styles.horizontalCard}>
                    <GradientCard item={item} navigation={navigation} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Women Section */}
          {womenPrompts.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Women's Collection" icon={Sparkles} color="#FF6B9D" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {womenPrompts.map((item) => (
                  <View key={item.id} style={styles.horizontalCard}>
                    <GradientCard item={item} navigation={navigation} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {menPrompts.length === 0 && womenPrompts.length === 0 && (
            <View style={styles.emptyState}>
              <Zap color="#666" size={60} />
              <Text style={styles.emptyText}>No new arrivals in last 24h</Text>
              <Text style={styles.emptySubtext}>Check back soon for fresh content!</Text>
            </View>
          )}

          <View style={{ height: 20 }} />

          {/* Banner Ad - Bottom - Medium Rectangle */}
          <View style={{ backgroundColor: '#0a0a0a', alignItems: 'center', paddingBottom: 20 }}>
            <BannerAd unitId={BANNER_AD_ID} size={BannerAdSize.MEDIUM_RECTANGLE} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Category Feed Screen (Men/Women)
function FeedScreen({ category, navigation }) {
  const [allPrompts, setAllPrompts] = useState([]);
  const [displayedPrompts, setDisplayedPrompts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const categoryColor = category === 'Men' ? '#00D9FF' : '#FF6B9D';

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    const filtered = allPrompts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    setDisplayedPrompts(filtered.slice(0, visibleCount));
  }, [search, allPrompts, visibleCount]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const validData = data.filter(item => {
        const itemCategory = item.category || 'Men';
        return itemCategory === category;
      });
      setAllPrompts(validData);
    } catch (e) {
      console.log('Error fetching:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrompts();
    setRefreshing(false);
    setVisibleCount(10);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Category Header */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Explore</Text>
            <Text style={styles.headerTitle}>{category}'s Gallery</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${category.toLowerCase()} styles...`}
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </View>

      {loading && displayedPrompts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={categoryColor} />
          <Text style={styles.loadingText}>Loading gallery...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={categoryColor} colors={[categoryColor]} />}
        >
          <View style={styles.gridContainer}>
            {displayedPrompts.map((item, index) => (
              <React.Fragment key={item.id}>
                <View style={styles.gridCard}>
                  <GradientCard item={item} navigation={navigation} />
                </View>
                {/* Insert Ad after every 6th item */}
                {(index + 1) % 6 === 0 && (
                  <View style={{ width: '100%', alignItems: 'center', marginVertical: 20 }}>
                    <BannerAd unitId={BANNER_AD_ID} size={BannerAdSize.MEDIUM_RECTANGLE} />
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>

          {displayedPrompts.length < allPrompts.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).length && (
            <TouchableOpacity
              onPress={() => setVisibleCount(c => c + 16)}
              style={[styles.loadMoreBtn, { borderColor: categoryColor, backgroundColor: '#1a1a1a' }]}
            >
              <View
                style={styles.loadMoreGradient}
              >
                <Text style={[styles.loadMoreText, { color: categoryColor }]}>Load More ✨</Text>
              </View>
            </TouchableOpacity>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function DetailsScreen({ route }) {
  const { item } = route.params;
  const navigation = useNavigation();
  const { favorites, setFavorites } = useContext(FavoritesContext);
  const isFav = favorites.find(f => f.id === item.id);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [ratio, setRatio] = useState(1);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);

  // Ad Event Listeners
  useEffect(() => {
    Image.getSize(item.imageUrl, (w, h) => setRatio(w / h), () => { });
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      // Ad Loaded
    });

    const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      setUnlocked(true);
      setLoading(false);
    });

    const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      setLoading(false);
      // Load next ad when current one closes
      rewardedAd.load();
    });

    // Load ad on mount if not loaded
    rewardedAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const showAd = () => {
    try {
      if (rewardedAd.loaded) {
        rewardedAd.show();
      } else {
        // Fallback: Unlock if ad fails to load
        setUnlocked(true);
        Alert.alert('✨ Unlocked!', 'Prompt unlocked successfully!');
      }
    } catch (error) {
      // Fallback on crash
      setUnlocked(true);
    } finally {
      setLoading(false);
    }
  };


  const handleUnlock = () => {
    Alert.alert(
      '🎁 Unlock Prompt',
      'Watch a short ad to unlock this prompt for free!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Unlock',
          onPress: () => {
            setLoading(true);
            setProgress(0);

            // Start Loading Ad explicitly if not ready
            if (!rewardedAd.loaded) {
              rewardedAd.load();
            }

            // Progress bar for 5 seconds (Reduced from 7 for better UX)
            let progressValue = 0;
            progressInterval.current = setInterval(() => {
              progressValue += 100 / 50; // 5 seconds = 50 steps
              setProgress(progressValue);

              if (progressValue >= 100) {
                if (progressInterval.current) clearInterval(progressInterval.current);
                showAd();
              }
            }, 100);
          }
        }
      ]
    );
  };

  const toggleFavorite = () => {
    if (isFav) setFavorites(favorites.filter(f => f.id !== item.id));
    else setFavorites([...favorites, item]);
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(item.prompt);
    Alert.alert('✨ Copied!', 'Prompt copied to clipboard.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={styles.backBtnCircle}>
            <ChevronLeft color="white" size={24} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
          <View style={[styles.favBtnCircle, isFav && styles.favBtnActive]}>
            <Heart fill={isFav ? "#FF6B9D" : "transparent"} color={isFav ? "#FF6B9D" : "white"} size={24} />
          </View>
        </TouchableOpacity>
      </View>


      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.Image
          source={{ uri: item.imageUrl }}
          style={[styles.detailImage, { opacity: fadeAnim, aspectRatio: ratio }]}
        />

        <View style={styles.detailContent}>
          <View style={styles.detailTagRow}>
            <View style={styles.detailTag}>
              <Text style={styles.detailTagText}>{item.style || 'Art'}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category || 'Men'}</Text>
            </View>
          </View>

          <Text style={styles.detailTitle}>{item.title}</Text>

          {unlocked ? (
            <View style={styles.promptContainer}>
              <View style={styles.promptBox}>
                <Text style={styles.promptLabel}>✨ AI Prompt</Text>
                <Text style={styles.promptText}>{item.prompt}</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF6B9D' }]} onPress={copyToClipboard}>
                  <View style={styles.actionBtnGradient}>
                    <Copy color="white" size={20} />
                    <Text style={styles.actionBtnText}>Copy</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#00D9FF' }]} onPress={() => Share.share({ message: item.prompt })}>
                  <View style={styles.actionBtnGradient}>
                    <Share2 color="white" size={20} />
                    <Text style={styles.actionBtnText}>Share</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <TouchableOpacity
                style={[styles.unlockBtn, { backgroundColor: '#FF6B9D', opacity: loading ? 0.7 : 1 }]}
                onPress={handleUnlock}
                disabled={loading}
              >
                <View style={styles.unlockBtnGradient}>
                  <Zap color="white" size={20} />
                  <Text style={styles.unlockBtnText}>{loading ? 'Loading...' : 'Unlock Prompt'}</Text>
                </View>
              </TouchableOpacity>

              {/* Progress Bar */}
              {loading && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(progress)}% - {progress < 100 ? 'Loading ad...' : 'Ready!'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}

function FavoritesScreen({ navigation }) {
  const { favorites } = useContext(FavoritesContext);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Your Collection</Text>
            <Text style={styles.headerTitle}>Favourites ❤️</Text>
          </View>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart color="#666" size={60} />
          <Text style={styles.emptyText}>No favourites yet</Text>
          <Text style={styles.emptySubtext}>Start saving your favorite prompts!</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.favGridContainer}>
            {favorites.map((item) => (
              <View key={item.id} style={styles.favGridCard}>
                <TouchableOpacity
                  style={styles.favCardTouchable}
                  onPress={() => navigation.navigate('Details', { item })}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.favGridImage} />
                  <View style={styles.favCardOverlay}>
                    <View style={styles.favCardContent}>
                      <Text style={styles.favCardTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={styles.favCardTag}>
                        <Text style={styles.favCardTagText}>{item.style || 'Art'}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={{ height: 40 }} />

          {/* Ad at Bottom of Favorites */}
          <View style={{ alignItems: 'center', paddingBottom: 20 }}>
            <BannerAd unitId={BANNER_AD_ID} size={BannerAdSize.MEDIUM_RECTANGLE} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Settings Screens (keeping them minimal and modern)
function PrivacyScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={styles.backBtnCircle}>
            <ChevronLeft color="white" size={24} />
          </View>
        </TouchableOpacity>
        <Text style={styles.settingsHeaderTitle}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.settingsText}>
          Last updated: February 2, 2026{"\n\n"}
          1. Introduction{"\n"}Welcome to AI Photo Prompt - Pearl. We respect your privacy.{"\n\n"}
          2. Data Collection{"\n"}We use Google AdMob and Analytics for app performance.{"\n\n"}
          3. Local Storage{"\n"}Your favorites are stored locally on your device.{"\n\n"}
          4. Contact{"\n"}Email: pearlproduction9@gmail.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function HowToUseScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={styles.backBtnCircle}>
            <ChevronLeft color="white" size={24} />
          </View>
        </TouchableOpacity>
        <Text style={styles.settingsHeaderTitle}>How to Use</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.stepTitle}>1. Browse Styles</Text>
        <Text style={styles.stepText}>Explore Men or Women categories{"\n"}</Text>
        <Text style={styles.stepTitle}>2. Unlock Prompt</Text>
        <Text style={styles.stepText}>Tap image and unlock the AI prompt{"\n"}</Text>
        <Text style={styles.stepTitle}>3. Copy & Create</Text>
        <Text style={styles.stepText}>Use in ChatGPT, Midjourney, or Gemini{"\n"}</Text>
        <Text style={styles.stepTitle}>4. Customize</Text>
        <Text style={styles.stepText}>Modify the prompt to your needs</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function VersionScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={styles.backBtnCircle}>
            <ChevronLeft color="white" size={24} />
          </View>
        </TouchableOpacity>
        <Text style={styles.settingsHeaderTitle}>App Info</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <Sparkles color="#FF6B9D" size={60} />
        <Text style={styles.appName}>Pearl AI</Text>
        <Text style={styles.appVersion}>Version 2.2</Text>
        <Text style={styles.appDescription}>
          Curated AI prompts for creators, designers, and enthusiasts. Get high-quality results from Midjourney, Stable Diffusion & more.
        </Text>
        <Text style={styles.appContact}>Contact: pearlproduction9@gmail.com</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsListScreen() {
  const navigation = useNavigation();
  const menuItems = [
    { title: 'Privacy Policy', icon: Shield, screen: 'Privacy', color: '#00D9FF' },
    { title: 'How to Use', icon: HelpCircle, screen: 'HowToUse', color: '#FF6B9D' },
    { title: 'App Info', icon: Info, screen: 'Version', color: '#9D00FF' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={styles.backBtnCircle}>
            <ChevronLeft color="white" size={24} />
          </View>
        </TouchableOpacity>
        <Text style={styles.settingsHeaderTitle}>Settings</Text>
      </View>
      <View style={{ padding: 20 }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.settingsItem} onPress={() => navigation.navigate(item.screen)}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: item.color + '20' }]}>
                <item.icon color={item.color} size={22} />
              </View>
              <Text style={styles.settingsItemText}>{item.title}</Text>
            </View>
            <ChevronLeft color="#666" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// --- Navigation ---

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MenFeed(props) { return <FeedScreen {...props} category="Men" />; }
function WomenFeed(props) { return <FeedScreen {...props} category="Women" />; }

function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopWidth: 0,
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarActiveTintColor: '#FF6B9D',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let IconComponent;
          if (route.name === 'NewArrival') IconComponent = Zap;
          if (route.name === 'Men') IconComponent = User;
          if (route.name === 'Women') IconComponent = Sparkles;
          if (route.name === 'Favourites') IconComponent = Heart;

          return (
            <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
              <IconComponent color={color} size={size} />
            </View>
          );
        }
      })}
    >
      <Tab.Screen name="NewArrival" component={NewArrivalScreen} options={{ tabBarLabel: 'New' }} />
      <Tab.Screen name="Men" component={MenFeed} />
      <Tab.Screen name="Women" component={WomenFeed} />
      <Tab.Screen name="Favourites" component={FavoritesScreen} options={{ tabBarLabel: 'Saved' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0a0a0a' } }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="SettingsList" component={SettingsListScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="HowToUse" component={HowToUseScreen} />
      <Stack.Screen name="Version" component={VersionScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [favorites, setFavorites] = useState([]);
  const [appOpenAdLoaded, setAppOpenAdLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Load favorites
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('userFavorites');
        if (stored) setFavorites(JSON.parse(stored));
      } catch (e) { }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('userFavorites', JSON.stringify(favorites)).catch(() => { });
  }, [favorites]);

  // Load and show App Open Ad - ONCE ONLY
  useEffect(() => {
    let hasShown = false;

    const unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      if (!hasShown) {
        hasShown = true;
        setAppOpenAdLoaded(true);
        appOpenAd.show();
      }
    });

    const unsubscribeClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      setAppOpenAdLoaded(false);
      // DO NOT RELOAD HERE
    });

    appOpenAd.load();

    // Splash Screen Timer (7 seconds)
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 7000);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      clearTimeout(splashTimer);
    };
  }, []);

  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <View style={{ alignItems: 'center', gap: 20 }}>
          {/* Splash Image removed temporarily due to build error with file format */}
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#FF6B9D' }}>Pearl AI</Text>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={{ color: '#666', marginTop: 10, fontSize: 14 }}>Loading Experience...</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FavoritesContext.Provider value={{ favorites, setFavorites }}>
          <NavigationContainer>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </FavoritesContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  // Header Styles
  headerGradient: { paddingBottom: 20, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  headerSubtitle: { fontSize: 14, color: '#888', fontWeight: '500', marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', letterSpacing: -0.5 },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },

  // Search
  searchContainer: { paddingHorizontal: 20, marginTop: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#222' },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, color: 'white', fontSize: 15 },

  // Section
  section: { marginTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBadge: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  trendingText: { fontSize: 11, fontWeight: '600' },

  // Horizontal Scroll
  horizontalScroll: { paddingLeft: 20, paddingRight: 10 },
  horizontalCard: { marginRight: 16 },

  // Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 20 },
  gridCard: { width: '48%', marginHorizontal: '1%', marginBottom: 16 },

  // Gradient Card
  gradientCard: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  cardImageContainer: { position: 'relative', width: width * 0.42, height: width * 0.56 },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(0,0,0,0.6)' },
  imagePlaceholder: { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: 'white', marginBottom: 8 },
  cardTag: { alignSelf: 'flex-start', backgroundColor: '#FF6B9D20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cardTagText: { fontSize: 11, color: '#FF6B9D', fontWeight: '600' },

  // Load More
  loadMoreBtn: { marginHorizontal: 20, marginTop: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  loadMoreGradient: { paddingVertical: 16, alignItems: 'center' },
  loadMoreText: { fontSize: 16, fontWeight: 'bold' },

  // Loading & Empty
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#666', marginTop: 12, fontSize: 14 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyText: { color: '#888', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#666', fontSize: 14, marginTop: 8 },

  // Detail Screen
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { zIndex: 10 },
  backBtnCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a1a1a80', justifyContent: 'center', alignItems: 'center' },
  favBtn: { zIndex: 10 },
  favBtnCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a1a1a80', justifyContent: 'center', alignItems: 'center' },
  favBtnActive: { backgroundColor: '#FF6B9D20' },
  detailImage: { width: '100%', borderRadius: 0 },
  detailContent: { padding: 20 },
  detailTagRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  detailTag: { backgroundColor: '#FF6B9D20', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  detailTagText: { color: '#FF6B9D', fontSize: 13, fontWeight: '600' },
  categoryBadge: { backgroundColor: '#00D9FF20', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  categoryBadgeText: { color: '#00D9FF', fontSize: 13, fontWeight: '600' },
  detailTitle: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 24, lineHeight: 32 },

  // Prompt
  promptContainer: { marginTop: 10 },
  promptBox: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#222', backgroundColor: '#1a1a1a' },
  promptLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  promptText: { fontSize: 15, color: '#ddd', lineHeight: 24 },

  // Actions
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  actionBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  actionBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  actionBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Unlock
  unlockBtn: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  unlockBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  unlockBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // Progress Bar
  progressContainer: { marginTop: 16, alignItems: 'center' },
  progressBar: { width: '100%', height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00D9FF', borderRadius: 3 },
  progressText: { color: '#888', fontSize: 12, marginTop: 8, fontWeight: '500' },

  // Favorites - New Grid Layout
  favGridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 20 },
  favGridCard: { width: '48%', marginHorizontal: '1%', marginBottom: 16 },
  favCardTouchable: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  favGridImage: { width: '100%', height: width * 0.56, resizeMode: 'cover' },
  favCardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12 },
  favCardContent: { gap: 8 },
  favCardTitle: { fontSize: 14, fontWeight: 'bold', color: 'white', lineHeight: 18 },
  favCardTag: { alignSelf: 'flex-start', backgroundColor: '#FF6B9D20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  favCardTagText: { fontSize: 11, color: '#FF6B9D', fontWeight: '600' },
  // Settings
  settingsHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  settingsHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  settingsItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 16, borderRadius: 16, marginBottom: 12 },
  settingsItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingsIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingsItemText: { fontSize: 16, color: 'white', fontWeight: '500' },
  settingsText: { color: '#ccc', fontSize: 15, lineHeight: 24 },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF6B9D', marginBottom: 8, marginTop: 16 },
  stepText: { fontSize: 15, color: '#ccc', lineHeight: 22 },
  appName: { fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 20 },
  appVersion: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 24 },
  appDescription: { fontSize: 15, color: '#ccc', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  appContact: { fontSize: 14, color: '#888' },

  // Tab Bar
  tabIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tabIconActive: { backgroundColor: '#FF6B9D15' },
});
