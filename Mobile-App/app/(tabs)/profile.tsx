/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import {
  User,
  Mail,
  Phone,
  Edit,
  Save,
  LogOut,
  Loader2,
  Leaf,
  ShieldCheck,
  Gift,
  Coins,
  Sparkles,
  Check,
} from "lucide-react-native";
import api from "../../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";

type UserProfile = {
  name: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
};

type Reward = {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  weightRequired: number;
  claimed: boolean;
  claimable: boolean;
};

export default function Profile() {
  const { userId, logout } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", phoneNumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("No token found");
      const res = await api.get("users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.user);
      setForm({
        name: res.data.user.name,
        phoneNumber: res.data.user.phoneNumber,
      });
    } catch (err: any) {
      console.log("Profile fetch error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to load profile");
    }
    setLoading(false);
  };

  // Fetch rewards
  const fetchRewards = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRewards: Reward[] = [
        {
          id: "1",
          title: "Eco Warrior",
          description: "Recycle 5kg of e-waste",
          pointsRequired: 500,
          weightRequired: 5,
          claimed: false,
          claimable: true,
        },
        {
          id: "2",
          title: "Planet Saver",
          description: "Recycle 10kg of e-waste",
          pointsRequired: 1000,
          weightRequired: 10,
          claimed: false,
          claimable: true,
        },
        {
          id: "3",
          title: "Green Champion",
          description: "Recycle 20kg of e-waste",
          pointsRequired: 2000,
          weightRequired: 20,
          claimed: true,
          claimable: false,
        },
      ];
      setRewards(mockRewards);
      
      // Actual API implementation would look like:
      /*
      const token = await AsyncStorage.getItem("userToken");
      const res = await api.get("users/rewards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRewards(res.data.rewards);
      */
    } catch (err: any) {
      console.log("Rewards fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRewards();
  }, [userId]);

  // Save profile changes
  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Name cannot be empty");
      return;
    }
    if (!/^\d{10}$/.test(form.phoneNumber)) {
      Alert.alert("Validation", "Enter a valid 10-digit phone number");
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await api.put(
        "user/profile",
        { name: form.name, phoneNumber: form.phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data.user);
      setEditMode(false);
      Alert.alert("Success", "Profile updated!");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update profile");
    }
    setSaving(false);
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  // Claim reward
  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the reward status
      setRewards(prev => prev.map(reward => 
        reward.id === rewardId ? { ...reward, claimed: true, claimable: false } : reward
      ));
      
      // Show success animation
      setShowSuccessAnimation(true);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccessAnimation(false);
        scaleAnim.setValue(0.8);
      });
      
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      Alert.alert("Error", "Failed to claim reward. Please try again.");
    }
    setClaimingReward(null);
  };

  return (
    <ScrollView className="flex-1 bg-green-50" contentContainerStyle={{ padding: 20 }}>
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <Animated.View 
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
          className="absolute inset-0 bg-black/70 z-50 items-center justify-center"
        >
          <View className="bg-white rounded-2xl p-6 items-center mx-5">
            <View className="bg-green-100 p-4 rounded-full mb-4">
              <Check size={40} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-green-800 mb-2">Reward Claimed!</Text>
            <Text className="text-green-700 text-center mb-4">
              Your reward will be transferred to your bank account in 2-3 working days
            </Text>
            <Sparkles size={24} color="#F59E0B" />
          </View>
        </Animated.View>
      )}

      {/* Header with nature-inspired background */}
      <View className="bg-green-600 rounded-b-3xl p-6 mb-6 shadow-lg">
        <View className="items-center">
          <View className="bg-white/20 p-5 rounded-full mb-4">
            <User size={40} color="white" />
          </View>
          <Text className="text-2xl font-bold text-white mb-2">My Eco Profile</Text>
          <Text className="text-green-100 text-center">
            Manage your account and track your environmental impact
          </Text>
        </View>
      </View>

      {/* Profile Card */}
      <View className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-green-100">
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-green-700 mt-2">Loading your eco profile...</Text>
          </View>
        ) : profile ? (
          <>
            {/* Name */}
            <View className="mb-5 pb-4 border-b border-green-100">
              <View className="flex-row items-center mb-2">
                <User size={18} color="#059669" />
                <Text className="text-green-800 font-semibold ml-2">Full Name</Text>
              </View>
              {editMode ? (
                <TextInput
                  className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-900"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  placeholder="Enter your name"
                />
              ) : (
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-medium text-green-900">{profile.name}</Text>
                  {profile.isVerified && (
                    <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                      <ShieldCheck size={16} color="#059669" />
                      <Text className="text-green-700 text-xs ml-1">Verified</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Email */}
            <View className="mb-5 pb-4 border-b border-green-100">
              <View className="flex-row items-center mb-2">
                <Mail size={18} color="#059669" />
                <Text className="text-green-800 font-semibold ml-2">Email</Text>
              </View>
              <Text className="text-green-900">{profile.email}</Text>
            </View>

            {/* Phone */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Phone size={18} color="#059669" />
                <Text className="text-green-800 font-semibold ml-2">Phone Number</Text>
              </View>
              {editMode ? (
                <TextInput
                  className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-900"
                  value={form.phoneNumber}
                  onChangeText={(text) =>
                    setForm({ ...form, phoneNumber: text.replace(/\D/g, "").slice(0, 10) })
                  }
                  keyboardType="phone-pad"
                  placeholder="Enter 10-digit phone number"
                />
              ) : (
                <Text className="text-green-900">{profile.phoneNumber}</Text>
              )}
            </View>

            {/* Edit/Save Buttons */}
            <View className="flex-row justify-between mt-4">
              {editMode ? (
                <TouchableOpacity
                  className="flex-row items-center px-6 py-3 bg-green-600 rounded-xl shadow-lg flex-1 mr-3"
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 size={18} color="#fff" className="mr-2" />
                  ) : (
                    <Save size={18} color="#fff" className="mr-2" />
                  )}
                  <Text className="text-white font-semibold">Save Changes</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="flex-row items-center px-6 py-3 bg-green-600 rounded-xl shadow-lg flex-1 mr-3"
                  onPress={() => setEditMode(true)}
                >
                  <Edit size={18} color="#fff" className="mr-2" />
                  <Text className="text-white font-semibold">Edit Profile</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="flex-row items-center px-4 py-3 bg-red-50 rounded-xl shadow-lg border border-red-200"
                onPress={handleLogout}
              >
                <LogOut size={18} color="#ef4444" className="mr-2" />
                <Text className="text-red-700 font-semibold">Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View className="items-center py-8">
            <Text className="text-red-500 mb-4">Profile not found.</Text>
            <TouchableOpacity 
              className="bg-green-600 rounded-xl px-4 py-2"
              onPress={fetchProfile}
            >
              <Text className="text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Rewards Section */}
      <View className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-green-100">
        <View className="flex-row items-center mb-4">
          <Gift size={20} color="#059669" />
          <Text className="text-green-800 font-bold text-lg ml-2">Your Rewards</Text>
        </View>
        
        <Text className="text-green-700 mb-4">
          Earn rewards by recycling e-waste and contributing to a greener planet!
        </Text>
        
        {rewards.length > 0 ? (
          rewards.map((reward) => (
            <View 
              key={reward.id} 
              className={`p-4 rounded-xl mb-3 border ${
                reward.claimed 
                  ? "bg-green-50 border-green-200" 
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-bold text-green-900 text-lg">{reward.title}</Text>
                <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                  <Coins size={14} color="#059669" />
                  <Text className="text-green-700 text-xs ml-1">{reward.pointsRequired} pts</Text>
                </View>
              </View>
              
              <Text className="text-green-800 mb-3">{reward.description}</Text>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-green-700 text-sm">
                  Recycle {reward.weightRequired}kg to earn
                </Text>
                
                {reward.claimed ? (
                  <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-full">
                    <Check size={14} color="#059669" />
                    <Text className="text-green-700 text-xs ml-1">Claimed</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-full flex-row items-center ${
                      reward.claimable ? "bg-amber-500" : "bg-gray-300"
                    }`}
                    onPress={() => handleClaimReward(reward.id)}
                    disabled={!reward.claimable || claimingReward === reward.id}
                  >
                    {claimingReward === reward.id ? (
                      <ActivityIndicator size="small" color="#fff" className="mr-1" />
                    ) : (
                      <Gift size={14} color="#fff" className="mr-1" />
                    )}
                    <Text className="text-white text-xs font-semibold">
                      {claimingReward === reward.id ? "Claiming..." : "Claim Reward"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <View className="items-center py-4">
            <Text className="text-green-700">No rewards available yet. Start recycling to earn rewards!</Text>
          </View>
        )}
      </View>

      {/* Eco Stats Card */}
      <View className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-green-100">
        <View className="flex-row items-center mb-4">
          <Leaf size={20} color="#059669" />
          <Text className="text-green-800 font-bold text-lg ml-2">Your Eco Impact</Text>
        </View>
        
        <View className="flex-row justify-between mb-4">
          <View className="items-center flex-1">
            <View className="bg-green-100 p-3 rounded-full mb-2">
              <Text className="text-green-700 font-bold text-xl">5</Text>
            </View>
            <Text className="text-green-700 text-xs text-center">Devices Recycled</Text>
          </View>
          
          <View className="items-center flex-1">
            <View className="bg-green-100 p-3 rounded-full mb-2">
              <Text className="text-green-700 font-bold text-xl">12.5</Text>
            </View>
            <Text className="text-green-700 text-xs text-center">KG Waste Saved</Text>
          </View>
          
          <View className="items-center flex-1">
            <View className="bg-green-100 p-3 rounded-full mb-2">
              <Text className="text-green-700 font-bold text-xl">3</Text>
            </View>
            <Text className="text-green-700 text-xs text-center">Trees Saved</Text>
          </View>
        </View>
        
        <View className="bg-green-50 rounded-xl p-3">
          <Text className="text-green-700 text-sm text-center">
            🌱 You've prevented approximately 12.5 kg of e-waste from landfills
          </Text>
        </View>
      </View>

      {/* Eco Tips Card */}
      <View className="bg-green-600 rounded-2xl p-5 shadow-lg">
        <View className="flex-row items-center mb-3">
          <Leaf size={20} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Eco-Friendly Tips</Text>
        </View>
        
        <View className="mb-3">
          <View className="flex-row items-start mb-2">
            <View className="bg-white/20 rounded-full w-5 h-5 items-center justify-center mt-1 mr-2">
              <Text className="text-white text-xs">1</Text>
            </View>
            <Text className="text-green-100 flex-1">
              Keep your profile updated to receive personalized recycling tips and reminders
            </Text>
          </View>
          
          <View className="flex-row items-start mb-2">
            <View className="bg-white/20 rounded-full w-5 h-5 items-center justify-center mt-1 mr-2">
              <Text className="text-white text-xs">2</Text>
            </View>
            <Text className="text-green-100 flex-1">
              Schedule regular pickups to maximize your environmental impact
            </Text>
          </View>
          
          <View className="flex-row items-start">
            <View className="bg-white/20 rounded-full w-5 h-5 items-center justify-center mt-1 mr-2">
              <Text className="text-white text-xs">3</Text>
            </View>
            <Text className="text-green-100 flex-1">
              Share your achievements to inspire friends to join the green movement
            </Text>
          </View>
        </View>
        
        <TouchableOpacity className="bg-white rounded-xl p-3 items-center mt-2">
          <Text className="text-green-700 font-semibold">Share Your Impact</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}