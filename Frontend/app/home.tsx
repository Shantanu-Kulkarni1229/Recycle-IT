import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  SafeAreaView,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  useWindowDimensions,
  RefreshControl
} from "react-native";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { 
  Map, 
  Archive, 
  BookOpen, 
  User, 
  RefreshCw, 
  Award,
  Clock,
  Globe,
  TrendingUp,
  Bell,
  Settings,
  Plus,
  Activity,
  ArrowRight,
  Zap,
  Target,
  Star,
  ChevronRight,
  Info,
  Home as HomeIcon,
  Navigation
} from "react-native-feather";

// Import other tabs
import PreviousRecycles from "./PreviousRecycles";
import RecyclersNearby from "./RecyclersNearby";
import Learn from "./Learn";
import Profile from "./Profile";
import SchedulePickupPage from "./SchedulePickupPage";

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation, userId }: { navigation: any; userId: string }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [refreshing, setRefreshing] = useState(false);
  const { width, height } = useWindowDimensions();
  const isSmallScreen = height < 700;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // User stats
  const userStats = {
    itemsRecycled: 47,
    carbonSaved: 128,
    currentStreak: 12,
    monthlyGoal: 60,
    progress: 78,
    level: 3,
    nextLevelPoints: 180,
    weeklyGoal: 15,
    weeklyProgress: 11,
    totalEarnings: 245,
    badgesEarned: 8
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const quickTips = [
    "Recycling one million laptops saves energy equivalent to powering 3,500 homes for an entire year. Every device counts!",
    "E-waste contains precious metals like gold, silver, and platinum. Recycling helps recover these valuable materials!",
    "One recycled smartphone can save enough energy to power a laptop for 44 hours. Small actions, big impact!",
    "Did you know? 95% of smartphone materials can be recycled. Be part of the circular economy!"
  ];

  const [currentTip] = useState(quickTips[Math.floor(Math.random() * quickTips.length)]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
          />
        }
      >
        {/* Modern Header */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="px-5 pt-5 pb-4"
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              <Text className="text-3xl font-black text-gray-900 mb-1" style={{ letterSpacing: -1.2 }}>
                {getCurrentGreeting()}
              </Text>
              <Text className="text-base text-gray-600 font-semibold">
                Ready to make an impact today? 🌍
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                className="w-10 h-10 bg-white rounded-xl justify-center items-center shadow-sm shadow-black/5 active:opacity-70"
                activeOpacity={0.7}
                accessibilityLabel="Notifications"
                accessibilityHint="View your notifications"
              >
                <Bell width={20} height={20} color="#10B981" />
                <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full justify-center items-center">
                  <Text className="text-white text-[10px] font-bold">3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                className="w-10 h-10 bg-white rounded-xl justify-center items-center shadow-sm shadow-black/5 active:opacity-70"
                activeOpacity={0.7}
                accessibilityLabel="Settings"
                accessibilityHint="Go to settings"
              >
                <Settings width={20} height={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Progress Card */}
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="px-5 mb-6"
        >
          <View className="bg-emerald-500 rounded-2xl p-5 shadow-lg shadow-emerald-500/30">
            <View className="flex-row justify-between items-start mb-5">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Star width={20} height={20} color="#FCD34D" fill="#FCD34D" />
                  <Text className="text-white text-xl font-black ml-2">
                    Level {userStats.level}
                  </Text>
                </View>
                <Text className="text-emerald-100 text-sm font-bold mb-1">
                  Eco Champion 🏆
                </Text>
                <Text className="text-emerald-200 text-xs font-semibold">
                  {userStats.nextLevelPoints - userStats.itemsRecycled} items to next level
                </Text>
              </View>
              <View className="bg-white/20 px-3 py-2 rounded-xl">
                <Text className="text-white text-base font-black">
                  {userStats.progress}%
                </Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-emerald-100 text-xs font-bold">
                  Monthly Progress
                </Text>
                <Text className="text-emerald-100 text-xs font-bold">
                  {userStats.itemsRecycled}/{userStats.monthlyGoal}
                </Text>
              </View>
              <View className="h-2 bg-white/20 rounded-full overflow-hidden">
                <View 
                  className="h-2 bg-white rounded-full shadow-sm"
                  style={{ width: `${userStats.progress}%` }}
                />
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              className="bg-white rounded-2xl py-4 flex-row items-center justify-center shadow-md active:opacity-80"
              onPress={() => navigation.navigate("SchedulePickup", { userId })}
              activeOpacity={0.8}
              accessibilityLabel="Schedule new pickup"
              accessibilityHint="Schedule a new e-waste pickup"
            >
              <View className="w-7 h-7 bg-emerald-500 rounded-lg justify-center items-center mr-2">
                <Plus width={16} height={16} color="white" />
              </View>
              <Text className="text-emerald-600 text-base font-black">
                Schedule Pickup
              </Text>
              <Zap width={16} height={16} color="#10B981" className="ml-1" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View className="px-5 mb-6">
          <Text className="text-xl font-black text-gray-900 mb-4">
            Your Impact Dashboard
          </Text>
          
          <View className="flex-row mb-3 gap-2">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm shadow-black/5">
              <View className="w-12 h-12 bg-blue-50 rounded-xl justify-center items-center mb-3">
                <Award width={24} height={24} color="#3B82F6" />
              </View>
              <Text className="text-2xl font-black text-gray-900 mb-1" style={{ letterSpacing: -0.8 }}>
                {userStats.itemsRecycled}
              </Text>
              <Text className="text-xs text-gray-600 font-bold text-center">
                Items Recycled
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm shadow-black/5">
              <View className="w-12 h-12 bg-emerald-50 rounded-xl justify-center items-center mb-3">
                <Globe width={24} height={24} color="#10B981" />
              </View>
              <Text className="text-2xl font-black text-gray-900 mb-1" style={{ letterSpacing: -0.8 }}>
                {userStats.carbonSaved}
              </Text>
              <Text className="text-xs text-gray-600 font-bold text-center">
                CO₂ Saved (kg)
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm shadow-black/5">
              <View className="w-12 h-12 bg-yellow-50 rounded-xl justify-center items-center mb-3">
                <Activity width={24} height={24} color="#F59E0B" />
              </View>
              <Text className="text-2xl font-black text-gray-900 mb-1" style={{ letterSpacing: -0.8 }}>
                {userStats.currentStreak}
              </Text>
              <Text className="text-xs text-gray-600 font-bold text-center">
                Day Streak
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm shadow-black/5">
              <View className="w-12 h-12 bg-purple-50 rounded-xl justify-center items-center mb-3">
                <Target width={24} height={24} color="#8B5CF6" />
              </View>
              <Text className="text-2xl font-black text-gray-900 mb-1" style={{ letterSpacing: -0.8 }}>
                ${userStats.totalEarnings}
              </Text>
              <Text className="text-xs text-gray-600 font-bold text-center">
                Total Earned
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Challenge */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-black text-gray-900">
              Weekly Challenge
            </Text>
            <TouchableOpacity>
              <Info width={16} height={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View className="bg-purple-500 rounded-2xl p-5 shadow-md shadow-purple-500/20">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-white text-lg font-black mb-1">
                  Recycle {userStats.weeklyGoal} Items
                </Text>
                <Text className="text-purple-100 text-sm font-semibold">
                  {userStats.weeklyProgress}/{userStats.weeklyGoal} completed
                </Text>
              </View>
              <View className="w-12 h-12 bg-white/20 rounded-xl justify-center items-center">
                <Text className="text-white text-sm font-black">
                  {Math.round((userStats.weeklyProgress / userStats.weeklyGoal) * 100)}%
                </Text>
              </View>
            </View>
            <View className="h-1.5 bg-white/20 rounded-full">
              <View 
                className="h-1.5 bg-white rounded-full"
                style={{ width: `${(userStats.weeklyProgress / userStats.weeklyGoal) * 100}%` }}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mb-6">
          <Text className="text-xl font-black text-gray-900 mb-4">
            Quick Actions
          </Text>
          
          <View className="gap-3">
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm shadow-black/5 active:opacity-70"
                onPress={() => navigation.navigate("RecyclersNearby")}
                activeOpacity={0.7}
                accessibilityLabel="Find recycling centers"
                accessibilityHint="Find nearby recycling facilities"
              >
                <View className="w-12 h-12 bg-blue-50 rounded-xl justify-center items-center mb-3">
                  <Map width={24} height={24} color="#3B82F6" />
                </View>
                <Text className="text-base font-black text-gray-900 mb-1">
                  Find Centers
                </Text>
                <Text className="text-xs text-gray-600 font-semibold">
                  Discover nearby facilities
                </Text>
                <View className="absolute top-4 right-4">
                  <ChevronRight width={16} height={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm shadow-black/5 active:opacity-70"
                onPress={() => navigation.navigate("PreviousRecycles")}
                activeOpacity={0.7}
                accessibilityLabel="Recycling history"
                accessibilityHint="View your recycling history"
              >
                <View className="w-12 h-12 bg-yellow-50 rounded-xl justify-center items-center mb-3">
                  <Archive width={24} height={24} color="#F59E0B" />
                </View>
                <Text className="text-base font-black text-gray-900 mb-1">
                  History
                </Text>
                <Text className="text-xs text-gray-600 font-semibold">
                  Track your journey
                </Text>
                <View className="absolute top-4 right-4">
                  <ChevronRight width={16} height={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm shadow-black/5 active:opacity-70"
                onPress={() => navigation.navigate("Learn")}
                activeOpacity={0.7}
                accessibilityLabel="Learn about recycling"
                accessibilityHint="Educational content about recycling"
              >
                <View className="w-12 h-12 bg-purple-50 rounded-xl justify-center items-center mb-3">
                  <BookOpen width={24} height={24} color="#8B5CF6" />
                </View>
                <Text className="text-base font-black text-gray-900 mb-1">
                  Learn
                </Text>
                <Text className="text-xs text-gray-600 font-semibold">
                  Educational tips
                </Text>
                <View className="absolute top-4 right-4">
                  <ChevronRight width={16} height={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm shadow-black/5 active:opacity-70"
                onPress={() => navigation.navigate("Profile")}
                activeOpacity={0.7}
                accessibilityLabel="Profile"
                accessibilityHint="Go to your profile"
              >
                <View className="w-12 h-12 bg-pink-50 rounded-xl justify-center items-center mb-3">
                  <User width={24} height={24} color="#EC4899" />
                </View>
                <Text className="text-base font-black text-gray-900 mb-1">
                  Profile
                </Text>
                <Text className="text-xs text-gray-600 font-semibold">
                  Manage account
                </Text>
                <View className="absolute top-4 right-4">
                  <ChevronRight width={16} height={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Daily Eco Tip */}
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="px-5 mb-6"
        >
          <Text className="text-xl font-black text-gray-900 mb-3">
            Daily Eco Tip
          </Text>
          <View className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 shadow-sm shadow-yellow-200/20">
            <View className="flex-row items-start">
              <View className="w-12 h-12 bg-yellow-400 rounded-xl justify-center items-center mr-3 shadow-sm shadow-yellow-400/20">
                <Info width={20} height={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-black text-yellow-900 mb-2">
                  Did You Know?
                </Text>
                <Text className="text-sm text-yellow-800 leading-5 font-semibold">
                  {currentTip}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Achievement Badges */}
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="px-5 mb-6"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-black text-gray-900">
              Recent Achievements
            </Text>
            <TouchableOpacity>
              <Text className="text-emerald-600 text-sm font-bold">View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
            <View className="flex-row gap-3">
              {[
                { title: "Streak Master", desc: "10 day streak", bg: "bg-red-400" },
                { title: "Eco Warrior", desc: "50 items recycled", bg: "bg-emerald-400" },
                { title: "Carbon Saver", desc: "100kg CO₂ saved", bg: "bg-blue-400" },
                { title: "Community Hero", desc: "Helped 5 neighbors", bg: "bg-purple-400" }
              ].map((badge, index) => (
                <View key={index} className={`${badge.bg} rounded-xl p-3 w-28 shadow-sm`}>
                  <View className="w-8 h-8 bg-white/20 rounded-lg justify-center items-center mb-2">
                    <Star width={16} height={16} color="white" fill="white" />
                  </View>
                  <Text className="text-white text-xs font-black mb-1">{badge.title}</Text>
                  <Text className="text-white/80 text-[10px] font-semibold">{badge.desc}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Custom Bottom Tab Bar Component
const CustomBottomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View className="flex-row h-20 bg-white border-t border-gray-100 px-4">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Custom icons for each tab
        const getIcon = (routeName: string) => {
          const iconProps = {
            width: 24,
            height: 24,
            color: isFocused ? "#10B981" : "#9CA3AF"
          };

          switch (routeName) {
            case "Home":
              return <HomeIcon {...iconProps} />;
            case "RecyclersNearby":
              return <Map {...iconProps} />;
            case "PreviousRecycles":
              return <Archive {...iconProps} />;
            case "Learn":
              return <BookOpen {...iconProps} />;
            case "Profile":
              return <User {...iconProps} />;
            default:
              return <HomeIcon {...iconProps} />;
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center"
          >
            <View className={`items-center ${isFocused ? "transform -translate-y-2" : ""}`}>
              <View className={`p-2 rounded-lg ${isFocused ? "bg-emerald-100" : ""}`}>
                {getIcon(route.name)}
              </View>
              <Text className={`text-xs mt-1 font-semibold ${isFocused ? "text-emerald-600" : "text-gray-500"}`}>
                {typeof label === 'string' ? label : ''}
              </Text>
            </View>
            
            {/* Active indicator */}
            {isFocused && (
              <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Home = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        if (id) setUserId(id);
      } catch (err) {
        console.log("Error fetching userId:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserId();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-emerald-50" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View className="items-center bg-white rounded-2xl p-6 shadow-md shadow-emerald-200/30 mx-5">
          <View className="w-16 h-16 bg-emerald-100 rounded-2xl justify-center items-center mb-4 shadow-sm shadow-emerald-500/20">
            <RefreshCw width={32} height={32} color="#10B981" />
          </View>
          <ActivityIndicator size="large" color="#10B981" className="mb-3" />
          <Text className="text-xl font-black text-gray-900 mb-1">
            Loading RecycleIT
          </Text>
          <Text className="text-sm text-gray-600 font-semibold text-center">
            Preparing your eco dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-emerald-50 px-5" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View className="bg-white rounded-2xl p-6 items-center shadow-md shadow-emerald-200/30 w-full max-w-sm">
          <View className="w-20 h-20 bg-emerald-100 rounded-2xl justify-center items-center mb-4 shadow-sm shadow-emerald-500/20">
            <RefreshCw width={36} height={36} color="#10B981" />
          </View>
          <Text className="text-2xl font-black text-gray-900 mb-2 text-center" style={{ letterSpacing: -0.5 }}>
            Welcome to RecycleIT
          </Text>
          <Text className="text-base text-gray-600 text-center mb-6 leading-6 font-semibold">
            Join the eco revolution! Track your impact and schedule e-waste pickups
          </Text>
          <TouchableOpacity 
            className="bg-emerald-500 rounded-2xl py-4 px-6 w-full shadow-md shadow-emerald-500/20 active:opacity-80"
            onPress={() => {/* Navigate to login */}}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-black text-center">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home">
        {({ navigation }) => <HomeScreen navigation={navigation} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="RecyclersNearby">
        {() => <RecyclersNearby />}
      </Tab.Screen>
      <Tab.Screen name="PreviousRecycles">
        {() => <PreviousRecycles userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Learn">
        {() => <Learn />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => <Profile />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default Home;