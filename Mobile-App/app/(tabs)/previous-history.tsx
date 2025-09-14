import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { useUser } from "@/context/UserContext";
import api from "../../api/api";
import {
  Truck,
  Calendar,
  Trash2,
  Eye,
  XCircle,
  MapPin,
  Loader2,
  Info,
  CheckCircle,
  ArrowLeft,
  Clock,
  Package,
  Smartphone,
} from "lucide-react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Pickup = {
  _id: string;
  deviceType: string;
  brand: string;
  model: string;
  condition: string;
  pickupStatus: string;
  pickupAddress: string;
  city: string;
  state: string;
  pincode: string;
  preferredPickupDate: string;
  createdAt: string;
  notes?: string;
};

const statusColors: Record<string, { bg: string; text: string; card: string }> = {
  Pending: { 
    bg: "bg-amber-100", 
    text: "text-amber-800",
    card: "bg-amber-50"
  },
  Scheduled: { 
    bg: "bg-blue-100", 
    text: "text-blue-800",
    card: "bg-blue-50"
  },
  "In Transit": { 
    bg: "bg-purple-100", 
    text: "text-purple-800",
    card: "bg-purple-50"
  },
  Collected: { 
    bg: "bg-emerald-100", 
    text: "text-emerald-800",
    card: "bg-emerald-50"
  },
  Delivered: { 
    bg: "bg-green-100", 
    text: "text-green-800",
    card: "bg-green-50"
  },
  Verified: { 
    bg: "bg-teal-100", 
    text: "text-teal-800",
    card: "bg-teal-50"
  },
  Cancelled: { 
    bg: "bg-red-100", 
    text: "text-red-800",
    card: "bg-red-50"
  },
};

const getDeviceIcon = (deviceType: string) => {
  const type = deviceType.toLowerCase();
  if (type.includes('phone') || type.includes('mobile')) return Smartphone;
  if (type.includes('laptop') || type.includes('computer')) return Package;
  return Package;
};

export default function PreviousHistory() {
  const { userId } = useUser();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state for details/track
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPickup, setModalPickup] = useState<Pickup | null>(null);
  const [trackInfo, setTrackInfo] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const modalSlideAnim = useState(new Animated.Value(screenHeight))[0];

  // Fetch pickups
  const fetchPickups = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`schedule-pickup/user/${userId}`);
      setPickups(res.data.data || []);
      
      // Animate cards in
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
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch history");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPickups();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPickups();
    setRefreshing(false);
  };

  // Animate button press
  const animateButtonPress = (callback: () => void) => {
    const buttonScale = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => callback());
  };

  // Cancel pickup
  const cancelPickup = async (pickupId: string) => {
    Alert.alert(
      "Cancel Pickup",
      "Are you sure you want to cancel this pickup?",
      [
        { text: "No" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await api.put(`schedule-pickup/${pickupId}/cancel`);
              Alert.alert("Cancelled", "Pickup cancelled successfully.");
              fetchPickups();
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message || "Failed to cancel pickup");
            }
          },
        },
      ]
    );
  };

  // Delete pickup
  const deletePickup = async (pickupId: string) => {
    Alert.alert(
      "Delete Pickup",
      "Are you sure you want to delete this pickup? This cannot be undone.",
      [
        { text: "No" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`schedule-pickup/${pickupId}`);
              Alert.alert("Deleted", "Pickup deleted successfully.");
              fetchPickups();
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message || "Failed to delete pickup");
            }
          },
        },
      ]
    );
  };

  // View details with animation
  const viewDetails = async (pickupId: string) => {
    setModalVisible(true);
    setModalPickup(null);
    
    // Animate modal in
    Animated.spring(modalSlideAnim, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();

    try {
      const res = await api.get(`schedule-pickup/${pickupId}`);
      setModalPickup(res.data.data);
    } catch (err: any) {
      setModalPickup(null);
      Alert.alert("Error", err.response?.data?.message || "Failed to fetch details");
    }
  };

  // Track pickup
  const trackPickup = async (pickupId: string) => {
    setTrackLoading(true);
    setTrackInfo(null);
    setModalVisible(true);
    
    // Animate modal in
    Animated.spring(modalSlideAnim, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();

    try {
      const res = await api.get(`schedule-pickup/${pickupId}/track`);
      setTrackInfo(res.data.data);
    } catch (err: any) {
      setTrackInfo(null);
      Alert.alert("Error", err.response?.data?.message || "Failed to track pickup");
    }
    setTrackLoading(false);
  };

  const closeModal = () => {
    Animated.timing(modalSlideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setModalPickup(null);
      setTrackInfo(null);
      modalSlideAnim.setValue(screenHeight);
    });
  };

  const renderPickupCard = (pickup: Pickup, index: number) => {
    const DeviceIcon = getDeviceIcon(pickup.deviceType);
    const statusStyle = statusColors[pickup.pickupStatus] || statusColors.Pending;

    return (
      <Animated.View
        key={pickup._id}
        style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        }}
        className="mb-4"
      >
        <View className={`${statusStyle.card} rounded-3xl shadow-lg overflow-hidden border border-gray-100`}>
          {/* Status header */}
          <View className={`${statusStyle.bg} px-6 py-4`}>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="bg-white/80 rounded-full p-2 mr-3">
                  <DeviceIcon size={20} className={statusStyle.text} />
                </View>
                <Text className={`font-bold text-lg ${statusStyle.text}`}>
                  {pickup.deviceType?.toUpperCase() || "Device"}
                </Text>
              </View>
              <View className="bg-white/90 px-3 py-1 rounded-full">
                <Text className={`text-xs font-semibold ${statusStyle.text}`}>
                  {pickup.pickupStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Card content */}
          <View className="px-6 py-5">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Package size={16} color="#6B7280" />
                  <Text className="text-gray-700 ml-2 font-medium">
                    {pickup.brand} {pickup.model}
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Info size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-2">
                    Condition: {pickup.condition}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
              <View className="flex-row items-center mb-2">
                <Calendar size={16} color="#059669" />
                <Text className="text-gray-700 ml-2 font-medium">
                  {pickup.preferredPickupDate
                    ? new Date(pickup.preferredPickupDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : "Date not set"}
                </Text>
              </View>
              <View className="flex-row items-start">
                <MapPin size={16} color="#059669" />
                <Text className="text-gray-600 ml-2 flex-1" numberOfLines={2}>
                  {pickup.pickupAddress}, {pickup.city}, {pickup.state} - {pickup.pincode}
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity
                className="flex-row items-center px-4 py-2 bg-blue-500 rounded-xl shadow-sm"
                onPress={() => animateButtonPress(() => viewDetails(pickup._id))}
                activeOpacity={0.8}
              >
                <Eye size={16} color="white" />
                <Text className="ml-2 text-white text-sm font-medium">Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row items-center px-4 py-2 bg-purple-500 rounded-xl shadow-sm"
                onPress={() => animateButtonPress(() => trackPickup(pickup._id))}
                activeOpacity={0.8}
              >
                <Truck size={16} color="white" />
                <Text className="ml-2 text-white text-sm font-medium">Track</Text>
              </TouchableOpacity>

              {pickup.pickupStatus === "Pending" && (
                <TouchableOpacity
                  className="flex-row items-center px-4 py-2 bg-amber-500 rounded-xl shadow-sm"
                  onPress={() => animateButtonPress(() => cancelPickup(pickup._id))}
                  activeOpacity={0.8}
                >
                  <XCircle size={16} color="white" />
                  <Text className="ml-2 text-white text-sm font-medium">Cancel</Text>
                </TouchableOpacity>
              )}

              {["Pending", "Cancelled"].includes(pickup.pickupStatus) && (
                <TouchableOpacity
                  className="flex-row items-center px-4 py-2 bg-red-500 rounded-xl shadow-sm"
                  onPress={() => animateButtonPress(() => deletePickup(pickup._id))}
                  activeOpacity={0.8}
                >
                  <Trash2 size={16} color="white" />
                  <Text className="ml-2 text-white text-sm font-medium">Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Enhanced Header */}
      <View className="pt-12 pb-6 bg-emerald-500">
        <View className="px-6">
          <View className="flex-row items-center mb-2">
            <View className="bg-white/20 rounded-full p-3 mr-4">
              <Clock size={24} color="white" />
            </View>
            <View>
              <Text className="text-3xl font-bold text-white mb-1">Pickup History</Text>
              <Text className="text-emerald-100 text-base">
                Track your e-waste journey
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-3xl p-8 shadow-lg">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-gray-600 mt-4 text-center">Loading your pickups...</Text>
          </View>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
            <View className="bg-red-100 rounded-full p-4 mb-4">
              <XCircle size={32} color="#EF4444" />
            </View>
            <Text className="text-red-600 text-center text-lg font-medium">{error}</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#059669']}
              tintColor="#059669"
            />
          }
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {pickups.length === 0 ? (
            <Animated.View 
              style={{ opacity: fadeAnim }}
              className="items-center mt-20"
            >
              <View className="bg-white rounded-3xl p-12 shadow-lg items-center">
                <View className="bg-emerald-100 rounded-full p-6 mb-6">
                  <Package size={48} color="#059669" />
                </View>
                <Text className="text-xl font-semibold text-gray-800 mb-2">No pickups yet</Text>
                <Text className="text-gray-500 text-center text-base leading-6">
                  When you schedule pickups, they'll appear here for easy tracking
                </Text>
              </View>
            </Animated.View>
          ) : (
            pickups.map((pickup, index) => renderPickupCard(pickup, index))
          )}
        </ScrollView>
      )}

      {/* Enhanced Modal */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black/50">
          <Animated.View
            style={{
              transform: [{ translateY: modalSlideAnim }],
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            <View className="bg-white rounded-t-3xl max-h-[85%] shadow-2xl">
              {/* Modal header */}
              <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-800">
                  {trackInfo ? "Pickup Tracking" : "Pickup Details"}
                </Text>
                <TouchableOpacity
                  onPress={closeModal}
                  className="bg-gray-100 rounded-full p-2"
                  activeOpacity={0.7}
                >
                  <XCircle size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
                {modalPickup && (
                  <View className="space-y-4">
                    <View className="bg-gray-50 rounded-2xl p-4">
                      <Text className="text-lg font-semibold text-gray-800 mb-3">Device Information</Text>
                      <View className="space-y-2">
                        <View className="flex-row">
                          <Text className="font-medium text-gray-600 w-20">Device:</Text>
                          <Text className="text-gray-800 flex-1">{modalPickup.deviceType}</Text>
                        </View>
                        <View className="flex-row">
                          <Text className="font-medium text-gray-600 w-20">Brand:</Text>
                          <Text className="text-gray-800 flex-1">{modalPickup.brand}</Text>
                        </View>
                        <View className="flex-row">
                          <Text className="font-medium text-gray-600 w-20">Model:</Text>
                          <Text className="text-gray-800 flex-1">{modalPickup.model}</Text>
                        </View>
                        <View className="flex-row">
                          <Text className="font-medium text-gray-600 w-20">Condition:</Text>
                          <Text className="text-gray-800 flex-1">{modalPickup.condition}</Text>
                        </View>
                      </View>
                    </View>

                    <View className="bg-blue-50 rounded-2xl p-4">
                      <Text className="text-lg font-semibold text-gray-800 mb-3">Pickup Information</Text>
                      <View className="space-y-2">
                        <View className="flex-row">
                          <Text className="font-medium text-gray-600 w-20">Status:</Text>
                          <View className={`px-3 py-1 rounded-full ${statusColors[modalPickup.pickupStatus]?.bg || 'bg-gray-100'}`}>
                            <Text className={`text-xs font-semibold ${statusColors[modalPickup.pickupStatus]?.text || 'text-gray-700'}`}>
                              {modalPickup.pickupStatus}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row">
                          <Text className="font-medium text-gray-600 w-20">Date:</Text>
                          <Text className="text-gray-800 flex-1">
                            {modalPickup.preferredPickupDate
                              ? new Date(modalPickup.preferredPickupDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : "Not set"}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text className="font-medium text-gray-600 w-20">Address:</Text>
                          <Text className="text-gray-800 flex-1">
                            {modalPickup.pickupAddress}, {modalPickup.city}, {modalPickup.state} - {modalPickup.pincode}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {modalPickup.notes && (
                      <View className="bg-amber-50 rounded-2xl p-4">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">Notes</Text>
                        <Text className="text-gray-700">{modalPickup.notes}</Text>
                      </View>
                    )}
                  </View>
                )}

                {trackLoading ? (
                  <View className="flex-row items-center justify-center py-8">
                    <ActivityIndicator size="small" color="#059669" />
                    <Text className="text-emerald-700 ml-2">Fetching tracking info...</Text>
                  </View>
                ) : trackInfo ? (
                  <View className="bg-emerald-50 rounded-2xl p-4">
                    <Text className="text-lg font-semibold text-emerald-800 mb-3">Tracking Information</Text>
                    <View className="space-y-2">
                      <View className="flex-row">
                        <Text className="font-medium text-emerald-600 w-24">Status:</Text>
                        <Text className="text-emerald-800 flex-1">{trackInfo.status}</Text>
                      </View>
                      {trackInfo.recycler && (
                        <View className="flex-row">
                          <Text className="font-medium text-emerald-600 w-24">Recycler:</Text>
                          <Text className="text-emerald-800 flex-1">{trackInfo.recycler.name}</Text>
                        </View>
                      )}
                      {trackInfo.agent && (
                        <View className="flex-row">
                          <Text className="font-medium text-emerald-600 w-24">Agent:</Text>
                          <Text className="text-emerald-800 flex-1">{trackInfo.agent.name}</Text>
                        </View>
                      )}
                      {trackInfo.estimatedPickupDate && (
                        <View className="flex-row">
                          <Text className="font-medium text-emerald-600 w-24">Est. Pickup:</Text>
                          <Text className="text-emerald-800 flex-1">
                            {new Date(trackInfo.estimatedPickupDate).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                      {trackInfo.address && (
                        <View className="flex-row">
                          <Text className="font-medium text-emerald-600 w-24">Address:</Text>
                          <Text className="text-emerald-800 flex-1">{trackInfo.address}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : null}
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}