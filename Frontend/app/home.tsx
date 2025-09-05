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
  Animated
} from "react-native";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavbar from "../components/BottomNavbar";
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
  ArrowRight
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // User stats
  const userStats = {
    itemsRecycled: 47,
    carbonSaved: 128,
    currentStreak: 12,
    monthlyGoal: 60,
    progress: 78,
    level: 3,
    nextLevelPoints: 180
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" translucent={false} />
      
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Clean Header */}
        <View className="px-6 pt-5 pb-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-black text-gray-900" style={{ letterSpacing: -0.5 }}>
                Good morning
              </Text>
              <Text className="text-base text-gray-600 mt-1 font-medium">
                Let's make an impact today
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity className="w-11 h-11 bg-white rounded-xl justify-center items-center shadow-sm">
                <Bell width={20} height={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity className="w-11 h-11 bg-white rounded-xl justify-center items-center shadow-sm">
                <Settings width={20} height={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Progress Card */}
        <Animated.View style={{ opacity: fadeAnim }} className="px-6 mb-7">
          <View className="bg-emerald-500 rounded-2xl p-6 shadow-xl shadow-emerald-500/30">
            <View className="flex-row justify-between items-start mb-5">
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold mb-1">
                  Level {userStats.level} • Eco Champion
                </Text>
                <Text className="text-emerald-100 text-base font-medium">
                  {userStats.nextLevelPoints - userStats.itemsRecycled} items to next level
                </Text>
              </View>
              <View className="bg-white/20 px-3 py-2 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  {userStats.progress}%
                </Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View className="h-2 bg-white/20 rounded-full mb-5">
              <View 
                className="h-2 bg-white rounded-full" 
                style={{ width: `${userStats.progress}%` }}
              />
            </View>

            <TouchableOpacity 
              className="bg-white rounded-2xl py-4 flex-row items-center justify-center shadow-lg active:scale-95"
              onPress={() => navigation.navigate("SchedulePickup")}
              activeOpacity={0.9}
            >
              <Plus width={20} height={20} color="#10B981" />
              <Text className="text-emerald-500 text-base font-bold ml-2">
                Schedule New Pickup
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View className="px-6 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Your Impact
          </Text>
          
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-white rounded-2xl p-5 items-center shadow-sm">
              <View className="w-12 h-12 bg-blue-50 rounded-xl justify-center items-center mb-3">
                <Award width={24} height={24} color="#3B82F6" />
              </View>
              <Text className="text-3xl font-black text-gray-900 mb-1">
                {userStats.itemsRecycled}
              </Text>
              <Text className="text-xs text-gray-600 font-semibold text-center">
                Items Recycled
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-5 items-center shadow-sm">
              <View className="w-12 h-12 bg-emerald-50 rounded-xl justify-center items-center mb-3">
                <Globe width={24} height={24} color="#10B981" />
              </View>
              <Text className="text-3xl font-black text-gray-900 mb-1">
                {userStats.carbonSaved}
              </Text>
              <Text className="text-xs text-gray-600 font-semibold text-center">
                CO₂ Saved (kg)
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-2xl p-5 items-center shadow-sm">
              <View className="w-12 h-12 bg-yellow-50 rounded-xl justify-center items-center mb-3">
                <Activity width={24} height={24} color="#F59E0B" />
              </View>
              <Text className="text-3xl font-black text-gray-900 mb-1">
                {userStats.currentStreak}
              </Text>
              <Text className="text-xs text-gray-600 font-semibold text-center">
                Day Streak
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-5 items-center shadow-sm">
              <View className="w-12 h-12 bg-pink-50 rounded-xl justify-center items-center mb-3">
                <TrendingUp width={24} height={24} color="#EC4899" />
              </View>
              <Text className="text-3xl font-black text-gray-900 mb-1">
                {userStats.level}
              </Text>
              <Text className="text-xs text-gray-600 font-semibold text-center">
                Current Level
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </Text>
          
          <View className="gap-3">
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-5 shadow-sm active:scale-95"
                onPress={() => navigation.navigate("RecyclersNearby")}
                activeOpacity={0.8}
              >
                <View className="w-12 h-12 bg-blue-50 rounded-xl justify-center items-center mb-3">
                  <Map width={24} height={24} color="#3B82F6" />
                </View>
                <Text className="text-base font-bold text-gray-900 mb-1">
                  Find Centers
                </Text>
                <Text className="text-xs text-gray-600 font-medium">
                  Nearby recyclers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-5 shadow-sm active:scale-95"
                onPress={() => navigation.navigate("PreviousRecycles")}
                activeOpacity={0.8}
              >
                <View className="w-12 h-12 bg-yellow-50 rounded-xl justify-center items-center mb-3">
                  <Archive width={24} height={24} color="#F59E0B" />
                </View>
                <Text className="text-base font-bold text-gray-900 mb-1">
                  History
                </Text>
                <Text className="text-xs text-gray-600 font-medium">
                  Past pickups
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-5 shadow-sm active:scale-95"
                onPress={() => navigation.navigate("Learn")}
                activeOpacity={0.8}
              >
                <View className="w-12 h-12 bg-purple-50 rounded-xl justify-center items-center mb-3">
                  <BookOpen width={24} height={24} color="#8B5CF6" />
                </View>
                <Text className="text-base font-bold text-gray-900 mb-1">
                  Learn
                </Text>
                <Text className="text-xs text-gray-600 font-medium">
                  Educational tips
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-white rounded-2xl p-5 shadow-sm active:scale-95"
                onPress={() => navigation.navigate("Profile")}
                activeOpacity={0.8}
              >
                <View className="w-12 h-12 bg-pink-50 rounded-xl justify-center items-center mb-3">
                  <User width={24} height={24} color="#EC4899" />
                </View>
                <Text className="text-base font-bold text-gray-900 mb-1">
                  Profile
                </Text>
                <Text className="text-xs text-gray-600 font-medium">
                  Your account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Environmental Tip */}
        <View className="px-6 mb-6">
          <View className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
            <View className="flex-row items-start">
              <View className="w-12 h-12 bg-yellow-100 rounded-xl justify-center items-center mr-4">
                <ArrowRight width={24} height={24} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-yellow-900 mb-2">
                  Today's Eco Tip
                </Text>
                <Text className="text-sm text-yellow-800 leading-5 font-medium">
                  Recycling one million laptops saves energy equivalent to powering 3,500 homes for an entire year. Every device counts!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
      <View className="flex-1 justify-center items-center bg-gray-50">
        <View className="items-center">
          <View className="w-20 h-20 bg-emerald-50 rounded-2xl justify-center items-center mb-6">
            <RefreshCw width={40} height={40} color="#10B981" />
          </View>
          <ActivityIndicator size="large" color="#10B981" className="mb-4" />
          <Text className="text-lg font-bold text-gray-900 mb-2">
            Loading RecycleIT
          </Text>
          <Text className="text-sm text-gray-600 font-medium">
            Setting up your dashboard...
          </Text>
        </View>
      </View>
    );
  }

  if (!userId) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <View className="bg-white rounded-3xl p-8 items-center shadow-xl w-full max-w-sm">
          <View className="w-20 h-20 bg-emerald-50 rounded-2xl justify-center items-center mb-6">
            <RefreshCw width={40} height={40} color="#10B981" />
          </View>
          <Text className="text-2xl font-black text-gray-900 mb-2">
            Welcome to RecycleIT
          </Text>
          <Text className="text-base text-gray-600 text-center mb-8 leading-6 font-medium">
            Sign in to track your environmental impact and schedule e-waste pickups
          </Text>
          <TouchableOpacity 
            className="bg-emerald-500 rounded-2xl py-4 px-8 w-full shadow-lg shadow-emerald-500/30 active:scale-95"
            onPress={() => {/* Navigate to login */}}
            activeOpacity={0.9}
          >
            <Text className="text-white text-base font-bold text-center">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => <BottomNavbar {...props} />}
    >
      <Tab.Screen name="Home">
        {({ navigation }) => <HomeScreen navigation={navigation} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="RecyclersNearby" component={RecyclersNearby} />
      <Tab.Screen name="PreviousRecycles">
        {() => <PreviousRecycles userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Learn" component={Learn} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="SchedulePickup">
        {() => <SchedulePickupPage userId={userId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default Home;