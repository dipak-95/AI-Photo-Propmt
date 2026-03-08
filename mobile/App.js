import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity, TextInput,
  ScrollView, Alert, Share, RefreshControl, ActivityIndicator,
  Dimensions, Linking, Animated, Easing,
  FlatList, Pressable, Modal, Platform
} from 'react-native';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  Zap, Heart, Settings, Shield, HelpCircle, Info, ChevronLeft,
  Copy, Share2, User, Sparkles, TrendingUp, Coins, Crown,
  Menu, Bell, ChevronRight, Lock, Unlock, PlayCircle, LogOut,
  Mail, Star, MessageSquare, Edit2, Trash2, ShieldAlert
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, G, Text as SvgText, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as Notifications from 'expo-notifications';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  AppOpenAd,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  MobileAds
} from 'react-native-google-mobile-ads';

MobileAds().initialize();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const { width, height } = Dimensions.get('window');

// --- UTILS ---
const seededRandom = (s) => {
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};

const shuffleWithSeed = (array, seed) => {
  if (!array || !seed) return array;
  const newArray = [...array];
  let seedNum = 0;
  for (let i = 0; i < seed.length; i++) seedNum += seed.charCodeAt(i);
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seedNum + i) * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- CONSTANTS ---
const API_URL = 'https://sdkv.online/api/prompts';
const CONFIG_URL = 'https://sdkv.online/api/config';
const CURRENT_VERSION = '4.0.0';

const PROMPT_COST = 25; // coins
const FREE_SPIN_COOLDOWN = 2 * 60 * 60 * 1000; // 2 Hours

// --- AD CONFIG (AdMob) ---
const AD_IDS = {
  APP_OPEN: 'ca-app-pub-9701184278274967/6376665373',
  BANNER: 'ca-app-pub-9701184278274967/6594622379',
  ADAPTIVE_BANNER: 'ca-app-pub-9701184278274967/2110282579',
  INTERSTITIAL: 'ca-app-pub-9701184278274967/5638768935',
  REWARDED: 'ca-app-pub-9701184278274967/4323682251',
};

// Global Ad instances (Singleton-style)
const interstitialAd = InterstitialAd.createForAdRequest(AD_IDS.INTERSTITIAL);
const rewardedAd = RewardedAd.createForAdRequest(AD_IDS.REWARDED);
const appOpenAd = AppOpenAd.createForAdRequest(AD_IDS.APP_OPEN);

const COLORS = {
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    primary: '#8B5CF6',
    secondary: '#94A3B8',
    text: '#F1F5F9',
    subText: '#94A3B8',
    coin: '#FBBF24',
    premium: '#8B5CF6',
    border: '#334155',
    cardShadow: '#000000',
    accent: '#EC4899',
    success: '#10B981',
  },
  light: {
    background: '#F0F2FF',
    card: '#FFFFFF',
    primary: '#5B4CDB',
    secondary: '#7C3AED',
    text: '#1A1033',
    subText: '#6B7280',
    coin: '#F59E0B',
    premium: '#7C3AED',
    border: '#E4E4F7',
    cardShadow: '#5B4CDB',
    accent: '#EC4899',
    success: '#10B981',
  }
};

const UserContext = React.createContext({
  theme: 'light',
  userData: {
    unlockedIds: [],
    favorites: [],
    vouchers: { dayPass: 0, weekPass: 0 },
    subscription: { expiry: 0 }
  },
  hasSubscription: false,
  showAlert: () => { }
});

// --- COMPONENTS ---

const AppText = ({ style, variant = 'regular', ...props }) => {
  const fontFamily = variant === 'bold' ? 'Outfit_700Bold' : variant === 'semibold' ? 'Outfit_600SemiBold' : 'Outfit_400Regular';
  return <Text style={[{ fontFamily }, style]} {...props} />;
};

const CoinBadge = ({ amount, onPress }) => {
  const { theme } = useContext(UserContext);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Animated.View style={[styles.coinBadge, {
        backgroundColor: COLORS[theme].coin + '18',
        borderColor: COLORS[theme].coin + '60',
        borderWidth: 1.5,
        transform: [{ scale: pulse }],
        shadowColor: COLORS[theme].coin,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
      }]}>
        <Coins size={16} color={COLORS[theme].coin} fill={COLORS[theme].coin} />
        <AppText variant="semibold" style={[styles.coinAmount, { color: '#D97706' }]}>{amount}</AppText>
      </Animated.View>
    </TouchableOpacity>
  );
};

// --- SCREENS ---

function LoadingScreen() {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.linear })).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={styles.centerContainer}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Sparkles size={40} color="#5B4CDB" />
      </Animated.View>
      <AppText variant="semibold" style={{ color: '#5B4CDB', marginTop: 12, fontSize: 14 }}>Loading Prompts...</AppText>
    </View>
  );
}

// Helper to chunk data into rows (2 prompts or 1 ad)
const organizeIntoGrid = (data) => {
  if (!data || data.length === 0) return [];
  const result = [];
  let tempRow = [];

  data.forEach((item, index) => {
    tempRow.push(item);

    // Every 2 items (one full row of prompts), we check if we should inject an ad after
    if (tempRow.length === 2) {
      result.push({ type: 'prompts', items: tempRow });
      tempRow = [];

      // Inject ad every 2 rows (4 photos total)
      // Since result now contains 'rows', index 1 means 2 rows (4 items)
      if (result.length % 3 === 2) {
        result.push({ type: 'ad', id: `ad-${index}` });
      }
    }
  });

  // Handle remaining single item if any
  if (tempRow.length > 0) {
    result.push({ type: 'prompts', items: tempRow });
  }

  return result;
};

const AdCard = ({ theme }) => {
  const colorSet = COLORS[theme];
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <View style={{
      width: '100%',
      marginVertical: loaded ? 16 : 0,
      height: loaded ? 'auto' : (failed ? 0 : 50),
      overflow: 'hidden',
      alignItems: 'center'
    }}>
      <View style={{
        width: '100%',
        alignItems: 'center',
        opacity: loaded ? 1 : 0
      }}>
        <BannerAd
          unitId={AD_IDS.ADAPTIVE_BANNER}
          size={BannerAdSize.ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => {
            setLoaded(true);
            setFailed(false);
          }}
          onAdFailedToLoad={(err) => {
            console.log('Ad failed:', err);
            setLoaded(false);
            setFailed(true);
          }}
        />
        {loaded && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 2 }}>
            <View style={{ backgroundColor: colorSet.primary + '15', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, marginRight: 6 }}>
              <AppText style={{ fontSize: 8, color: colorSet.primary, fontWeight: 'bold' }}>AD</AppText>
            </View>
            <AppText style={{ fontSize: 10, color: colorSet.subText }}>Sponsored Advertisement</AppText>
          </View>
        )}
      </View>
    </View>
  );
};

const PromptCard = ({ item, isLocked, isPremium, onPress }) => {
  const { theme, userData = {}, hasSubscription = false } = useContext(UserContext);
  const hasPass = (userData?.premiumPassExpiry || 0) > Date.now();
  const colorSet = COLORS[theme];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [imgLoading, setImgLoading] = useState(true);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.card, {
        backgroundColor: colorSet.card,
        transform: [{ scale: scaleAnim }],
        shadowColor: colorSet.cardShadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: theme === 'light' ? 0.12 : 0.4,
        shadowRadius: 16,
        elevation: 8,
      }]}>
        <View style={styles.cardImageContainer}>
          {imgLoading && (
            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: colorSet.border + '30' }]}>
              <ActivityIndicator color={colorSet.primary} size="small" />
            </View>
          )}
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            onLoadStart={() => setImgLoading(true)}
            onLoadEnd={() => setImgLoading(false)}
          />
          {/* Gradient overlay at bottom */}
          <View style={styles.cardImageGradient} />
          {isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: '#7C3AED' }]}>
              <Crown size={10} color="white" fill="white" />
              <AppText variant="bold" style={styles.premiumBadgeText}>PRO</AppText>
            </View>
          )}
          {item.isNew && (
            <View style={[styles.newBadge, { backgroundColor: '#10B981' }]}>
              <AppText variant="bold" style={styles.newBadgeText}>NEW</AppText>
            </View>
          )}
          {isLocked && (
            <View style={styles.lockPill}>
              <Lock size={10} color="white" />
              <AppText variant="bold" style={{ color: 'white', fontSize: 9, marginLeft: 3 }}>
                {isPremium && (hasSubscription || (hasPass && (userData?.premiumPassUnlocks || 0) < (userData?.premiumPassLimit || 10)) || (userData?.streakVoucherUnlocks || 0) > 0)
                  ? 'FREE TO UNLOCK'
                  : '25 coins'}
              </AppText>
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <AppText numberOfLines={1} variant="semibold" style={[styles.cardTitle, { color: colorSet.text }]}>{item.title}</AppText>
          <AppText variant="regular" style={[styles.cardTag, { color: colorSet.subText }]}>{item.style || 'Art'}</AppText>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const CategorySelector = ({ selected, onSelect }) => {
  const { theme } = useContext(UserContext);
  const categories = [
    { key: 'MEN', label: '👨 Men', emoji: '👨' },
    { key: 'WOMEN', label: '👩 Women', emoji: '👩' },
    { key: 'PREMIUM', label: '👑 Premium', emoji: '👑' },
  ];

  return (
    <View style={[styles.categoryContainer, { paddingHorizontal: 16 }]}>
      {categories.map(cat => {
        const isSelected = selected === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            activeOpacity={0.8}
            style={[
              styles.categoryBtn,
              isSelected
                ? {
                  backgroundColor: COLORS[theme].primary,
                  shadowColor: COLORS[theme].primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 10,
                  elevation: 8,
                }
                : {
                  backgroundColor: COLORS[theme].card,
                  borderWidth: 1.5,
                  borderColor: COLORS[theme].border,
                }
            ]}
          >
            <AppText variant="bold" style={[styles.categoryText, { color: isSelected ? 'white' : COLORS[theme].subText, fontSize: 12 }]}>
              {cat.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

function HomeScreen({ navigation }) {
  const { theme, userData, hasSubscription, showAlert } = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState('MEN');
  const [allPrompts, setAllPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Switch Animation
  const contentFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      // Daily Shuffle Logic
      const dailySeed = new Date().toDateString();
      const shuffled = shuffleWithSeed(data, dailySeed);
      setAllPrompts(shuffled);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const hasPass = (userData?.premiumPassExpiry || 0) > Date.now();

  const onSelectCategory = (cat) => {
    if (cat === 'PREMIUM' && !hasSubscription && !hasPass) {
      showAlert(
        '🔒 Premium Section',
        'Direct access to Premium category requires a PRO Subscription or a 24-hour Premium Pass.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Access', onPress: () => navigation.navigate('Subscription') }
        ]
      );
      return;
    }

    // Switch Animation
    Animated.sequence([
      Animated.timing(contentFade, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.delay(100),
      Animated.timing(contentFade, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    setSelectedCategory(cat);
    setVisibleCount(12); // Reset pagination on category change
  };

  const filteredPrompts = useMemo(() => {
    return allPrompts.filter(p => {
      if (selectedCategory === 'PREMIUM') return p.tier === 'premium' || p.isPremium;
      const cat = p.category?.toUpperCase() || 'MEN';
      return cat === selectedCategory;
    });
  }, [allPrompts, selectedCategory]);

  const displayPrompts = useMemo(() => {
    const list = filteredPrompts.slice(0, visibleCount);
    return organizeIntoGrid(list);
  }, [filteredPrompts, visibleCount]);

  const loadMore = () => {
    if (visibleCount >= filteredPrompts.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 10);
      setIsLoadingMore(false);
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      {/* Premium top bar */}
      <View style={[styles.topBar, {
        backgroundColor: COLORS[theme].background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS[theme].border,
      }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
          <View style={[styles.profileIcon, {
            backgroundColor: COLORS[theme].primary + '18',
            borderWidth: 1.5,
            borderColor: COLORS[theme].primary + '40',
            shadowColor: COLORS[theme].primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }]}>
            <User size={22} color={COLORS[theme].primary} />
          </View>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <AppText variant="bold" style={[styles.appTitle, { color: COLORS[theme].text, fontSize: 24 }]}>Pearl AI</AppText>
          <AppText style={{ color: COLORS[theme].subText, fontSize: 10, letterSpacing: 2 }}>AI PROMPT STUDIO</AppText>
        </View>
        <CoinBadge amount={userData.coins} onPress={() => navigation.navigate('Spin')} />
      </View>

      <CategorySelector selected={selectedCategory} onSelect={onSelectCategory} />

      {/* Premium Quota Indicator */}
      {selectedCategory === 'PREMIUM' && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 10, alignItems: 'center' }}>
          <View style={{
            backgroundColor: hasSubscription ? '#10B98115' : '#7C3AED15',
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: hasSubscription ? '#10B98130' : '#7C3AED30',
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Sparkles size={14} color={hasSubscription ? '#10B981' : '#7C3AED'} />
            <AppText variant="bold" style={{
              color: hasSubscription ? '#10B981' : '#7C3AED',
              fontSize: 12,
              marginLeft: 8
            }}>
              {hasSubscription ? 'UNLIMITED PRO ACCESS' :
                hasPass ?
                  `${(userData?.premiumPassLimit || 10) - (userData?.premiumPassUnlocks || 0)} PROMPTS ARE FREE, THEN 25 COINS PER PROMPT` :
                  (userData?.streakVoucherUnlocks || 0) > 0 ?
                    `${userData?.streakVoucherUnlocks} STREAK UNLOCKS REMAINING, THEN 25 COINS EACH` :
                    'PROMPT PRICE: 25 COINS'}
            </AppText>
          </View>
        </View>
      )}

      {loading ? (
        <LoadingScreen />
      ) : (
        <Animated.View style={{ flex: 1, opacity: contentFade }}>
          <FlatList
            data={displayPrompts}
            keyExtractor={(item, index) => (item.type === 'ad' ? item.id : index.toString())}
            numColumns={1}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPrompts(); }} colors={[COLORS[theme].primary]} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              if (item.type === 'ad') {
                return <AdCard theme={theme} />;
              }

              return (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  {item.items.map((prompt) => {
                    const isPremium = prompt.tier === 'premium' || prompt.isPremium;
                    const isUnlocked = (userData?.unlockedIds || []).includes(prompt.id) || hasSubscription;
                    return (
                      <PromptCard
                        key={prompt.id}
                        item={prompt}
                        isLocked={!isUnlocked}
                        isPremium={isPremium}
                        onPress={() => navigation.navigate('Details', { item: prompt })}
                      />
                    );
                  })}
                  {item.items.length === 1 && <View style={{ width: (width / 2) - 24 }} />}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Sparkles size={48} color={COLORS[theme].primary + '60'} />
                <AppText variant="semibold" style={{ color: COLORS[theme].subText, marginTop: 12 }}>No prompts found</AppText>
              </View>
            }
            ListFooterComponent={visibleCount < filteredPrompts.length && (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                {isLoadingMore ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator color={COLORS[theme].primary} />
                    <AppText style={{ color: COLORS[theme].subText }}>Loading more...</AppText>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.loadMoreBtn, { borderColor: COLORS[theme].primary }]}
                    onPress={loadMore}
                  >
                    <AppText variant="bold" style={{ color: COLORS[theme].primary }}>Load More</AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

function SpinScreen() {
  const { theme, userData, updateUserData, showAlert } = useContext(UserContext);
  const [isSpinning, setIsSpinning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adPreparing, setAdPreparing] = useState(false);
  const adProgress = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const currentAngle = useRef(0);
  const WHEEL_SIZE = 290;
  const navigation = useNavigation();

  // Load rewarded ad
  useEffect(() => {
    const unsubLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Rewarded Ad Loaded');
    });
    const unsubEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      updateUserData({ spinTickets: (userData.spinTickets || 0) + 1 });
      showAlert('Reward Earned!', 'You got 1 extra spin ticket! 🎫', [{ text: 'Awesome' }], 'success');
    });
    rewardedAd.load();
    return () => {
      unsubLoaded();
      unsubEarned();
    };
  }, []);

  const watchRewardedAd = () => {
    if (rewardedAd.loaded) {
      rewardedAd.show();
    } else {
      showAlert('Loading Ad', 'Ad is loading, please try again in a few seconds.', [{ text: 'OK' }], 'info');
      rewardedAd.load();
    }
  };

  const handleWatchAd = () => {
    if (adPreparing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAdPreparing(true);
    adProgress.setValue(0);

    Animated.timing(adProgress, {
      toValue: 1,
      duration: 2200, // Roughly 2 seconds
      useNativeDriver: false,
    }).start(() => {
      setAdPreparing(false);
      watchRewardedAd();
    });
  };

  // 6 rewards — shuffled for excitement
  // 6 rewards — reverted back to coins for testing
  const rewards = [10, 30, 5, 50, 15, 20];
  const probabilities = [0.25, 0.07, 0.40, 0.03, 0.15, 0.10];

  // Segment colors matching our premium UI
  const segColors = ['#8B5CF6', '#F59E0B', '#6366F1', '#10B981', '#EF4444', '#EC4899'];
  const NUM_SEGS = 6; // 6 solid colored segments
  const SEG_ANGLE = 360 / NUM_SEGS; // 60 degrees each

  // 4-hour countdown — always running, auto-grants ticket on expire
  useEffect(() => {
    const checkTimer = () => {
      const now = Date.now();
      const last = userData.lastSpinTime || 0;
      const diff = now - last;
      if (last === 0) {
        // Initialize: give first spin free immediately
        updateUserData({ lastSpinTime: now - FREE_SPIN_COOLDOWN });
      } else {
        const remaining = FREE_SPIN_COOLDOWN - diff;
        setTimeLeft(Math.max(0, remaining));
      }
    };
    const timer = setInterval(checkTimer, 1000);
    checkTimer();
    return () => clearInterval(timer);
  }, [userData.lastSpinTime]);

  const spin = () => {
    const tickets = userData.spinTickets || 0;
    const hasFreeSlot = timeLeft <= 0;
    if (isSpinning || (!hasFreeSlot && tickets <= 0)) {
      showAlert('No Spins!', 'Wait for the timer or collect extra tickets.', [{ text: 'OK' }], 'error');
      return;
    }
    setIsSpinning(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const rand = Math.random();
    let sum = 0; let rewardIndex = 0;
    for (let i = 0; i < probabilities.length; i++) {
      sum += probabilities[i];
      if (rand <= sum) { rewardIndex = i; break; }
    }
    const reward = rewards[rewardIndex];

    // Correct logic to land exactly on the selected segment
    // segCenter is the center of the target segment (0-360)
    const segCenter = rewardIndex * SEG_ANGLE + SEG_ANGLE / 2;
    // targetAngle is the rotation needed (from 0) to bring that center to the top (0°)
    const targetAngle = (360 - segCenter) % 360;

    const extraSpins = 10 + Math.floor(Math.random() * 5);
    // Calculate how much we need to rotate from our CURRENT position to reach the targetAngle
    const currentModulo = currentAngle.current % 360;
    const rotationNeeded = (targetAngle - currentModulo + 360) % 360;

    const finalAngle = currentAngle.current + (extraSpins * 360) + rotationNeeded;

    Animated.timing(rotation, {
      toValue: finalAngle,
      duration: 6500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const useTicket = !hasFreeSlot && tickets > 0;

        // Update currentAngle state for next spin and sync Animated value
        currentAngle.current = finalAngle;
        rotation.setValue(finalAngle);

        updateUserData({
          coins: userData.coins + reward,
          spinTickets: useTicket ? Math.max(0, tickets - 1) : tickets,
          lastSpinTime: hasFreeSlot ? Date.now() : userData.lastSpinTime,
        });

        setIsSpinning(false);
        // Requirement: Auto-collect (no alert modal)
      }
    });
  };

  const spinRotation = rotation.interpolate({
    inputRange: [0, 36000],
    outputRange: ['0deg', '36000deg'],
    extrapolate: 'extend',
  });

  const formatTime = (ms) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const tickets = userData.spinTickets || 0;
  const hasFreeSlot = timeLeft <= 0;
  const canSpin = hasFreeSlot || tickets > 0;

  // Build 6 solid colored SVG segments (no white gaps)
  const renderSegments = () => {
    const segments = [];
    for (let i = 0; i < NUM_SEGS; i++) {
      const rot = i * SEG_ANGLE;
      const startDeg = -90;
      const x1 = 50 + 50 * Math.cos(Math.PI * startDeg / 180);
      const y1 = 50 + 50 * Math.sin(Math.PI * startDeg / 180);
      const x2 = 50 + 50 * Math.cos(Math.PI * (startDeg + SEG_ANGLE) / 180);
      const y2 = 50 + 50 * Math.sin(Math.PI * (startDeg + SEG_ANGLE) / 180);

      segments.push(
        <G key={i} transform={`rotate(${rot}, 50, 50)`}>
          <Path d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`} fill={segColors[i]} />
          <Path d={`M50,50 L${x1},${y1}`} stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
          <G transform={`rotate(${SEG_ANGLE / 2}, 50, 50)`}>
            <SvgText x="50" y="17" fill="rgba(255,255,255,0.85)" fontSize="5" textAnchor="middle">🪙</SvgText>
            <SvgText x="50" y="28" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">{rewards[i]}</SvgText>
          </G>
        </G>
      );
    }
    return segments;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
        <AppText variant="bold" style={[styles.mainHeading, { color: COLORS[theme].text }]}>🎰 Spin & Win</AppText>

        {/* Coin + Ticket badges */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <CoinBadge amount={userData.coins} />
          <View style={[styles.coinBadge, { backgroundColor: COLORS[theme].card, borderColor: COLORS[theme].primary, borderWidth: 1 }]}>
            <Sparkles size={16} color={COLORS[theme].primary} />
            <AppText variant="semibold" style={{ color: COLORS[theme].text, marginLeft: 5 }}>{tickets} Tickets</AppText>
          </View>
        </View>

        {/* Timer card */}
        <View style={{ alignItems: 'center', marginBottom: 18, backgroundColor: COLORS[theme].card, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: hasFreeSlot ? '#10B981' : COLORS[theme].border }}>
          <AppText style={{ color: COLORS[theme].subText, fontSize: 11, marginBottom: 3 }}>
            {hasFreeSlot ? '✅ FREE SPIN READY' : '⏱  Next free spin in'}
          </AppText>
          <AppText variant="bold" style={{ color: hasFreeSlot ? '#10B981' : COLORS[theme].coin, fontSize: 20, letterSpacing: 2 }}>
            {hasFreeSlot ? 'Claim it now!' : formatTime(timeLeft)}
          </AppText>
        </View>

        {/* Wheel Assembly — container height fixed to match ring */}
        <View style={{ width: WHEEL_SIZE + 20, height: WHEEL_SIZE + 20, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

          {/* Golden Teardrop PIN at TOP — pointing DOWN into wheel */}
          <View style={{ position: 'absolute', top: -10, zIndex: 30, alignSelf: 'center' }}>
            <Svg width="36" height="52" viewBox="0 0 36 52">
              {/* Teardrop shape */}
              <Path d="M18,50 C18,50 2,30 2,16 C2,7.2 9.2,0 18,0 C26.8,0 34,7.2 34,16 C34,30 18,50 18,50Z"
                fill="#F59E0B" />
              <Path d="M18,50 C18,50 2,30 2,16 C2,7.2 9.2,0 18,0 C26.8,0 34,7.2 34,16 C34,30 18,50 18,50Z"
                fill="none" stroke="#d97706" strokeWidth="2" />
              {/* Inner circle highlight */}
              <Circle cx="18" cy="16" r="7" fill="rgba(255,255,255,0.3)" />
              <Circle cx="18" cy="16" r="4" fill="rgba(255,255,255,0.5)" />
            </Svg>
          </View>

          {/* Golden outer ring (static, non-rotating) */}
          <View style={{
            position: 'absolute',
            width: WHEEL_SIZE + 20, height: WHEEL_SIZE + 20,
            borderRadius: (WHEEL_SIZE + 20) / 2,
            borderWidth: 10,
            borderColor: '#F59E0B',
            zIndex: 5,
            shadowColor: '#F59E0B',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 10,
          }} />

          {/* Rotating Wheel */}
          <Animated.View style={{
            width: WHEEL_SIZE, height: WHEEL_SIZE,
            borderRadius: WHEEL_SIZE / 2,
            overflow: 'hidden',
            backgroundColor: theme === 'dark' ? '#1E293B' : '#F8F8FF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 15,
            transform: [{ rotate: spinRotation }],
          }}>
            <Svg height={WHEEL_SIZE} width={WHEEL_SIZE} viewBox="0 0 100 100">
              {renderSegments()}
              {/* Divider lines ring */}
              <Circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
              {/* Center gold circle */}
              <Circle cx="50" cy="50" r="9" fill="#F59E0B" />
              <Circle cx="50" cy="50" r="8" fill="#FBBF24" />
              {/* Star in center */}
              <Path d="M50,42 L51.8,47.6 L57.6,47.6 L53,51.1 L54.8,56.7 L50,53.2 L45.2,56.7 L47,51.1 L42.4,47.6 L48.2,47.6 Z"
                fill="#d97706" />
            </Svg>
          </Animated.View>
        </View>

        {/* SPIN Button */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' }}>
          {/* SPIN Button */}
          <TouchableOpacity
            onPress={spin}
            disabled={isSpinning || !canSpin}
            activeOpacity={0.85}
            style={[styles.spinBtn, {
              flex: 1.2,
              backgroundColor: !canSpin ? COLORS[theme].border : COLORS[theme].primary,
              shadowColor: COLORS[theme].primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: canSpin ? 0.5 : 0,
              elevation: 8,
              paddingVertical: 14,
            }]}
          >
            <AppText variant="bold" style={{ color: 'white', fontSize: 13, letterSpacing: 0.5 }}>
              {isSpinning ? '🌀  ...' : hasFreeSlot ? '🆓  FREE' : tickets > 0 ? `🎟  Use Ticket` : '⏳  Wait'}
            </AppText>
          </TouchableOpacity>

          {/* Requirement: Watch Ad and get extra spin - Rewarded Ad */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: COLORS[theme].card,
              paddingVertical: 14,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: adPreparing ? COLORS[theme].primary : COLORS[theme].border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            onPress={handleWatchAd}
            disabled={adPreparing}
            activeOpacity={0.7}
          >
            {adPreparing && (
              <Animated.View style={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                backgroundColor: COLORS[theme].primary + '15',
                width: adProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }} />
            )}
            {adPreparing ? (
              <ActivityIndicator size="small" color={COLORS[theme].primary} style={{ marginRight: 6 }} />
            ) : (
              <PlayCircle size={18} color={COLORS[theme].primary} />
            )}
            <AppText variant="semibold" style={{ color: COLORS[theme].primary, marginLeft: 6, fontSize: 13 }}>
              {adPreparing ? 'Preparing...' : '+1 Ticket'}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Requirement: Spin screen Bottom Banner */}
      <View style={{ width: '100%', alignItems: 'center', backgroundColor: COLORS[theme].background, paddingVertical: adLoaded ? 4 : 0, height: adLoaded ? 'auto' : 0, overflow: 'hidden' }}>
        <BannerAd
          unitId={AD_IDS.BANNER}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => setAdLoaded(true)}
          onAdFailedToLoad={() => setAdLoaded(false)}
        />
      </View>
    </SafeAreaView>
  );
}


function NewArrivalScreen({ navigation }) {
  const { theme, userData, hasSubscription } = useContext(UserContext);
  const [allNewPrompts, setAllNewPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchNew = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const now = Date.now();
        const dailySeed = new Date().toDateString();
        const shuffled = shuffleWithSeed(data, dailySeed);

        const filtered = shuffled.filter(i => {
          // Requirement: Only show prompts from the last 24 hours, exclude ALL premium content
          const isRecent = (now - new Date(i.createdAt).getTime()) <= 24 * 60 * 60 * 1000;
          const isNotPremium = i.tier !== 'premium' && !i.isPremium && i.category !== 'Premium';
          return isRecent && isNotPremium;
        });
        setAllNewPrompts(filtered);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchNew();
  }, []);

  const displayPrompts = useMemo(() => {
    const list = allNewPrompts.slice(0, visibleCount);
    return organizeIntoGrid(list);
  }, [allNewPrompts, visibleCount]);

  const loadMore = () => {
    if (visibleCount >= allNewPrompts.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 10);
      setIsLoadingMore(false);
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <View style={styles.screenHeader}>
        <View>
          <AppText variant="bold" style={[styles.screenHeaderTitle, { color: COLORS[theme].text }]}>New Arrivals</AppText>
          <AppText style={{ color: COLORS[theme].subText, fontSize: 12, marginTop: 2 }}>Fresh prompt inspiration daily</AppText>
        </View>
        <View style={[styles.screenHeaderBadge, { backgroundColor: COLORS[theme].primary + '18' }]}>
          <Sparkles size={18} color={COLORS[theme].primary} />
        </View>
      </View>
      {loading ? <LoadingScreen /> : (
        <FlatList
          data={displayPrompts}
          keyExtractor={(item, index) => (item.type === 'ad' ? item.id : index.toString())}
          numColumns={1}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.type === 'ad') return <AdCard theme={theme} />;
            return (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                {item.items.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    item={{ ...prompt, isNew: true }}
                    isLocked={!(userData.unlockedIds.includes(prompt.id) || hasSubscription)}
                    isPremium={prompt.tier === 'premium'}
                    onPress={() => navigation.navigate('Details', { item: prompt })}
                  />
                ))}
                {item.items.length === 1 && <View style={{ width: (width / 2) - 24 }} />}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Sparkles size={52} color={COLORS[theme].primary + '40'} />
              <AppText variant="semibold" style={{ color: COLORS[theme].subText, marginTop: 14, fontSize: 16 }}>No new arrivals yet</AppText>
              <AppText style={{ color: COLORS[theme].subText, fontSize: 13, marginTop: 6 }}>Check back soon!</AppText>
            </View>
          }
          ListFooterComponent={visibleCount < allNewPrompts.length && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              {isLoadingMore ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator color={COLORS[theme].primary} />
                  <AppText style={{ color: COLORS[theme].subText }}>Loading more...</AppText>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.loadMoreBtn, { borderColor: COLORS[theme].primary }]}
                  onPress={loadMore}
                >
                  <AppText variant="bold" style={{ color: COLORS[theme].primary }}>Load More</AppText>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function FavoritesScreen({ navigation }) {
  const { theme, userData, hasSubscription } = useContext(UserContext);
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const filtered = data.filter(i => userData.favorites.includes(i.id));
        setFavs(filtered);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchFavs();
  }, [userData.favorites]);

  const displayFavs = useMemo(() => {
    return organizeIntoGrid(favs);
  }, [favs]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <View style={styles.screenHeader}>
        <View>
          <AppText variant="bold" style={[styles.screenHeaderTitle, { color: COLORS[theme].text }]}>Saved</AppText>
          <AppText style={{ color: COLORS[theme].subText, fontSize: 12, marginTop: 2 }}>Your favorite prompts</AppText>
        </View>
        <View style={[styles.screenHeaderBadge, { backgroundColor: '#EF444418' }]}>
          <Heart size={18} color="#EF4444" fill="#EF4444" />
        </View>
      </View>

      {/* Requirement: Favourite section Top Banner */}
      <View style={{ width: '100%', alignItems: 'center', marginBottom: adLoaded ? 10 : 0, height: adLoaded ? 'auto' : 0, overflow: 'hidden' }}>
        <BannerAd
          unitId={AD_IDS.BANNER}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => setAdLoaded(true)}
          onAdFailedToLoad={() => setAdLoaded(false)}
        />
      </View>

      {loading ? <LoadingScreen /> : (
        <FlatList
          data={displayFavs} numColumns={1} contentContainerStyle={styles.listContent}
          keyExtractor={(item, index) => (item.type === 'ad' ? item.id : index.toString())}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.type === 'ad') return <AdCard theme={theme} />;
            return (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                {item.items.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    item={prompt}
                    isLocked={!(userData.unlockedIds.includes(prompt.id) || hasSubscription)}
                    isPremium={prompt.tier === 'premium'}
                    onPress={() => navigation.navigate('Details', { item: prompt })}
                  />
                ))}
                {item.items.length === 1 && <View style={{ width: (width / 2) - 24 }} />}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Heart size={52} color="#EF444440" fill="#EF444440" />
              <AppText variant="semibold" style={{ color: COLORS[theme].subText, marginTop: 14, fontSize: 16 }}>No favorites yet</AppText>
              <AppText style={{ color: COLORS[theme].subText, fontSize: 13, marginTop: 6 }}>Save prompts you love!</AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function PrivacyPolicyScreen({ navigation }) {
  const { theme } = useContext(UserContext);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.navBackBtn, { backgroundColor: COLORS[theme].card }]}>
          <ChevronLeft color={COLORS[theme].text} size={22} />
        </TouchableOpacity>
        <AppText variant="bold" style={[styles.navHeaderTitle, { color: COLORS[theme].text }]}>Privacy Policy</AppText>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <AppText style={{ color: COLORS[theme].text, lineHeight: 24 }}>
          Last Updated: March 2026{"\n\n"}
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our AI Photo Prompts app.{"\n\n"}
          1. Data Collection{"\n"}
          All your data (favourite items, unlocked prompts, coin balance, and name) is stored LOCAL ON YOUR DEVICE. We do not collect or store this data on our servers as we do not have a login system.{"\n\n"}
          2. How We Use Data{"\n"}
          Your data is used only to provide the app's features, such as keeping track of your coins and favorite prompts.{"\n\n"}
          3. Security{"\n"}
          Since all data is stored on your device, the security of your information depends on your device's security settings.{"\n\n"}
          4. Refund Policy{"\n"}
          You can cancel your PRO subscription at any time. We will refund coins for the remaining full days of your subscription.{"\n\n"}
          5. Contact Us{"\n"}
          If you have any questions, please contact our support team.
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileScreen({ navigation }) {
  const { theme, userData, updateUserData, hasSubscription } = useContext(UserContext);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userData.name || 'Member');
  const C = COLORS[theme];

  const handleSaveName = () => {
    updateUserData({ name: newName });
    setIsEditingName(false);
  };

  const menuItems = [
    { label: 'Subscription Plans', desc: 'Upgrade to PRO', icon: Crown, screen: 'Subscription', color: C.premium },
    { label: 'Privacy Policy', desc: 'Terms & data usage', icon: Shield, screen: 'PrivacyPolicy', color: '#10B981' },
    { label: 'Rate Us ⭐', desc: 'Love the app? Tell us!', icon: Star, color: '#F59E0B', url: 'https://play.google.com/store/apps/details?id=com.dipak.pearlai&hl=en_IN' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.navBackBtn, { backgroundColor: C.card }]}>
          <ChevronLeft color={C.text} size={22} />
        </TouchableOpacity>
        <AppText variant="bold" style={[styles.navHeaderTitle, { color: C.text }]}>Profile</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Card */}
        <View style={[styles.profileHeroCard, { backgroundColor: C.card }]}>
          <View style={[styles.profileAvatarRing, { borderColor: C.primary + '40' }]}>
            <View style={[styles.profileAvatarInner, { backgroundColor: C.primary + '18' }]}>
              <User size={40} color={C.primary} />
            </View>
          </View>
          {hasSubscription && (
            <View style={[styles.proBadge, { backgroundColor: C.premium }]}>
              <Crown size={10} color="white" fill="white" />
              <AppText variant="bold" style={{ color: 'white', fontSize: 9, marginLeft: 3 }}>PRO</AppText>
            </View>
          )}

          {isEditingName ? (
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <TextInput
                style={[styles.nameInput, { color: C.text, borderBottomColor: C.primary, width: 200 }]}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                maxLength={20}
                textAlign="center"
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity onPress={() => { setIsEditingName(false); setNewName(userData.name || 'Member'); }} style={[styles.nameBtn, { backgroundColor: C.border }]}>
                  <AppText style={{ fontSize: 12, color: C.subText }}>Cancel</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveName} style={[styles.nameBtn, { backgroundColor: C.primary }]}>
                  <AppText variant="bold" style={{ color: 'white', fontSize: 12 }}>Save</AppText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.nameRow} activeOpacity={0.7}>
              <AppText variant="bold" style={[styles.profileName, { color: C.text }]}>{userData.name || 'Member'}</AppText>
              <View style={[styles.editChip, { backgroundColor: C.primary + '15' }]}>
                <Edit2 size={12} color={C.primary} />
                <AppText style={{ color: C.primary, fontSize: 10, marginLeft: 4 }}>Edit</AppText>
              </View>
            </TouchableOpacity>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <AppText variant="bold" style={[styles.statValue, { color: C.coin }]}>{userData.coins}</AppText>
              <AppText style={[styles.statLabel, { color: C.subText }]}>Coins</AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: C.border }]} />
            <View style={styles.statItem}>
              <AppText variant="bold" style={[styles.statValue, { color: C.primary }]}>{userData.unlockedIds.length}</AppText>
              <AppText style={[styles.statLabel, { color: C.subText }]}>Unlocked</AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: C.border }]} />
            <View style={styles.statItem}>
              <AppText variant="bold" style={[styles.statValue, { color: '#EF4444' }]}>{userData.favorites.length}</AppText>
              <AppText style={[styles.statLabel, { color: C.subText }]}>Saved</AppText>
            </View>
          </View>
        </View>

        {/* 🔥 Daily Streak Card */}
        <View style={[styles.streakCard, { backgroundColor: '#FFF7ED', borderColor: '#F59E0B40' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <AppText style={{ fontSize: 28 }}>🔥</AppText>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <AppText variant="bold" style={{ color: '#92400E', fontSize: 18 }}>{userData.currentStreak || 0} Day Streak</AppText>
              <AppText style={{ color: '#B45309', fontSize: 12, marginTop: 2 }}>Best: {userData.longestStreak || 0} days</AppText>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: '#F59E0B' }]}>
              <AppText variant="bold" style={{ color: 'white', fontSize: 12 }}>{userData.currentStreak || 0}🔥</AppText>
            </View>
          </View>

          {/* 7-day dots */}
          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
              const todayDow = (new Date().getDay() + 6) % 7; // Mon=0
              const diffFromToday = todayDow - i;
              const filled = diffFromToday >= 0 && (userData.currentStreak || 0) > diffFromToday;
              return (
                <View key={i} style={[styles.streakDayPill, {
                  backgroundColor: i === todayDow ? C.primary : filled ? '#F59E0B' : '#E4E4F7',
                  borderColor: i === todayDow ? C.primary : 'transparent',
                }]}>
                  <AppText variant="bold" style={{ fontSize: 9, color: (filled || i === todayDow) ? 'white' : '#9CA3AF' }}>{d.charAt(0)}</AppText>
                </View>
              );
            })}
          </View>

          <AppText style={{ color: '#92400E', fontSize: 11, textAlign: 'center', marginTop: 10 }}>
            🎯 Open app daily to keep your streak alive!
          </AppText>
        </View>

        {/* 🏆 Streak Rewards Roadmap */}
        <AppText variant="semibold" style={{ color: C.subText, fontSize: 11, letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>REWARD SYSTEM 🔥</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 10 }}>
          {[
            { days: '1-5', coins: 10, icon: '🔥' },
            { days: '6-14', coins: 15, icon: '⚡' },
            { days: '15-29', coins: 20, icon: '✨' },
            { days: '30', coins: 30, icon: '🌟' },
            { days: '31', coins: 30, bonus: '1D Pass', icon: '🎫' },
            { days: '32-60', coins: 30, icon: '💎' },
            { days: '61', coins: 40, bonus: '7D Pass', icon: '👑' },
            { days: '62+', coins: 40, icon: '💫' },
          ].map((r, i) => (
            <View key={i} style={[styles.rewardMilestoneCard, { backgroundColor: C.card }]}>
              <AppText style={{ fontSize: 20 }}>{r.icon}</AppText>
              <AppText variant="bold" style={{ fontSize: 14, color: C.text, marginTop: 4 }}>Day {r.days}</AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Coins size={10} color={C.coin} />
                <AppText variant="bold" style={{ fontSize: 11, color: C.coin, marginLeft: 3 }}>{r.coins}</AppText>
              </View>
              {r.bonus && (
                <View style={{ backgroundColor: C.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 }}>
                  <AppText variant="bold" style={{ color: C.primary, fontSize: 8 }}>{r.bonus}</AppText>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Menu Items */}
        <AppText variant="semibold" style={{ color: C.subText, fontSize: 11, letterSpacing: 1, marginTop: 10, marginBottom: 8, marginLeft: 4 }}>SETTINGS</AppText>
        <View style={{ gap: 10 }}>
          {menuItems.map((it, i) => {
            const Icon = it.icon;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.premiumMenuItem, { backgroundColor: C.card }]}
                onPress={() => {
                  if (it.url) {
                    Linking.openURL(it.url);
                  } else if (it.screen) {
                    navigation.navigate(it.screen);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.menuIconBox, { backgroundColor: it.color + '18' }]}>
                  <Icon size={20} color={it.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="semibold" style={{ color: C.text, fontSize: 15 }}>{it.label}</AppText>
                  <AppText style={{ color: C.subText, fontSize: 12, marginTop: 2 }}>{it.desc}</AppText>
                </View>
                {it.screen && <ChevronRight size={18} color={C.subText} />}
              </TouchableOpacity>
            );
          })}

          {hasSubscription && (
            <View style={[styles.premiumMenuItem, { backgroundColor: C.success + '12', borderColor: C.success + '30', borderWidth: 1 }]}>
              <View style={[styles.menuIconBox, { backgroundColor: C.success + '20' }]}>
                <Crown size={20} color={C.success} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="bold" style={{ color: C.success, fontSize: 15 }}>PRO Mode Active</AppText>
                <AppText style={{ color: C.success + 'AA', fontSize: 12, marginTop: 2 }}>Full access to all categories</AppText>
              </View>
              <View style={[styles.activeTag, { backgroundColor: C.success }]}>
                <AppText variant="bold" style={{ color: 'white', fontSize: 10 }}>ACTIVE</AppText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SubscriptionScreen({ navigation }) {
  const { theme, userData, updateUserData, updateSubscription, hasSubscription, showAlert } = useContext(UserContext);

  const hasPass = userData.premiumPassExpiry > Date.now();

  const plans = [
    { id: 'weekly', title: 'Weekly Plan', price: 900, days: 7, desc: 'Full access for a week' },
    { id: 'monthly', title: 'Monthly Plan', price: 3600, days: 30, desc: 'Most save and popular', popular: true },
    { id: '3month', title: '3 Months Plan', price: 9000, days: 90, desc: 'Maximum value experience' },
  ];

  const handlePurchase = (plan) => {
    if (hasSubscription) {
      showAlert('Already PRO', 'You already have an active subscription.', [{ text: 'Awesome' }], 'success');
      return;
    }
    if (userData.coins < plan.price) {
      showAlert('Low Coins', `You need ${plan.price - userData.coins} more coins.`, [{ text: 'Get Coins', onPress: () => navigation.navigate('Spin') }, { text: 'Cancel', style: 'cancel' }], 'error');
      return;
    }

    showAlert(
      'Confirm Plan',
      `Unlock PRO status for ${plan.days} days using ${plan.price} coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: () => {
            updateUserData({ coins: userData.coins - plan.price });
            updateSubscription(plan.days, plan.price);
            showAlert('Success!', 'PRO Status activated. All sections are now unlocked!', [{ text: 'Great!' }], 'success');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const buyPremiumPass = () => {
    if (hasSubscription) {
      showAlert('Already PRO', 'You already have full access with your PRO plan.', [{ text: 'Got it' }], 'success');
      return;
    }
    if (hasPass) {
      showAlert('Pass Active', 'Your 24-hour pass is already active.', [{ text: 'Done' }], 'info');
      return;
    }
    if (userData.coins < 250) {
      showAlert('Low Coins', 'Premium Pass costs 250 coins.', [{ text: 'Get Coins', onPress: () => navigation.navigate('Spin') }, { text: 'Back', style: 'cancel' }], 'error');
      return;
    }

    showAlert(
      '24h Premium Pass',
      'Unlock Premium category for 24 hours. Includes 10 FREE unlocks, then 25 coins each.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy for 250',
          onPress: () => {
            updateUserData({
              coins: userData.coins - 250,
              premiumPassExpiry: Date.now() + 24 * 60 * 60 * 1000,
              premiumPassUnlocks: 0,
              premiumPassLimit: 10 // Paid Pass gives 10
            });
            showAlert('Pass Activated!', 'You can now access the Premium category for 24 hours with 10 free unlocks!', [{ text: 'Let’s Go!' }], 'success');
          }
        }
      ]
    );
  };

  const C = COLORS[theme];
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.navBackBtn, { backgroundColor: C.card }]}>
          <ChevronLeft color={C.text} size={22} />
        </TouchableOpacity>
        <AppText variant="bold" style={[styles.navHeaderTitle, { color: C.text }]}>Plans</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Vouchers Section */}
        {(userData.vouchers?.dayPass > 0 || userData.vouchers?.weekPass > 0) && (
          <>
            <AppText variant="semibold" style={{ color: C.subText, fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>MY VOUCHERS 🎁</AppText>
            <View style={{ gap: 10, marginBottom: 20 }}>
              {userData.vouchers?.dayPass > 0 && (
                <TouchableOpacity
                  style={[styles.voucherItem, { backgroundColor: C.primary + '10', borderColor: C.primary + '30' }]}
                  onPress={() => {
                    showAlert('Redeem Voucher', 'Use 1x Premium Day Pass now?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Redeem', onPress: () => {
                          updateUserData({
                            vouchers: { ...userData.vouchers, dayPass: userData.vouchers.dayPass - 1 },
                            premiumPassExpiry: Date.now() + 24 * 60 * 60 * 1000,
                            premiumPassUnlocks: 0,
                            premiumPassLimit: 5 // Voucher/Streak Pass gives 5
                          });
                          showAlert('Success!', '1-Day Premium Pass activated with 5 free unlocks.', [{ text: 'Great!' }], 'success');
                        }
                      }
                    ]);
                  }}
                >
                  <View style={[styles.voucherIcon, { backgroundColor: C.primary }]}>
                    <Zap size={20} color="white" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="bold" style={{ color: C.primary }}>Premium 1-Day Pass</AppText>
                    <AppText style={{ fontSize: 11, color: C.subText }}>Valid for 24 hours · 5 free unlocks</AppText>
                  </View>
                  <View style={{ backgroundColor: C.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <AppText variant="bold" style={{ color: 'white', fontSize: 12 }}>x{userData.vouchers.dayPass}</AppText>
                  </View>
                </TouchableOpacity>
              )}
              {userData.vouchers?.weekPass > 0 && (
                <TouchableOpacity
                  style={[styles.voucherItem, { backgroundColor: C.premium + '10', borderColor: C.premium + '30' }]}
                  onPress={() => {
                    showAlert('Redeem Voucher', 'Use 1x Weekly PRO Pass now?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Redeem', onPress: () => {
                          updateUserData({
                            vouchers: { ...userData.vouchers, weekPass: userData.vouchers.weekPass - 1 }
                          });
                          updateSubscription(7, 0);
                          showAlert('Success!', '7-Day PRO Status activated.', [{ text: 'Awesome' }], 'success');
                        }
                      }
                    ]);
                  }}
                >
                  <View style={[styles.voucherIcon, { backgroundColor: C.premium }]}>
                    <Crown size={20} color="white" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="bold" style={{ color: C.premium }}>Weekly PRO Pass</AppText>
                    <AppText style={{ fontSize: 11, color: C.subText }}>7 days full access to everything</AppText>
                  </View>
                  <View style={{ backgroundColor: C.premium, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <AppText variant="bold" style={{ color: 'white', fontSize: 12 }}>x{userData.vouchers.weekPass}</AppText>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Hero Banner */}
        <View style={[styles.subHeroBanner, { backgroundColor: C.primary }]}>
          <View style={styles.subHeroContent}>
            <Crown size={36} color="rgba(255,255,255,0.9)" fill="rgba(255,255,255,0.15)" />
            <AppText variant="bold" style={{ color: 'white', fontSize: 22, marginTop: 12 }}>Unlock Pearl PRO</AppText>
            <AppText style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 6, lineHeight: 20 }}>Get unlimited access to all AI prompts and categories</AppText>
          </View>
          <View style={styles.subFeaturePills}>
            {['All Categories', 'No Limits', 'New Daily'].map(f => (
              <View key={f} style={styles.featurePill}>
                <Zap size={12} color="white" />
                <AppText variant="semibold" style={{ color: 'white', fontSize: 11, marginLeft: 4 }}>{f}</AppText>
              </View>
            ))}
          </View>
        </View>

        {/* 24h Premium Pass */}
        <AppText variant="semibold" style={{ color: C.subText, fontSize: 11, letterSpacing: 1, marginBottom: 10, marginTop: 20 }}>QUICK ACCESS</AppText>
        <TouchableOpacity
          style={[styles.passCard, { backgroundColor: C.card, borderColor: hasPass ? C.success : C.coin }]}
          onPress={buyPremiumPass}
          activeOpacity={0.85}
        >
          <View style={[styles.passIconBox, { backgroundColor: hasPass ? C.success + '18' : C.coin + '18' }]}>
            <Zap size={24} color={hasPass ? C.success : C.coin} fill={hasPass ? C.success : C.coin} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="bold" style={{ color: C.text, fontSize: 16 }}>24h Premium Pass</AppText>
            <AppText style={{ color: C.subText, fontSize: 12, marginTop: 3 }}>10 free unlocks · 25 coins/prompt after</AppText>
            {hasPass && <AppText variant="bold" style={{ color: C.success, fontSize: 11, marginTop: 4 }}>✅ ACTIVE NOW</AppText>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Coins size={14} color={C.coin} />
              <AppText variant="bold" style={{ color: C.coin, fontSize: 18, marginLeft: 4 }}>250</AppText>
            </View>
            <AppText style={{ color: C.subText, fontSize: 10, marginTop: 2 }}>1 Day</AppText>
          </View>
        </TouchableOpacity>

        {/* Plans */}
        <AppText variant="semibold" style={{ color: C.subText, fontSize: 11, letterSpacing: 1, marginBottom: 10, marginTop: 20 }}>SUBSCRIPTION PLANS</AppText>
        {plans.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.planCardNew, {
              backgroundColor: C.card,
              borderColor: p.popular ? C.primary : C.border,
              borderWidth: p.popular ? 2 : 1,
            }]}
            onPress={() => handlePurchase(p)}
            activeOpacity={0.85}
          >
            {p.popular && (
              <View style={[styles.popularBadge, { backgroundColor: C.primary }]}>
                <AppText variant="bold" style={{ color: 'white', fontSize: 10 }}>⭐ POPULAR</AppText>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <AppText variant="bold" style={{ color: C.text, fontSize: 16 }}>{p.title}</AppText>
              <AppText style={{ color: C.subText, fontSize: 12, marginTop: 3 }}>{p.desc}</AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Coins size={16} color={C.coin} />
                <AppText variant="bold" style={{ color: C.text, fontSize: 22, marginLeft: 5 }}>{p.price}</AppText>
              </View>
              <AppText style={{ color: C.subText, fontSize: 11, marginTop: 2 }}>{p.days} days</AppText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailsScreen({ route, navigation }) {
  const { item } = route.params;
  const { theme, userData = {}, updateUserData, hasSubscription = false, showAlert } = useContext(UserContext);
  const isPremium = item.tier === 'premium' || item.isPremium;
  const hasPass = (userData?.premiumPassExpiry || 0) > Date.now();
  const isUnlocked = (userData?.unlockedIds || []).includes(item.id) || hasSubscription;
  const isFav = userData.favorites.includes(item.id);
  const [imgLoading, setImgLoading] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);

  // Requirement: Interstitial after 3/4 detail views (on leave)
  useEffect(() => {
    const visits = (userData.detailVisits || 0) + 1;
    updateUserData({ detailVisits: visits });

    if (!interstitialAd.loaded) interstitialAd.load();
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (visits % 3 === 0 && interstitialAd.loaded) {
        interstitialAd.show();
      }
    });
    return unsubscribe;
  }, []);

  const handleUnlock = () => {

    if (isPremium && !hasSubscription && !hasPass) {
      showAlert('👑 Premium Access', 'Premium category requires PRO status or a 24-hour pass.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'See Plans', onPress: () => navigation.navigate('Subscription') }
      ]);
      return;
    }

    let cost = PROMPT_COST;
    let newPassUnlocks = userData.premiumPassUnlocks || 0;
    let newVoucherUnlocks = userData.streakVoucherUnlocks || 0;
    let isFree = false;

    if (hasSubscription) {
      isFree = true;
      cost = 0;
    } else if (isPremium && hasPass && newPassUnlocks < (userData.premiumPassLimit || 10)) {
      isFree = true;
      cost = 0;
      newPassUnlocks += 1;
    } else if (isPremium && newVoucherUnlocks > 0) {
      isFree = true;
      cost = 0;
      newVoucherUnlocks -= 1;
    }

    if (!isFree && userData.coins < cost) {
      showAlert('Insufficient Coins', `You need ${cost - userData.coins} more coins.`, [{ text: 'Get Coins', onPress: () => navigation.navigate('Spin') }, { text: 'Close', style: 'cancel' }], 'error');
      return;
    }

    const titleMsg = isFree ? 'Free Unlock?' : 'Unlock Prompt?';
    const bodyMsg = isFree
      ? 'Unlock this premium prompt using your free quota?'
      : `Unlock this premium prompt for ${cost} coins?`;

    showAlert(
      titleMsg,
      bodyMsg,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock Now',
          onPress: () => {
            updateUserData({
              coins: userData.coins - cost,
              unlockedIds: [...userData.unlockedIds, item.id],
              premiumPassUnlocks: newPassUnlocks,
              streakVoucherUnlocks: newVoucherUnlocks
            });

            if (isFree) {
              const remainingVal = hasSubscription ? '∞'
                : (hasPass && newPassUnlocks < (userData.premiumPassLimit || 0)) ? ((userData.premiumPassLimit || 0) - newPassUnlocks)
                  : newVoucherUnlocks;
              showAlert('Unlocked!', `Prompt unlocked for free! Remaining quota: ${remainingVal}`, [{ text: 'Awesome!' }], 'success');
            } else {
              showAlert('Unlocked!', 'Prompt unlocked successfully.', [{ text: 'Awesome' }], 'success');
            }
          }
        }
      ]
    );
  };

  const toggleFav = () => {
    const newFavs = isFav ? userData.favorites.filter(id => id !== item.id) : [...userData.favorites, item.id];
    updateUserData({ favorites: newFavs });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <StatusBar style="light" />

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.detailImageWrapper}>
          {imgLoading && (
            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS[theme].border + '20', zIndex: 1 }]}>
              <ActivityIndicator color={COLORS[theme].primary} size="large" />
            </View>
          )}
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.fullDetailImage}
            resizeMode="cover"
            onLoadStart={() => setImgLoading(true)}
            onLoadEnd={() => setImgLoading(false)}
          />

          {/* Top Floating Buttons */}
          <View style={[styles.floatingHeader, { paddingTop: 50 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingActionBtn, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }]}>
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFav} style={[styles.floatingActionBtn, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }]}>
              <Heart color={isFav ? '#EF4444' : 'white'} fill={isFav ? '#EF4444' : 'transparent'} size={24} />
            </TouchableOpacity>
          </View>

          {/* Title Overlay on Image */}
          <View style={styles.titleOverlay}>
            <View style={{ padding: 24, width: '100%', paddingBottom: 30 }}>
              <AppText variant="bold" style={styles.immersiveTitle}>{item.title}</AppText>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={[styles.immersiveContent, { backgroundColor: COLORS[theme].background }]}>
          {isUnlocked ? (
            <View style={styles.unlockedContainer}>
              <View style={[styles.promptCardInner, { backgroundColor: COLORS[theme].card }]}>
                <AppText style={[styles.promptTextDisplay, { color: COLORS[theme].text }]}>{item.prompt}</AppText>
              </View>
              <TouchableOpacity
                onPress={() => { Clipboard.setStringAsync(item.prompt); showAlert('Copied!', 'Prompt copied to clipboard.', [{ text: 'Done' }], 'success'); }}
                style={[styles.actionBtnLarge, { backgroundColor: COLORS[theme].primary }]}
              >
                <Copy size={20} color="white" />
                <AppText variant="bold" style={{ color: 'white', marginLeft: 10 }}>Copy Prompt</AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.lockedContainer}>
              <View style={[styles.lockNotice, { backgroundColor: COLORS[theme].card }]}>
                <Lock size={24} color={COLORS[theme].subText} style={{ marginBottom: 10 }} />
                <AppText style={{ color: COLORS[theme].subText, textAlign: 'center' }}>Unlock to see the full AI generation prompt</AppText>
              </View>
              <TouchableOpacity
                onPress={handleUnlock}
                style={[styles.actionBtnLarge, { backgroundColor: COLORS[theme].primary }]}
              >
                <Unlock size={20} color="white" />
                <AppText variant="bold" style={{ color: 'white', marginLeft: 10 }}>
                  {(isPremium && (hasSubscription || (hasPass && (userData?.premiumPassUnlocks || 0) < (userData?.premiumPassLimit || 10)) || (userData?.streakVoucherUnlocks || 0) > 0))
                    ? 'UNLOCK FOR FREE'
                    : `UNLOCK PROMPT (25 COINS)`}
                </AppText>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Requirement: Details Screen Bottom Banner (Fixed) */}
      <View style={{ width: '100%', alignItems: 'center', backgroundColor: COLORS[theme].background, paddingVertical: adLoaded ? 4 : 0, height: adLoaded ? 'auto' : 0, overflow: 'hidden' }}>
        <BannerAd
          unitId={AD_IDS.BANNER}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => setAdLoaded(true)}
          onAdFailedToLoad={() => setAdLoaded(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const { theme } = useContext(UserContext);
  const C = COLORS[theme];
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: C.card,
        borderTopWidth: 0,
        height: 68,
        shadowColor: C.cardShadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 12,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      },
      tabBarActiveTintColor: C.primary,
      tabBarInactiveTintColor: C.subText,
      tabBarLabelStyle: { fontFamily: 'Outfit_600SemiBold', fontSize: 10, marginBottom: 8 },
      tabBarIcon: ({ color, focused }) => {
        const Icon = route.name === 'Home' ? Zap : route.name === 'New' ? Sparkles : route.name === 'Spin' ? TrendingUp : Heart;
        return (
          <View style={[
            focused && { backgroundColor: C.primary + '18', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 }
          ]}>
            <Icon size={22} color={color} fill={focused ? color : 'none'} />
          </View>
        );
      }
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="New" component={NewArrivalScreen} />
      <Tab.Screen name="Spin" component={SpinScreen} />
      <Tab.Screen name="Saved" component={FavoritesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold });
  const [userData, setUserData] = useState({
    name: 'Member',
    coins: 120,
    lastSpinTime: 0,
    spinTickets: 0,
    unlockedIds: [],
    favorites: [],
    premiumPassExpiry: 0,
    premiumPassUnlocks: 0,
    premiumPassLimit: 0,
    streakVoucherUnlocks: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastOpenDate: null,
    vouchers: { dayPass: 0, weekPass: 0 },
    subscription: { type: 'free', expiry: 0, purchasePrice: 0, totalDays: 0 },
    detailVisits: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [streakModal, setStreakModal] = useState(null); // { coins, streak, voucher }
  const [restoreModal, setRestoreModal] = useState(null); // { savedStreak, lastDate }
  const [customAlert, setCustomAlert] = useState(null); // { title, message, buttons, type }

  useEffect(() => {
    load();
    requestNotificationPermissions();
    const timer = setTimeout(() => setShowSplash(false), 3600);
    return () => clearTimeout(timer);
  }, []);

  const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    console.log("Notif Permission Status:", finalStatus);
    if (finalStatus !== 'granted') {
      showAlert('Notice', 'Notification permissions are required for spin reminders. Please enable them in settings.', [{ text: 'OK' }], 'info');
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  const scheduleSpinNotification = async (lastSpinTime) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      const triggerTime = lastSpinTime + FREE_SPIN_COOLDOWN;
      const secondsLeft = Math.max(1, Math.floor((triggerTime - Date.now()) / 1000));

      console.log("Scheduling notification in", secondsLeft, "seconds");

      console.log("Scheduling notification in", secondsLeft, "seconds");

      await Notifications.scheduleNotificationAsync({
        identifier: 'spin-reminder',
        content: {
          title: "🎰 Spin Ready!",
          body: "Your free spin is ready! Come back and claim your rewards 🪙✨",
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.MAX,
          color: '#5B4CDB',
        },
        trigger: {
          type: 'timeInterval',
          seconds: secondsLeft,
          channelId: 'default',
          repeats: false
        },
      });
      console.log("Notification scheduled successfully!");
    } catch (e) {
      console.log("Notif Error:", e);
      showAlert('Error', 'Failed to schedule notification.', [{ text: 'OK' }], 'error');
    }
  };

  const getStreakReward = (streak) => {
    if (streak > 60) return 40;
    if (streak >= 30) return 30;
    if (streak >= 15) return 20;
    if (streak >= 5) return 15;
    return 10;
  };

  const load = async () => {
    try {
      // Requirement: Check for updates
      try {
        const configRes = await fetch(CONFIG_URL);
        const configData = await configRes.json();
        const serverVersion = configData.version || '1.0.0';
        const serverMajor = parseInt(serverVersion.split('.')[0]);
        const currentMajor = parseInt(CURRENT_VERSION.split('.')[0]);

        if (currentMajor < serverMajor) {
          showAlert('Update Available', 'A new version of AI Photo Prompt is available! Please update to get the latest features and security.', [
            { text: 'Update Now', onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.dipak.pearlai') }
          ], 'success');
        }
      } catch (e) {
        console.log("Update Check Error:", e);
      }

      const s = await AsyncStorage.getItem('p_data');
      const today = new Date().toDateString();
      if (s) {
        const saved = JSON.parse(s);
        const lastDate = saved.lastOpenDate;

        if (lastDate === today) {
          setUserData(saved);
        } else {
          const lastDateObj = new Date(lastDate);
          const todayObj = new Date(today);
          const diffTime = todayObj.getTime() - lastDateObj.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Success! Increment streak
            const newStreak = (saved.currentStreak || 0) + 1;
            processStreak(saved, newStreak, today);
          } else if (diffDays <= 2 && saved.currentStreak > 1) {
            // Within 48 hours & had a streak -> Offer Restore
            setUserData(saved);
            setRestoreModal({ savedStreak: saved.currentStreak, lastDate });
          } else {
            // Streak broken
            processStreak(saved, 1, today);
          }
        }
      } else {
        processStreak(null, 1, today);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  const processStreak = async (saved, newStreak, today) => {
    const base = saved || {
      name: 'Member', coins: 120, lastSpinTime: 0, spinTickets: 0,
      unlockedIds: [], favorites: [], premiumPassExpiry: 0, premiumPassUnlocks: 0,
      vouchers: { dayPass: 0, weekPass: 0 },
      subscription: { type: 'free', expiry: 0, purchasePrice: 0, totalDays: 0 }
    };

    const rewardCoins = getStreakReward(newStreak);
    let dayPassGain = 0;
    let weekPassGain = 0;
    let streakQuotaGain = 0;

    if (newStreak === 31) {
      dayPassGain = 1;
      streakQuotaGain = 5;
    }
    if (newStreak === 61) weekPassGain = 1;

    const newVouchers = {
      dayPass: (base.vouchers?.dayPass || 0) + dayPassGain,
      weekPass: (base.vouchers?.weekPass || 0) + weekPassGain
    };

    const updated = {
      ...base,
      coins: (base.coins || 0) + rewardCoins,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, base.longestStreak || 0),
      lastOpenDate: today,
      vouchers: newVouchers,
      streakVoucherUnlocks: (base.streakVoucherUnlocks || 0) + streakQuotaGain
    };

    setUserData(updated);
    await AsyncStorage.setItem('p_data', JSON.stringify(updated));
    setStreakModal({
      coins: rewardCoins,
      streak: newStreak,
      voucher: dayPassGain ? '1 Day Premium Pass' : weekPassGain ? '7 Day Weekly Pass' : null
    });
  };

  const handleRestoreStreak = async () => {
    if (userData.coins < 100) {
      showAlert('Not enough coins', 'You need 100 coins to restore your streak.', [{ text: 'Got it' }], 'error');
      return;
    }
    const today = new Date().toDateString();
    const newStreak = userData.currentStreak + 1;
    const base = { ...userData, coins: userData.coins - 100 };
    setRestoreModal(null);
    await processStreak(base, newStreak, today);
  };

  const update = async (d) => {
    const n = { ...userData, ...d };
    setUserData(n);
    await AsyncStorage.setItem('p_data', JSON.stringify(n));
    // If lastSpinTime was updated, reschedule notification
    if (d.lastSpinTime) {
      scheduleSpinNotification(d.lastSpinTime);
    }
  };

  // Requirement: Handle Ads (App Open & Interstitial Auto-Reload)
  useEffect(() => {
    const unsubOpen = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      appOpenAd.show();
    });

    const unsubInt = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialAd.load(); // Reload for next time
    });

    appOpenAd.load();
    interstitialAd.load();

    return () => {
      unsubOpen();
      unsubInt();
    };
  }, []);

  const showAlert = (title, message, buttons = [{ text: 'OK' }], type = 'info') => {
    setCustomAlert({ title, message, buttons, type });
  };

  if (!fontsLoaded || loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserContext.Provider value={{
        theme: 'light',
        userData,
        updateUserData: update,
        showAlert,
        hasSubscription: (userData?.subscription?.expiry || 0) > Date.now(),
        updateSubscription: (days, price) => update({
          subscription: {
            type: 'pro',
            expiry: Date.now() + days * 24 * 60 * 60 * 1000,
            purchasePrice: price,
            totalDays: days
          }
        })
      }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="T" component={TabNavigator} />
              <Stack.Screen name="Details" component={DetailsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Subscription" component={SubscriptionScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>

        {/* 🔥 Daily Streak Reward Modal */}
        <Modal visible={!!streakModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.streakModalCard}>
              <StreakModalContent
                streak={streakModal?.streak || 1}
                coins={streakModal?.coins || 10}
                voucher={streakModal?.voucher}
                onClose={() => setStreakModal(null)}
              />
            </View>
          </View>
        </Modal>

        {/* 🛠 Restore Streak Modal */}
        <Modal visible={!!restoreModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.restoreModalCard}>
              <AppText style={{ fontSize: 64 }}>💔</AppText>
              <AppText variant="bold" style={{ fontSize: 24, color: '#1A1033', marginTop: 10 }}>Streak Broken!</AppText>
              <AppText style={{ color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
                You missed a day! You were on a <AppText variant="bold" style={{ color: '#EF4444' }}>{restoreModal?.savedStreak} day streak</AppText>.
              </AppText>

              <View style={[styles.restoreOption, { backgroundColor: '#F0F2FF' }]}>
                <Coins size={24} color="#F59E0B" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText variant="bold" style={{ fontSize: 16 }}>Restore Streak</AppText>
                  <AppText style={{ fontSize: 12, color: '#6B7280' }}>Pay 100 coins to continue your fire!</AppText>
                </View>
                <TouchableOpacity
                  onPress={handleRestoreStreak}
                  style={[styles.restoreBtn, { backgroundColor: '#5B4CDB' }]}
                >
                  <AppText variant="bold" style={{ color: 'white' }}>100 🪙</AppText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  const today = new Date().toDateString();
                  processStreak(userData, 1, today);
                  setRestoreModal(null);
                }}
                style={{ marginTop: 20 }}
              >
                <AppText style={{ color: '#9CA3AF', variant: 'semibold' }}>No, start fresh</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 📋 Custom Stylish Alert Modal */}
        <Modal visible={!!customAlert} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.alertCard}>
              <View style={[styles.alertIconBox, { backgroundColor: customAlert?.type === 'success' ? '#10B98120' : customAlert?.type === 'error' ? '#EF444420' : '#5B4CDB20' }]}>
                {customAlert?.type === 'success' ? <Sparkles color="#10B981" /> : customAlert?.type === 'error' ? <ShieldAlert color="#EF4444" /> : <Zap color="#5B4CDB" />}
              </View>
              <AppText variant="bold" style={{ fontSize: 22, marginTop: 16 }}>{customAlert?.title}</AppText>
              <AppText style={{ color: '#6B7280', textAlign: 'center', marginTop: 8, fontSize: 14 }}>{customAlert?.message}</AppText>

              <View style={{ width: '100%', marginTop: 24, gap: 10 }}>
                {customAlert?.buttons?.map((btn, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setCustomAlert(null);
                      btn.onPress && btn.onPress();
                    }}
                    style={[
                      styles.alertBtn,
                      { backgroundColor: btn.style === 'cancel' ? '#F3F4F6' : '#5B4CDB' }
                    ]}
                  >
                    <AppText variant="bold" style={{ color: btn.style === 'cancel' ? '#6B7280' : 'white' }}>{btn.text}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* 🚀 Premium Animated Splash Screen */}
        {showSplash && <SplashScreenView />}

      </UserContext.Provider>
    </GestureHandlerRootView>
  );
}

function SplashScreenView() {
  // --- Animation Values ---
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  // Sparkle dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const dot4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo springs in
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // 2. Ring pulse (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 1.25, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.5, duration: 450, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 0.6, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // 3. Sparkle dots staggered
    const dotIn = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    dotIn(dot1, 0).start();
    dotIn(dot2, 350).start();
    dotIn(dot3, 700).start();
    dotIn(dot4, 1050).start();

    // 4. Title slides up after 300ms
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(titleTranslateY, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
      ]).start();
    }, 300);

    // 5. Subtitle fades after 600ms
    setTimeout(() => {
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 700);

    // 6. Progress bar fills over 3s
    setTimeout(() => {
      Animated.timing(progressWidth, { toValue: 1, duration: 3000, useNativeDriver: false }).start();
    }, 300);

    // 7. Shimmer background
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const BAR_WIDTH = width * 0.55;

  return (
    <View style={[styles.splashOverlay, { overflow: 'hidden' }]}>
      {/* Shimmer background blob */}
      <Animated.View style={{
        position: 'absolute', width: 350, height: 350, borderRadius: 175,
        backgroundColor: '#5B4CDB', top: -80, right: -80, opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.12] }),
      }} />
      <Animated.View style={{
        position: 'absolute', width: 250, height: 250, borderRadius: 125,
        backgroundColor: '#7C3AED', bottom: -60, left: -60, opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.15] }),
      }} />

      {/* Center content */}
      <View style={{ alignItems: 'center' }}>

        {/* Logo with pulsing ring */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          {/* Pulsing outer ring */}
          <Animated.View style={{
            position: 'absolute',
            width: 160, height: 160, borderRadius: 80,
            borderWidth: 2, borderColor: '#5B4CDB',
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          }} />
          {/* Middle ring */}
          <Animated.View style={{
            position: 'absolute',
            width: 140, height: 140, borderRadius: 70,
            borderWidth: 1.5, borderColor: '#5B4CDB40',
            opacity: ringOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
            transform: [{ scale: ringScale.interpolate({ inputRange: [0.6, 1.25], outputRange: [0.8, 1.1] }) }],
          }} />

          {/* Logo box */}
          <Animated.View style={[styles.splashLogoBox, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
            <Sparkles size={56} color="#5B4CDB" />
          </Animated.View>

          {/* Orbiting sparkle dots */}
          {[
            { anim: dot1, top: -6, left: 90, color: '#5B4CDB' },
            { anim: dot2, top: 90, right: -6, color: '#7C3AED' },
            { anim: dot3, bottom: -6, left: 50, color: '#EC4899' },
            { anim: dot4, top: 50, left: -8, color: '#F59E0B' },
          ].map((d, i) => (
            <Animated.View key={i} style={{
              position: 'absolute', width: 12, height: 12, borderRadius: 6,
              backgroundColor: d.color,
              top: d.top, left: d.left, right: d.right, bottom: d.bottom,
              opacity: d.anim,
              transform: [{ scale: d.anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
            }} />
          ))}
        </View>

        {/* Title */}
        <Animated.View style={{ alignItems: 'center', marginTop: 36, opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }}>
          <AppText variant="bold" style={{ color: '#1A1033', fontSize: 38, letterSpacing: 3 }}>AI PHOTO</AppText>
          <AppText variant="bold" style={{ color: '#5B4CDB', fontSize: 38, letterSpacing: 3, marginTop: -4 }}>PROMPT</AppText>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{ opacity: subtitleOpacity, marginTop: 10 }}>
          <AppText style={{ color: '#9CA3AF', fontSize: 11, letterSpacing: 6 }}>AI POWERED PROMPT STUDIO</AppText>
        </Animated.View>

        {/* Progress bar */}
        <Animated.View style={{ opacity: subtitleOpacity, marginTop: 52, alignItems: 'center' }}>
          <View style={{ width: BAR_WIDTH, height: 3, backgroundColor: '#E4E4F7', borderRadius: 4, overflow: 'hidden' }}>
            <Animated.View style={{
              height: '100%', borderRadius: 4,
              backgroundColor: '#5B4CDB',
              width: progressWidth.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_WIDTH] }),
            }} />
          </View>
          <AppText style={{ color: '#C4B5FD', fontSize: 10, letterSpacing: 2, marginTop: 12 }}>LOADING...</AppText>
        </Animated.View>

      </View>
    </View>
  );
}

function StreakModalContent({ streak, coins, voucher, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.spring(coinAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 5 }).start();
    }, 400);
  }, []);

  const milestones = [5, 15, 30, 31, 60, 61];
  const nextMilestone = milestones.find(m => m > streak) || 100;
  const daysLeft = nextMilestone - streak;

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDow = (new Date().getDay() + 6) % 7;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim, alignItems: 'center' }}>
      <AppText style={{ fontSize: 64 }}>🔥</AppText>
      <AppText variant="bold" style={{ fontSize: 26, color: '#1A1033', marginTop: 8 }}>
        {streak} Day Streak!
      </AppText>
      <AppText style={{ color: '#6B7280', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
        Keep it up! Your fire is growing stronger.
      </AppText>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
        {DAYS.map((d, i) => {
          const active = i <= todayDow;
          return (
            <View key={i} style={[
              styles.streakDot,
              { backgroundColor: active ? '#F59E0B' : '#E4E4F7' },
            ]}>
              <AppText variant="bold" style={{ fontSize: 9, color: active ? 'white' : '#9CA3AF' }}>{d}</AppText>
            </View>
          );
        })}
      </View>

      <View style={{ width: '100%', alignItems: 'center' }}>
        <Animated.View style={[
          styles.streakCoinBox,
          { transform: [{ scale: coinAnim }] }
        ]}>
          <Coins size={22} color="#F59E0B" fill="#F59E0B" />
          <AppText variant="bold" style={{ color: '#D97706', fontSize: 24, marginLeft: 8 }}>+{coins} Coins</AppText>
        </Animated.View>

        {voucher && (
          <Animated.View style={[
            styles.streakVoucherBox,
            { transform: [{ scale: coinAnim }], backgroundColor: '#EEF2FF', marginTop: 12 }
          ]}>
            <Crown size={20} color="#5B4CDB" />
            <AppText variant="bold" style={{ color: '#5B4CDB', fontSize: 15, marginLeft: 10 }}>Bonus: {voucher}</AppText>
          </Animated.View>
        )}
      </View>

      {daysLeft > 0 && (
        <AppText style={{ color: '#6B7280', fontSize: 12, marginTop: 15, textAlign: 'center' }}>
          {daysLeft} day{daysLeft > 1 ? 's' : ''} to next reward 🎁
        </AppText>
      )}

      <TouchableOpacity
        onPress={onClose}
        style={styles.streakClaimBtn}
        activeOpacity={0.85}
      >
        <AppText variant="bold" style={{ color: 'white', fontSize: 16 }}>Awesome! 🎉</AppText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const menuLabel = {};
const styles = StyleSheet.create({
  // Core Layout
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Top Bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  profileIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  appTitle: { fontSize: 24, letterSpacing: 0.5 },

  // Coin Badge
  coinBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  coinAmount: { fontSize: 15, marginLeft: 6, color: '#D97706' },

  // Categories
  categoryContainer: { flexDirection: 'row', gap: 10, marginBottom: 12, paddingTop: 4 },
  categoryBtn: { flex: 1, paddingVertical: 11, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  categoryText: { fontSize: 12, letterSpacing: 0.5 },

  // Cards
  listContent: { padding: 10, paddingBottom: 100 },
  card: { width: (width - 40) / 2, margin: 5, borderRadius: 22, overflow: 'hidden' },
  cardImageContainer: { height: 210, position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImageGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'transparent',
    // Simulated bottom fade
  },
  lockPill: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10 },
  lockOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  lockBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 10 },
  lockText: { color: 'white', fontSize: 10, marginLeft: 5 },
  premiumBadge: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  premiumBadgeText: { color: 'white', fontSize: 9, marginLeft: 3 },
  newBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  newBadgeText: { color: 'white', fontSize: 9 },
  cardInfo: { paddingHorizontal: 12, paddingVertical: 10 },
  cardTitle: { fontSize: 13, marginBottom: 2 },
  cardTag: { fontSize: 11 },

  // Spin Screen
  mainHeading: { fontSize: 28, marginVertical: 16, letterSpacing: 0.5 },
  spinBtn: { padding: 18, borderRadius: 20, alignItems: 'center' },

  // Navigation & Misc
  header: { padding: 18, paddingBottom: 8 },
  headerTitle: { fontSize: 24 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingsHeaderTitle: { fontSize: 20 },

  // Profile
  profileCard: {
    padding: 30, borderRadius: 28, alignItems: 'center', marginBottom: 20,
    shadowColor: '#5B4CDB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 20, elevation: 8,
  },
  profileName: { fontSize: 22, marginTop: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  menuList: { gap: 10 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 18,
    shadowColor: '#5B4CDB', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuLabel: { fontSize: 15 },

  // Screen Headers
  screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  screenHeaderTitle: { fontSize: 26 },
  screenHeaderBadge: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  navBackBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  navHeaderTitle: { fontSize: 18, letterSpacing: 0.3 },

  // Profile Hero
  profileHeroCard: {
    borderRadius: 28, padding: 28, alignItems: 'center', marginBottom: 20,
    shadowColor: '#5B4CDB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8
  },
  profileAvatarRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 2.5, padding: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  profileAvatarInner: { width: '100%', height: '100%', borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  proBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  editChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 24, width: '100%' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 11, marginTop: 3 },
  statDivider: { width: 1, height: 36, borderRadius: 1 },

  // Premium Menu
  premiumMenuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 14,
    shadowColor: '#5B4CDB', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
  },
  menuIconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  activeTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },

  // Subscription
  subHeroBanner: { borderRadius: 28, padding: 28 },
  subHeroContent: { alignItems: 'center' },
  subFeaturePills: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' },
  featurePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  passCard: {
    flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22, borderWidth: 1.5, gap: 14,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5
  },
  passIconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  planCardNew: {
    flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 22, marginBottom: 12, gap: 14,
    shadowColor: '#5B4CDB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5
  },
  planCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 22, marginBottom: 12, borderWidth: 2,
    shadowColor: '#5B4CDB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 14, elevation: 6,
  },
  popularBadge: { position: 'absolute', top: -12, right: 20, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  nameInput: { fontSize: 20, fontWeight: 'bold', borderBottomWidth: 2, minWidth: 160, textAlign: 'center', padding: 5, marginBottom: 5 },
  nameBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 12 },

  // Immersive Details
  detailImageWrapper: { height: height * 0.62, position: 'relative' },
  fullDetailImage: { width: '100%', height: '100%' },
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 100 },
  floatingActionBtn: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden' },
  blurWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 170, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  immersiveTitle: { color: 'white', fontSize: 26, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  immersiveStyle: { color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 5 },
  immersiveContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -30, paddingHorizontal: 20, paddingTop: 30 },
  unlockedContainer: { width: '100%' },
  promptCardInner: { padding: 24, borderRadius: 24, marginBottom: 20, borderWidth: 1 },
  promptTextDisplay: { fontSize: 16, lineHeight: 26 },
  actionBtnLarge: { width: '100%', padding: 20, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 10 },
  lockedContainer: { width: '100%', alignItems: 'center' },
  lockNotice: { width: '100%', padding: 28, borderRadius: 24, alignItems: 'center', marginBottom: 20, borderStyle: 'dashed', borderWidth: 1.5 },

  // ── Streak ────────────────────────────────────
  streakCard: {
    borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1.5,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5
  },
  streakBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  streakDayPill: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },

  // ── Streak Modal ──────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  streakModalCard: {
    backgroundColor: 'white', borderRadius: 32, padding: 32, width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 20
  },
  streakDot: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  streakCoinBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 14, marginTop: 20,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6
  },
  streakClaimBtn: {
    backgroundColor: '#5B4CDB', borderRadius: 20, paddingHorizontal: 42, paddingVertical: 16, marginTop: 24,
    shadowColor: '#5B4CDB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10
  },
  streakVoucherBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, width: '100%', justifyContent: 'center' },

  // ── Restore ───────────────────────────────────
  restoreModalCard: { backgroundColor: 'white', borderRadius: 32, padding: 32, width: '90%', alignItems: 'center' },
  restoreOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginTop: 20, width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#E4E4F7' },
  restoreBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },

  // ── Roadmap ───────────────────────────────────
  rewardMilestoneCard: { width: 90, padding: 12, borderRadius: 18, alignItems: 'center', borderStyle: 'solid', borderWidth: 1, borderColor: '#E4E4F7', marginRight: 10 },
  voucherItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, borderStyle: 'solid', borderWidth: 1 },
  voucherIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // ── Custom Alert ──────────────────────────────
  alertCard: { backgroundColor: 'white', borderRadius: 28, padding: 32, width: '85%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 15 },
  alertIconBox: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  alertBtn: { width: '100%', paddingVertical: 15, borderRadius: 14, alignItems: 'center' },

  // ── Pagination ────────────────────────────────
  loadMoreBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, borderWidth: 2, backgroundColor: 'white' },

  // ── Splash ───────────────────────────────────
  splashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#F8FAFF', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  splashLogoBox: { width: 120, height: 120, borderRadius: 40, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#5B4CDB20', shadowColor: '#5B4CDB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
});


