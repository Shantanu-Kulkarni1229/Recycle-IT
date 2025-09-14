import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
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
    <ScrollView className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-green-50" contentContainerStyle={{ padding: 20 }}>
      <View className="items-center mb-6">
        <View className="bg-emerald-100 p-4 rounded-full mb-2">
          <User size={40} color="#059669" />
        </View>
        <Text className="text-2xl font-bold text-emerald-800 mb-1">My Profile</Text>
        <Text className="text-gray-600 text-center">
          Manage your account and help us keep the planet green!
        </Text>
      </View>
      <View className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-emerald-100">
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : profile ? (
          <>
            {/* Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-1">Full Name</Text>
              {editMode ? (
                <TextInput
                  className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-lg font-medium text-gray-800">{profile.name}</Text>
                  {profile.isVerified && (
                    <ShieldCheck size={18} color="#059669" className="ml-2" />
                  )}
                </View>
              )}
            </View>
            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-1">Email</Text>
              <View className="flex-row items-center">
                <Mail size={18} color="#059669" />
                <Text className="ml-2 text-gray-800">{profile.email}</Text>
              </View>
            </View>
            {/* Phone */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-1">Phone Number</Text>
              {editMode ? (
                <TextInput
                  className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3"
                  value={form.phoneNumber}
                  onChangeText={(text) =>
                    setForm({ ...form, phoneNumber: text.replace(/\D/g, "").slice(0, 10) })
                  }
                  keyboardType="phone-pad"
                />
              ) : (
                <View className="flex-row items-center">
                  <Phone size={18} color="#059669" />
                  <Text className="ml-2 text-gray-800">{profile.phoneNumber}</Text>
                </View>
              )}
            </View>
            {/* Verified */}
            <View className="mb-4 flex-row items-center">
              <CheckCircle size={18} color={profile.isVerified ? "#059669" : "#f59e42"} />
              <Text className={`ml-2 font-medium ${profile.isVerified ? "text-emerald-700" : "text-yellow-700"}`}>
                {profile.isVerified ? "Email Verified" : "Email Not Verified"}
              </Text>
            </View>
            {/* Edit/Save Buttons */}
            <View className="flex-row justify-between mt-4">
              {editMode ? (
                <TouchableOpacity
                  className="flex-row items-center px-6 py-3 bg-emerald-600 rounded-xl shadow-lg"
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 size={18} color="#fff" className="mr-2" />
                  ) : (
                    <Save size={18} color="#fff" className="mr-2" />
                  )}
                  <Text className="text-white font-semibold">Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="flex-row items-center px-6 py-3 bg-emerald-600 rounded-xl shadow-lg"
                  onPress={() => setEditMode(true)}
                >
                  <Edit size={18} color="#fff" className="mr-2" />
                  <Text className="text-white font-semibold">Edit</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="flex-row items-center px-6 py-3 bg-red-100 rounded-xl shadow-lg"
                onPress={handleLogout}
              >
                <LogOut size={18} color="#ef4444" className="mr-2" />
                <Text className="text-red-700 font-semibold">Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text className="text-red-500">Profile not found.</Text>
        )}
      </View>
      <View className="bg-green-50 rounded-xl p-4 border border-green-200 flex-row items-start">
        <Leaf size={18} color="#059669" />
        <View className="ml-2 flex-1">
          <Text className="font-semibold text-green-800 mb-1">Eco-Friendly Tip</Text>
          <Text className="text-green-700 text-sm">
            Keep your profile updated so we can serve you better and send you timely pickup reminders. Thank you for recycling responsibly!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}