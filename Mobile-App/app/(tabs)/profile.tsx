import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  Edit,
  Save,
  LogOut,
  Loader2,
  Leaf,
  ShieldCheck,
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

export default function Profile() {
  const { userId, logout } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", phoneNumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchProfile();
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

  return (
    <ScrollView className="flex-1 bg-green-50" contentContainerStyle={{ padding: 20 }}>
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