import React, { useEffect, useState, useCallback } from "react";
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
  TextInput,
  Linking,
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
  Info,
  Clock,
  Package,
  Smartphone,
  Star,
  Phone,
  Mail,
  Globe,
} from "lucide-react-native";

const { height: screenHeight } = Dimensions.get('window');

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
  weight?: string;
  userId?: string;
  assignedRecyclerId?: string | { name: string; [key: string]: any };
};

// Map backend status to user-friendly label and color
const statusMap: Record<string, { label: string; bg: string; text: string; card: string }> = {
  Pending: {
    label: 'Pending',
    bg: 'bg-red-100',
    text: 'text-red-800',
    card: 'bg-red-50',
  },
  Scheduled: {
    label: 'Approved',
    bg: 'bg-green-100',
    text: 'text-green-800',
    card: 'bg-green-50',
  },
  'In Transit': {
    label: 'In Transit',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    card: 'bg-blue-50',
  },
  Collected: {
    label: 'Collected',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    card: 'bg-emerald-50',
  },
  Delivered: {
    label: 'Delivered',
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    card: 'bg-teal-50',
  },
  Verified: {
    label: 'Verified',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    card: 'bg-purple-50',
  },
  Cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-100',
    text: 'text-red-800',
    card: 'bg-red-50',
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
  const [modalType, setModalType] = useState<'details' | 'track' | 'testimonial'>('details');
  const [modalLoading, setModalLoading] = useState(false);

  // Testimonial modal state
  const [testimonialRating, setTestimonialRating] = useState(0);
  const [testimonialFeedback, setTestimonialFeedback] = useState('');
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);

  // Recycler data cache
  const [recyclerCache, setRecyclerCache] = useState<Record<string, { 
    name: string; 
    companyName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    servicesOffered?: string[];
    operatingHours?: string;
    website?: string;
    description?: string;
  }>>({});
  const [fetchingRecyclers, setFetchingRecyclers] = useState<Set<string>>(new Set());

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  // Fetch recycler details by ID
  const fetchRecyclerById = useCallback(async (recyclerId: string) => {
    // Check if already cached
    if (recyclerCache[recyclerId]) {
      return recyclerCache[recyclerId];
    }

    // Check if already fetching to avoid duplicate requests
    if (fetchingRecyclers.has(recyclerId)) {
      return null;
    }

    try {
      setFetchingRecyclers(prev => new Set(prev).add(recyclerId));
      
      console.log("Fetching recycler details for ID:", recyclerId);
      const response = await api.get(`users/recyclers/${recyclerId}`);
      
      const recyclerData = response.data.data || response.data;
      const recyclerInfo = {
        name: recyclerData.ownerName || recyclerData.name || 'Unknown Recycler',
        companyName: recyclerData.companyName,
        email: recyclerData.email,
        phoneNumber: recyclerData.phoneNumber,
        address: recyclerData.address,
        city: recyclerData.city,
        state: recyclerData.state,
        pincode: recyclerData.pincode,
        servicesOffered: recyclerData.servicesOffered,
        operatingHours: recyclerData.operatingHours,
        website: recyclerData.website,
        description: recyclerData.description
      };
      
      // Cache the result
      setRecyclerCache(prev => ({
        ...prev,
        [recyclerId]: recyclerInfo
      }));
      
      console.log("Cached recycler info:", recyclerInfo);
      return recyclerInfo;
    } catch (err: any) {
      console.error("Error fetching recycler:", err);
      // Cache a default value to avoid repeated failed requests
      const defaultInfo = { name: 'Unknown Recycler' };
      setRecyclerCache(prev => ({
        ...prev,
        [recyclerId]: defaultInfo
      }));
      return defaultInfo;
    } finally {
      setFetchingRecyclers(prev => {
        const newSet = new Set(prev);
        newSet.delete(recyclerId);
        return newSet;
      });
    }
  }, [recyclerCache, fetchingRecyclers, setRecyclerCache, setFetchingRecyclers]);

  // Get recycler display name
  const getRecyclerDisplayName = useCallback((assignedRecyclerId: string | { name: string; [key: string]: any } | undefined) => {
    if (!assignedRecyclerId) {
      return 'No recycler assigned';
    }

    // If it's already an object with name
    if (typeof assignedRecyclerId === 'object' && assignedRecyclerId.name) {
      return assignedRecyclerId.name;
    }

    // If it's a string ID, check cache first
    if (typeof assignedRecyclerId === 'string') {
      const cachedRecycler = recyclerCache[assignedRecyclerId];
      if (cachedRecycler) {
        // Show company name if available, followed by owner name in parentheses
        if (cachedRecycler.companyName && cachedRecycler.name !== cachedRecycler.companyName) {
          return `${cachedRecycler.companyName} (${cachedRecycler.name})`;
        }
        return cachedRecycler.companyName || cachedRecycler.name;
      }
      
      // Trigger fetch (async) and return loading state
      fetchRecyclerById(assignedRecyclerId);
      return 'Loading recycler...';
    }

    return 'Unknown recycler';
  }, [recyclerCache, fetchRecyclerById]);

  // Fetch pickups
  const fetchPickups = useCallback(async () => {
    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching pickups for user:", userId);
      const res = await api.get(`schedule-pickup/user/${userId}`);
      console.log("Pickups response:", res.data);
      
      const pickupsData = res.data.data || res.data || [];
      setPickups(pickupsData);
      
      // Prefetch recycler data for pickups with string IDs
      const recyclerIds = pickupsData
        .map((pickup: Pickup) => pickup.assignedRecyclerId)
        .filter((id: any) => typeof id === 'string' && id.length > 0)
        .filter((id: string, index: number, arr: string[]) => arr.indexOf(id) === index); // Remove duplicates
      
      // Fetch recycler data for all unique IDs
      recyclerIds.forEach((recyclerId: string) => {
        if (!recyclerCache[recyclerId]) {
          fetchRecyclerById(recyclerId);
        }
      });
      
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
      console.error("Error fetching pickups:", err);
      setError(err.response?.data?.message || "Failed to fetch history");
    }
    setLoading(false);
  }, [userId, fadeAnim, slideAnim, scaleAnim, recyclerCache, fetchRecyclerById]);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPickups();
    setRefreshing(false);
  };

  // ✅ Fixed Cancel pickup function
  const cancelPickup = async (pickupId: string) => {
    console.log("Attempting to cancel pickup:", pickupId);
    
    Alert.alert(
      "Cancel Pickup",
      "Are you sure you want to cancel this pickup?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Cancelling pickup with ID:", pickupId);
              
              // Try different API endpoints that might exist
              let response;
              try {
                response = await api.put(`schedule-pickup/${pickupId}/cancel`);
              } catch (err: any) {
                if (err.response?.status === 404) {
                  // Try alternative endpoint
                  response = await api.patch(`schedule-pickup/${pickupId}`, { 
                    pickupStatus: 'Cancelled' 
                  });
                } else {
                  throw err;
                }
              }
              
              console.log("Cancel response:", response.data);
              Alert.alert("Success", "Pickup cancelled successfully.");
              await fetchPickups(); // Refresh the list
            } catch (err: any) {
              console.error("Cancel pickup error:", err.response?.data || err.message);
              Alert.alert(
                "Error", 
                err.response?.data?.message || "Failed to cancel pickup. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // ✅ Fixed Delete pickup function
  const deletePickup = async (pickupId: string) => {
    console.log("Attempting to delete pickup:", pickupId);
    
    Alert.alert(
      "Delete Pickup",
      "Are you sure you want to delete this pickup? This cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting pickup with ID:", pickupId);
              const response = await api.delete(`schedule-pickup/${pickupId}`);
              console.log("Delete response:", response.data);
              
              Alert.alert("Success", "Pickup deleted successfully.");
              await fetchPickups(); // Refresh the list
            } catch (err: any) {
              console.error("Delete pickup error:", err.response?.data || err.message);
              Alert.alert(
                "Error", 
                err.response?.data?.message || "Failed to delete pickup. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // ✅ Simplified View details function
  const viewDetails = async (pickupId: string) => {
    console.log("Viewing details for pickup:", pickupId);
    
    setModalType('details');
    setModalLoading(true);
    setModalVisible(true);
    setTrackInfo(null);
    setModalPickup(null); // Reset modal pickup first

    try {
      console.log("Fetching pickup details for ID:", pickupId);
      
      // First try to find from local data (faster)
      let pickup = pickups.find(p => p._id === pickupId);
      
      if (pickup) {
        console.log("Found pickup in local data:", pickup);
        setModalPickup(pickup);
        setModalLoading(false);
      } else {
        // If not found locally, try API
        try {
          const response = await api.get(`schedule-pickup/${pickupId}`);
          pickup = response.data.data || response.data;
          console.log("Details response from API:", pickup);
          
          if (pickup) {
            setModalPickup(pickup);
          } else {
            Alert.alert("Error", "Failed to fetch pickup details");
            setModalVisible(false);
          }
        } catch (err: any) {
          console.log("API call failed:", err);
          Alert.alert("Error", "Failed to fetch pickup details");
          setModalVisible(false);
        } finally {
          setModalLoading(false);
        }
      }
    } catch (err: any) {
      console.error("View details error:", err);
      Alert.alert("Error", "Failed to fetch pickup details");
      setModalVisible(false);
      setModalLoading(false);
    }
  };

  // ✅ Simplified Track pickup function
  const trackPickup = async (pickupId: string) => {
    console.log("Tracking pickup:", pickupId);
    
    setModalType('track');
    setModalLoading(true);
    setModalVisible(true);
    setModalPickup(null);

    try {
      console.log("Fetching tracking info for ID:", pickupId);
      
      // First try to get pickup data
      let pickup;
      try {
        const response = await api.get(`schedule-pickup/${pickupId}`);
        pickup = response.data.data || response.data;
      } catch {
        pickup = pickups.find(p => p._id === pickupId);
      }

      if (pickup) {
        setModalPickup(pickup);
        
        // Try to get tracking info
        try {
          const trackResponse = await api.get(`schedule-pickup/${pickupId}/track`);
          setTrackInfo(trackResponse.data.data || trackResponse.data);
        } catch {
          // Create mock tracking info if endpoint doesn't exist
          const mockTrackInfo = {
            status: pickup.pickupStatus,
            pickupId: pickup._id,
            deviceInfo: `${pickup.brand} ${pickup.model}`,
            address: `${pickup.pickupAddress}, ${pickup.city}, ${pickup.state} - ${pickup.pincode}`,
            preferredDate: pickup.preferredPickupDate,
            createdAt: pickup.createdAt,
            progress: getProgressByStatus(pickup.pickupStatus),
            timeline: getTimelineByStatus(pickup.pickupStatus, pickup.createdAt)
          };
          setTrackInfo(mockTrackInfo);
        }
      } else {
        Alert.alert("Error", "Failed to fetch pickup data");
        setModalVisible(false);
      }
    } catch (err: any) {
      console.error("Track pickup error:", err);
      Alert.alert("Error", "Failed to track pickup");
      setModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  // Helper function to get progress percentage by status
  const getProgressByStatus = (status: string): number => {
    switch (status) {
      case 'Pending': return 10;
      case 'Scheduled': return 25;
      case 'In Transit': return 50;
      case 'Collected': return 75;
      case 'Delivered': return 90;
      case 'Verified': return 100;
      case 'Cancelled': return 0;
      default: return 10;
    }
  };

  // Helper function to get timeline by status
  const getTimelineByStatus = (status: string, createdAt: string) => {
    const baseDate = new Date(createdAt);
    const timeline = [
      {
        status: 'Pickup Requested',
        date: baseDate.toISOString(),
        completed: true
      }
    ];

    if (['Scheduled', 'In Transit', 'Collected', 'Delivered', 'Verified'].includes(status)) {
      timeline.push({
        status: 'Pickup Scheduled',
        date: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        completed: true
      });
    }

    if (['In Transit', 'Collected', 'Delivered', 'Verified'].includes(status)) {
      timeline.push({
        status: 'In Transit',
        date: new Date(baseDate.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        completed: true
      });
    }

    if (['Collected', 'Delivered', 'Verified'].includes(status)) {
      timeline.push({
        status: 'Collected',
        date: new Date(baseDate.getTime() + 72 * 60 * 60 * 1000).toISOString(),
        completed: true
      });
    }

    return timeline;
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalPickup(null);
    setTrackInfo(null);
    setModalLoading(false);
    // Reset testimonial fields
    setTestimonialRating(0);
    setTestimonialFeedback('');
    setSubmittingTestimonial(false);
  };

  // Open testimonial modal
  const openTestimonialModal = (pickup: Pickup) => {
    console.log("Opening testimonial modal for pickup:", pickup._id);
    
    // Check if pickup has an assigned recycler
    if (!pickup.assignedRecyclerId) {
      Alert.alert("Error", "No recycler assigned to this pickup");
      return;
    }
    
    setModalType('testimonial');
    setModalPickup(pickup);
    setModalVisible(true);
    setTestimonialRating(0);
    setTestimonialFeedback('');
  };

  // Submit testimonial
  const submitTestimonial = async () => {
    if (!modalPickup || !modalPickup.assignedRecyclerId || !userId) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    if (testimonialRating === 0) {
      Alert.alert("Please provide a rating", "Please select a star rating before submitting");
      return;
    }

    if (testimonialFeedback.trim().length < 10) {
      Alert.alert("Please provide feedback", "Please write at least 10 characters of feedback");
      return;
    }

    setSubmittingTestimonial(true);

    try {
      const recyclerId = typeof modalPickup.assignedRecyclerId === 'object' 
        ? modalPickup.assignedRecyclerId._id || modalPickup.assignedRecyclerId.id
        : modalPickup.assignedRecyclerId;

      const testimonialData = {
        recyclerId,
        userId,
        feedback: testimonialFeedback.trim(),
        rating: testimonialRating
      };

      console.log("Submitting testimonial:", testimonialData);
      
      const response = await api.post('testimonials', testimonialData);
      
      console.log("Testimonial submitted successfully:", response.data);
      
      Alert.alert(
        "Thank you!",
        "Your feedback has been submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => closeModal()
          }
        ]
      );
    } catch (err: any) {
      console.error("Error submitting testimonial:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to submit feedback. Please try again."
      );
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const renderPickupCard = (pickup: Pickup, index: number) => {
    const DeviceIcon = getDeviceIcon(pickup.deviceType);
  const statusStyle = statusMap[pickup.pickupStatus] || statusMap.Pending;

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
                  {statusStyle.label}
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
                {/* Assigned Recycler - show whenever recycler is assigned */}
                {pickup.assignedRecyclerId && (
                  <View className="mb-2">
                    <View className="flex-row items-center mb-1">
                      <Truck size={16} color="#059669" />
                      <Text className="text-emerald-700 ml-2 font-medium">
                        Recycler: {getRecyclerDisplayName(pickup.assignedRecyclerId)}
                      </Text>
                    </View>
                    {(() => {
                      const recyclerData = typeof pickup.assignedRecyclerId === 'object' 
                        ? pickup.assignedRecyclerId 
                        : (typeof pickup.assignedRecyclerId === 'string' 
                            ? recyclerCache[pickup.assignedRecyclerId] 
                            : null);
                      
                      if (recyclerData && (recyclerData.phoneNumber || recyclerData.email)) {
                        return (
                          <View className="ml-6">
                            {recyclerData.phoneNumber && (
                              <Text className="text-emerald-600 text-sm">
                                📞 {recyclerData.phoneNumber}
                              </Text>
                            )}
                            {recyclerData.email && (
                              <Text className="text-emerald-600 text-sm">
                                ✉️ {recyclerData.email}
                              </Text>
                            )}
                          </View>
                        );
                      }
                      return null;
                    })()}
                  </View>
                )}
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#3b82f6',
                  borderRadius: 12,
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  console.log("Details button pressed for pickup:", pickup._id);
                  viewDetails(pickup._id);
                }}
                activeOpacity={0.8}
              >
                <Eye size={16} color="white" />
                <Text style={{ marginLeft: 8, color: 'white', fontSize: 14, fontWeight: '500' }}>
                  Details
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#8b5cf6',
                  borderRadius: 12,
                  shadowColor: '#8b5cf6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  console.log("Track button pressed for pickup:", pickup._id);
                  trackPickup(pickup._id);
                }}
                activeOpacity={0.8}
              >
                <Truck size={16} color="white" />
                <Text style={{ marginLeft: 8, color: 'white', fontSize: 14, fontWeight: '500' }}>
                  Track
                </Text>
              </TouchableOpacity>

              {pickup.pickupStatus === "Pending" && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: '#f59e0b',
                    borderRadius: 12,
                    shadowColor: '#f59e0b',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={() => {
                    console.log("Cancel button pressed for pickup:", pickup._id);
                    cancelPickup(pickup._id);
                  }}
                  activeOpacity={0.8}
                >
                  <XCircle size={16} color="white" />
                  <Text style={{ marginLeft: 8, color: 'white', fontSize: 14, fontWeight: '500' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}

              {["Pending", "Cancelled"].includes(pickup.pickupStatus) && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: '#ef4444',
                    borderRadius: 12,
                    shadowColor: '#ef4444',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={() => {
                    console.log("Delete button pressed for pickup:", pickup._id);
                    deletePickup(pickup._id);
                  }}
                  activeOpacity={0.8}
                >
                  <Trash2 size={16} color="white" />
                  <Text style={{ marginLeft: 8, color: 'white', fontSize: 14, fontWeight: '500' }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}

              {/* Rate Recycler button - only show for completed pickups with assigned recycler */}
              {["Collected", "Delivered", "Verified"].includes(pickup.pickupStatus) && 
               pickup.assignedRecyclerId && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: '#f59e0b',
                    borderRadius: 12,
                    shadowColor: '#f59e0b',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={() => {
                    console.log("Rate Recycler button pressed for pickup:", pickup._id);
                    openTestimonialModal(pickup);
                  }}
                  activeOpacity={0.8}
                >
                  <Star size={16} color="white" />
                  <Text style={{ marginLeft: 8, color: 'white', fontSize: 14, fontWeight: '500' }}>
                    Rate Recycler
                  </Text>
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
            <TouchableOpacity
              onPress={fetchPickups}
              className="mt-4 bg-emerald-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
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
                  When you schedule pickups, they&apos;ll appear here for easy tracking
                </Text>
              </View>
            </Animated.View>
          ) : (
            pickups.map((pickup, index) => renderPickupCard(pickup, index))
          )}
        </ScrollView>
      )}

      {/* ✅ Simplified Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: screenHeight * 0.85,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
            flex: 1
          }}>
            {/* Modal header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 24,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6'
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#1f2937'
              }}>
                {modalType === 'track' ? "Pickup Tracking" : 
                 modalType === 'testimonial' ? "Rate Recycler" : "Pickup Details"}
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 20,
                  padding: 8
                }}
                activeOpacity={0.7}
              >
                <XCircle size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Loading state */}
              {modalLoading && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 32
                }}>
                  <ActivityIndicator size="small" color="#059669" />
                  <Text style={{ color: '#047857', marginLeft: 8 }}>
                    Loading...
                  </Text>
                </View>
              )}

              {/* Content */}
              {modalPickup && !modalLoading && (
                <View>
                  {/* Device Information */}
                  <View style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16
                  }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: 12
                    }}>
                      Device Information
                    </Text>
                    
                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '500', color: '#6b7280', width: 80 }}>Device:</Text>
                        <Text style={{ color: '#1f2937', flex: 1 }}>{modalPickup.deviceType}</Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '500', color: '#6b7280', width: 80 }}>Brand:</Text>
                        <Text style={{ color: '#1f2937', flex: 1 }}>{modalPickup.brand}</Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '500', color: '#6b7280', width: 80 }}>Model:</Text>
                        <Text style={{ color: '#1f2937', flex: 1 }}>{modalPickup.model}</Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '500', color: '#6b7280', width: 80 }}>Condition:</Text>
                        <Text style={{ color: '#1f2937', flex: 1 }}>{modalPickup.condition}</Text>
                      </View>
                      {modalPickup.weight && (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ fontWeight: '500', color: '#6b7280', width: 80 }}>Weight:</Text>
                          <Text style={{ color: '#1f2937', flex: 1 }}>{modalPickup.weight}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Recycler Information */}
                  {modalPickup.assignedRecyclerId ? (
                    <View style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor: '#bbf7d0',
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{
                          backgroundColor: '#059669',
                          borderRadius: 8,
                          padding: 8,
                          marginRight: 12
                        }}>
                          <Package size={20} color="#ffffff" />
                        </View>
                        <Text style={{
                          fontSize: 20,
                          fontWeight: '700',
                          color: '#047857',
                          flex: 1
                        }}>
                          Assigned Recycler Details
                        </Text>
                      </View>
                      
                      {(() => {
                        const recyclerData = typeof modalPickup.assignedRecyclerId === 'object' 
                          ? modalPickup.assignedRecyclerId 
                          : recyclerCache[modalPickup.assignedRecyclerId];
                        
                        if (!recyclerData) {
                          return (
                            <View style={{ 
                              flexDirection: 'row', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingVertical: 20
                            }}>
                              <ActivityIndicator size="small" color="#059669" />
                              <Text style={{ color: '#047857', marginLeft: 8, fontSize: 16 }}>
                                Loading recycler details...
                              </Text>
                            </View>
                          );
                        }

                        return (
                          <View style={{ gap: 12 }}>
                            {/* Recycler Name & Company */}
                            <View style={{
                              backgroundColor: '#ffffff',
                              borderRadius: 12,
                              padding: 16,
                              borderWidth: 1,
                              borderColor: '#d1fae5'
                            }}>
                              <Text style={{
                                fontSize: 18,
                                fontWeight: '700',
                                color: '#1f2937',
                                marginBottom: 8
                              }}>
                                {recyclerData.companyName || recyclerData.name}
                              </Text>
                              {recyclerData.companyName && recyclerData.name && (
                                <Text style={{
                                  fontSize: 14,
                                  color: '#6b7280',
                                  fontStyle: 'italic'
                                }}>
                                  Owner: {recyclerData.name}
                                </Text>
                              )}
                            </View>

                            {/* Contact Information */}
                            <View style={{
                              backgroundColor: '#ffffff',
                              borderRadius: 12,
                              padding: 16,
                              borderWidth: 1,
                              borderColor: '#d1fae5'
                            }}>
                              <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: '#047857',
                                marginBottom: 16
                              }}>
                                Contact Information
                              </Text>
                              
                              {/* Contact Action Buttons */}
                              <View style={{ gap: 10 }}>
                                {recyclerData.phoneNumber && (
                                  <TouchableOpacity
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      backgroundColor: '#059669',
                                      borderRadius: 10,
                                      padding: 12,
                                      elevation: 2,
                                      shadowColor: '#000',
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowOpacity: 0.1,
                                      shadowRadius: 4,
                                    }}
                                    onPress={() => {
                                      Linking.openURL(`tel:${recyclerData.phoneNumber}`).catch(() => {
                                        Alert.alert('Error', 'Unable to make phone call');
                                      });
                                    }}
                                    activeOpacity={0.8}
                                  >
                                    <Phone size={18} color="#ffffff" />
                                    <Text style={{
                                      color: '#ffffff',
                                      fontWeight: '600',
                                      fontSize: 15,
                                      marginLeft: 10,
                                      flex: 1
                                    }}>
                                      Call: {recyclerData.phoneNumber}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                                
                                {recyclerData.email && (
                                  <TouchableOpacity
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      backgroundColor: '#0369a1',
                                      borderRadius: 10,
                                      padding: 12,
                                      elevation: 2,
                                      shadowColor: '#000',
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowOpacity: 0.1,
                                      shadowRadius: 4,
                                    }}
                                    onPress={() => {
                                      Linking.openURL(`mailto:${recyclerData.email}`).catch(() => {
                                        Alert.alert('Error', 'Unable to open email client');
                                      });
                                    }}
                                    activeOpacity={0.8}
                                  >
                                    <Mail size={18} color="#ffffff" />
                                    <Text style={{
                                      color: '#ffffff',
                                      fontWeight: '600',
                                      fontSize: 15,
                                      marginLeft: 10,
                                      flex: 1
                                    }}>
                                      Email: {recyclerData.email}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                                
                                {recyclerData.website && (
                                  <TouchableOpacity
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      backgroundColor: '#7c3aed',
                                      borderRadius: 10,
                                      padding: 12,
                                      elevation: 2,
                                      shadowColor: '#000',
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowOpacity: 0.1,
                                      shadowRadius: 4,
                                    }}
                                    onPress={() => {
                                      let url = recyclerData.website;
                                      if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                        url = 'https://' + url;
                                      }
                                      Linking.openURL(url).catch(() => {
                                        Alert.alert('Error', 'Unable to open website');
                                      });
                                    }}
                                    activeOpacity={0.8}
                                  >
                                    <Globe size={18} color="#ffffff" />
                                    <Text style={{
                                      color: '#ffffff',
                                      fontWeight: '600',
                                      fontSize: 15,
                                      marginLeft: 10,
                                      flex: 1
                                    }}>
                                      Visit Website
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>

                            {/* Address Information */}
                            {(recyclerData.address || recyclerData.city || recyclerData.state) && (
                              <View style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#d1fae5'
                              }}>
                                <Text style={{
                                  fontSize: 16,
                                  fontWeight: '600',
                                  color: '#047857',
                                  marginBottom: 12
                                }}>
                                  Location
                                </Text>
                                <Text style={{ color: '#065f46', fontSize: 15, lineHeight: 22 }}>
                                  {[recyclerData.address, recyclerData.city, recyclerData.state, recyclerData.pincode]
                                    .filter(Boolean)
                                    .join(', ')}
                                </Text>
                              </View>
                            )}

                            {/* Operating Hours */}
                            {recyclerData.operatingHours && (
                              <View style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#d1fae5'
                              }}>
                                <Text style={{
                                  fontSize: 16,
                                  fontWeight: '600',
                                  color: '#047857',
                                  marginBottom: 8
                                }}>
                                  Operating Hours
                                </Text>
                                <Text style={{ color: '#065f46', fontSize: 15 }}>
                                  {recyclerData.operatingHours}
                                </Text>
                              </View>
                            )}

                            {/* Services Offered */}
                            {recyclerData.servicesOffered && recyclerData.servicesOffered.length > 0 && (
                              <View style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#d1fae5'
                              }}>
                                <Text style={{
                                  fontSize: 16,
                                  fontWeight: '600',
                                  color: '#047857',
                                  marginBottom: 12
                                }}>
                                  Services Offered
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                  {recyclerData.servicesOffered.map((service: string, index: number) => (
                                    <View key={index} style={{
                                      backgroundColor: '#dcfce7',
                                      borderRadius: 20,
                                      paddingHorizontal: 12,
                                      paddingVertical: 6,
                                      borderWidth: 1,
                                      borderColor: '#bbf7d0'
                                    }}>
                                      <Text style={{ color: '#047857', fontSize: 13, fontWeight: '500' }}>
                                        {service}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}

                            {/* Description */}
                            {recyclerData.description && (
                              <View style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#d1fae5'
                              }}>
                                <Text style={{
                                  fontSize: 16,
                                  fontWeight: '600',
                                  color: '#047857',
                                  marginBottom: 12
                                }}>
                                  About This Recycler
                                </Text>
                                <Text style={{ 
                                  color: '#065f46', 
                                  fontSize: 15, 
                                  lineHeight: 22,
                                  textAlign: 'justify'
                                }}>
                                  {recyclerData.description}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })()}
                    </View>
                  ) : (
                    <View style={{
                      backgroundColor: '#fef2f2',
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor: '#fecaca',
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{
                          backgroundColor: '#dc2626',
                          borderRadius: 8,
                          padding: 8,
                          marginRight: 12
                        }}>
                          <Info size={20} color="#ffffff" />
                        </View>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '700',
                          color: '#dc2626',
                          flex: 1
                        }}>
                          No Recycler Assigned
                        </Text>
                      </View>
                      <Text style={{
                        color: '#7f1d1d',
                        fontSize: 15,
                        lineHeight: 22,
                        textAlign: 'center'
                      }}>
                        Your pickup request is pending assignment to a recycler. You will be notified once a recycler accepts your request.
                      </Text>
                    </View>
                  )}

                  {/* Notes */}
                  {modalPickup.notes && (
                    <View style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16
                    }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: 12
                      }}>
                        Notes
                      </Text>
                      <Text style={{ color: '#374151' }}>{modalPickup.notes}</Text>
                    </View>
                  )}

                  {/* Tracking Information */}
                  {modalType === 'track' && trackInfo && (
                    <View style={{
                      backgroundColor: '#ecfdf5',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16
                    }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#047857',
                        marginBottom: 12
                      }}>
                        Tracking Information
                      </Text>
                      <View style={{ gap: 8 }}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ fontWeight: '500', color: '#047857', width: 96 }}>Status:</Text>
                          <Text style={{ color: '#065f46', flex: 1 }}>{trackInfo.status}</Text>
                        </View>
                        {trackInfo.progress && (
                          <View style={{ marginTop: 12 }}>
                            <Text style={{ fontWeight: '500', color: '#047857', marginBottom: 8 }}>Progress</Text>
                            <View style={{
                              backgroundColor: '#bbf7d0',
                              borderRadius: 10,
                              height: 8
                            }}>
                              <View style={{
                                backgroundColor: '#059669',
                                height: 8,
                                borderRadius: 10,
                                width: `${trackInfo.progress}%`
                              }} />
                            </View>
                            <Text style={{ color: '#047857', fontSize: 12, marginTop: 4 }}>
                              {trackInfo.progress}% Complete
                            </Text>
                          </View>
                        )}
                        {trackInfo.timeline && (
                          <View style={{ marginTop: 16 }}>
                            <Text style={{ fontWeight: '500', color: '#047857', marginBottom: 8 }}>Timeline</Text>
                            {trackInfo.timeline.map((item: any, index: number) => (
                              <View key={index} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 8
                              }}>
                                <View style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: 6,
                                  backgroundColor: item.completed ? '#059669' : '#bbf7d0',
                                  marginRight: 12
                                }} />
                                <Text style={{
                                  flex: 1,
                                  color: item.completed ? '#065f46' : '#047857'
                                }}>
                                  {item.status}
                                </Text>
                                <Text style={{ color: '#047857', fontSize: 12 }}>
                                  {new Date(item.date).toLocaleDateString()}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                        {trackInfo.message && (
                          <View style={{
                            marginTop: 12,
                            padding: 12,
                            backgroundColor: '#dcfce7',
                            borderRadius: 12
                          }}>
                            <Text style={{ fontWeight: '500', color: '#047857', marginBottom: 4 }}>Message:</Text>
                            <Text style={{ color: '#047857' }}>{trackInfo.message}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Testimonial Form */}
                  {modalType === 'testimonial' && (
                    <View>
                      {/* Recycler Information */}
                      <View style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 20
                      }}>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: 8
                        }}>
                          Rate Your Experience
                        </Text>
                        
                        {(() => {
                          const recyclerData = typeof modalPickup.assignedRecyclerId === 'object' 
                            ? modalPickup.assignedRecyclerId 
                            : (typeof modalPickup.assignedRecyclerId === 'string' 
                                ? recyclerCache[modalPickup.assignedRecyclerId] 
                                : null);
                          
                          if (!recyclerData) {
                            return (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <ActivityIndicator size="small" color="#059669" />
                                <Text style={{ color: '#6b7280', marginLeft: 8 }}>Loading recycler details...</Text>
                              </View>
                            );
                          }

                          return (
                            <View style={{ marginBottom: 12 }}>
                              <Text style={{ fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
                                Recycler Information:
                              </Text>
                              <View style={{ gap: 4 }}>
                                <Text style={{ color: '#374151' }}>
                                  <Text style={{ fontWeight: '500' }}>Name:</Text> {recyclerData.name}
                                </Text>
                                {recyclerData.companyName && (
                                  <Text style={{ color: '#374151' }}>
                                    <Text style={{ fontWeight: '500' }}>Company:</Text> {recyclerData.companyName}
                                  </Text>
                                )}
                                {recyclerData.phoneNumber && (
                                  <Text style={{ color: '#374151' }}>
                                    <Text style={{ fontWeight: '500' }}>Phone:</Text> {recyclerData.phoneNumber}
                                  </Text>
                                )}
                                {recyclerData.email && (
                                  <Text style={{ color: '#374151' }}>
                                    <Text style={{ fontWeight: '500' }}>Email:</Text> {recyclerData.email}
                                  </Text>
                                )}
                              </View>
                            </View>
                          );
                        })()}
                        
                        <Text style={{
                          color: '#6b7280',
                          fontSize: 14
                        }}>
                          Device: {modalPickup.deviceType} - {modalPickup.brand} {modalPickup.model}
                        </Text>
                      </View>

                      {/* Rating Section */}
                      <View style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: '#e5e7eb'
                      }}>
                        <Text style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: 12
                        }}>
                          Rating *
                        </Text>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          marginBottom: 8
                        }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                              key={star}
                              onPress={() => setTestimonialRating(star)}
                              style={{ marginHorizontal: 8 }}
                              activeOpacity={0.7}
                            >
                              <Star
                                size={32}
                                color={star <= testimonialRating ? "#f59e0b" : "#d1d5db"}
                                fill={star <= testimonialRating ? "#f59e0b" : "transparent"}
                              />
                            </TouchableOpacity>
                          ))}
                        </View>
                        <Text style={{
                          textAlign: 'center',
                          color: '#6b7280',
                          fontSize: 14
                        }}>
                          {testimonialRating > 0 ? `${testimonialRating} star${testimonialRating > 1 ? 's' : ''}` : 'Tap to rate'}
                        </Text>
                      </View>

                      {/* Feedback Section */}
                      <View style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 20,
                        borderWidth: 1,
                        borderColor: '#e5e7eb'
                      }}>
                        <Text style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: 12
                        }}>
                          Feedback *
                        </Text>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: '#d1d5db',
                            borderRadius: 12,
                            padding: 12,
                            height: 100,
                            textAlignVertical: 'top',
                            fontSize: 14,
                            color: '#1f2937'
                          }}
                          multiline
                          placeholder="Share your experience with this recycler..."
                          placeholderTextColor="#9ca3af"
                          value={testimonialFeedback}
                          onChangeText={setTestimonialFeedback}
                          maxLength={500}
                        />
                        <Text style={{
                          textAlign: 'right',
                          color: '#6b7280',
                          fontSize: 12,
                          marginTop: 4
                        }}>
                          {testimonialFeedback.length}/500
                        </Text>
                      </View>

                      {/* Submit Button */}
                      <TouchableOpacity
                        style={{
                          backgroundColor: submittingTestimonial ? '#9ca3af' : '#059669',
                          borderRadius: 12,
                          paddingVertical: 16,
                          paddingHorizontal: 24,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: 16
                        }}
                        onPress={submitTestimonial}
                        disabled={submittingTestimonial}
                        activeOpacity={0.8}
                      >
                        {submittingTestimonial && (
                          <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                        )}
                        <Text style={{
                          color: 'white',
                          fontSize: 16,
                          fontWeight: '600'
                        }}>
                          {submittingTestimonial ? 'Submitting...' : 'Submit Review'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}