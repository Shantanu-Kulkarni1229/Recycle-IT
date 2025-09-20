import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Dimensions, Linking, Modal, FlatList, TextInput, ScrollView } from "react-native";
import { Star, Leaf, MapPin, Info, Phone, Navigation, List, X, MessageSquare, Send } from "lucide-react-native";
import api from "../../api/api";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useUser } from "@/context/UserContext";

type Recycler = {
  id: string;
  ownerName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  servicesOffered?: string;
  operatingHours?: string;
  website?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
};

const { width, height } = Dimensions.get("window");



// Function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(1));
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

export default function RecyclersNearby() {
  const { userId } = useUser();
  
  // Rating state
  const [userRating, setUserRating] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRecycler, setReviewRecycler] = useState<Recycler | null>(null);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [selectedRecycler, setSelectedRecycler] = useState<Recycler | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Get user location
  useEffect(() => {
    (async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to show nearby recyclers.");
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      try {
        const response = await api.get("/users/recyclers");
        const backendRecyclers: Recycler[] = response.data.data;
        // Optionally, add latitude/longitude if available from backend, else skip distance
        const recyclersWithDistance = backendRecyclers.map(recycler => {
          if (recycler.latitude && recycler.longitude) {
            return {
              ...recycler,
              distance: calculateDistance(
                loc.coords.latitude,
                loc.coords.longitude,
                recycler.latitude,
                recycler.longitude
              )
            };
          }
          return recycler;
        }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setRecyclers(recyclersWithDistance);
        } catch {
        Alert.alert("Error", "Failed to fetch recyclers from server.");
      }
      setLoading(false);
    })();
  }, []);

  // Open bottom sheet with recycler details
  const openRecycler = (recycler: Recycler) => {
    setSelectedRecycler(recycler);
    setUserRating(0);
    setRatingSuccess(false);
    bottomSheetRef.current?.present();
  };
  // Submit rating (mocked, replace with API call when backend ready)
  const submitRating = async () => {
    if (!selectedRecycler || userRating < 1) {
      Alert.alert("Select a rating", "Please select a rating before submitting.");
      return;
    }
    setSubmittingRating(true);
    try {
      // TODO: Replace with real API call when backend is ready
      // await api.post(`/recyclers/${selectedRecycler.id}/rate`, { rating: userRating });
      await new Promise(res => setTimeout(res, 800));
      setRatingSuccess(true);
    } catch {
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    }
    setSubmittingRating(false);
  };

  // Open review modal
  const openReviewModal = (recycler: Recycler) => {
    if (!userId) {
      Alert.alert("Login Required", "Please login to submit a review.");
      return;
    }
    setReviewRecycler(recycler);
    setReviewRating(0);
    setReviewFeedback('');
    setShowReviewModal(true);
  };

  // Submit review to backend
  const submitReview = async () => {
    if (!reviewRecycler || !userId) {
      Alert.alert("Error", "Missing required information.");
      return;
    }

    if (reviewRating < 1) {
      Alert.alert("Rating Required", "Please select a rating before submitting.");
      return;
    }

    if (reviewFeedback.trim().length < 10) {
      Alert.alert("Feedback Required", "Please provide at least 10 characters of feedback.");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await api.post('/testimonials', {
        recyclerId: reviewRecycler.id,
        userId: userId,
        feedback: reviewFeedback.trim(),
        rating: reviewRating
      });

      if (response.data) {
        Alert.alert("Success", "Thank you for your review! Your feedback helps others make better choices.");
        setShowReviewModal(false);
        setReviewRating(0);
        setReviewFeedback('');
        setReviewRecycler(null);
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to submit review. Please try again.");
    }
    setSubmittingReview(false);
  };

  // Function to call recycler
  const callRecycler = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Function to open directions in maps
  const openDirections = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  // Map region
  const region: Region | undefined = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1 * (width / height),
      }
    : undefined;

  // Render individual recycler in list
  const renderRecyclerItem = ({ item }: { item: Recycler }) => (
    <View className="bg-white p-4 rounded-lg mb-3 shadow-sm border border-emerald-100">
      <Text className="text-lg font-bold text-emerald-800">{item.companyName}</Text>
      <Text className="text-gray-600 text-sm mt-1">{item.address}</Text>
      {item.distance !== undefined && (
        <Text className="text-emerald-600 text-sm mt-1">
          {item.distance} km away
        </Text>
      )}
      <View className="flex-row justify-between mt-3 mb-2">
        {item.phoneNumber ? (
          <TouchableOpacity 
            className="flex-row items-center bg-emerald-100 px-3 py-2 rounded-lg"
            onPress={() => callRecycler(item.phoneNumber!)}
          >
            <Phone size={16} color="#059669" />
            <Text className="ml-2 text-emerald-700 font-medium">Call</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg">
            <Phone size={16} color="#9ca3af" />
            <Text className="ml-2 text-gray-500">No phone</Text>
          </View>
        )}
        <TouchableOpacity 
          className="flex-row items-center bg-emerald-600 px-3 py-2 rounded-lg"
          onPress={() => item.latitude && item.longitude && openDirections(item.latitude, item.longitude)}
        >
          <Navigation size={16} color="#fff" />
          <Text className="ml-2 text-white font-medium">Directions</Text>
        </TouchableOpacity>
      </View>
      {/* Review Button */}
      <TouchableOpacity 
        className="flex-row items-center justify-center bg-blue-100 px-3 py-2 rounded-lg mt-2"
        onPress={() => openReviewModal(item)}
      >
        <MessageSquare size={16} color="#1d4ed8" />
        <Text className="ml-2 text-blue-700 font-medium">Write Review</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <View className="px-4 pt-8 pb-2 bg-emerald-50 border-b border-emerald-100">
          <Text className="text-2xl font-bold text-emerald-800 mb-1">Nearby Recyclers</Text>
          <Text className="text-gray-600">Find e-waste drop-off points around you</Text>
        </View>
        
        {/* List Button */}
        <TouchableOpacity 
          className="absolute top-16 right-4 z-10 bg-emerald-600 p-3 rounded-full shadow-lg"
          onPress={() => setShowListModal(true)}
        >
          <List size={24} color="#fff" />
        </TouchableOpacity>
        
        {loading || !region ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-emerald-700 mt-2">Locating you...</Text>
          </View>
        ) : (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={region}
            showsUserLocation
            showsMyLocationButton
            customMapStyle={[
              { elementType: "geometry", stylers: [{ color: "#e0f2f1" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#388e3c" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
            ]}
          >
            {/* User marker */}
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="You are here"
                pinColor="#059669"
              >
                <View className="bg-emerald-600 p-2 rounded-full border-4 border-white shadow-lg">
                  <Leaf size={22} color="#fff" />
                </View>
              </Marker>
            )}
            
            {/* Recycler markers */}
            {recyclers.filter(r => r.latitude && r.longitude).map((rec) => (
              <Marker
                key={rec.id}
                coordinate={{ latitude: rec.latitude!, longitude: rec.longitude! }}
                title={rec.companyName}
                description={rec.address}
                onPress={() => openRecycler(rec)}
              >
                <View className="bg-white rounded-full border-2 border-emerald-400 p-2 shadow-lg">
                  <MapPin size={22} color="#059669" />
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Recyclers List Modal */}
        <Modal
          visible={showListModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowListModal(false)}
        >
          <View className="flex-1 bg-white pt-10">
            <View className="flex-row justify-between items-center px-4 py-3 border-b border-emerald-100">
              <Text className="text-xl font-bold text-emerald-800">Nearby Recyclers</Text>
              <TouchableOpacity onPress={() => setShowListModal(false)}>
                <X size={24} color="#059669" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={recyclers}
              renderItem={renderRecyclerItem}
                keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-gray-500">No recyclers found nearby</Text>
                </View>
              }
            />
          </View>
        </Modal>

        {/* Bottom Sheet for Recycler Details */}
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={["50%"]}
          backgroundStyle={{ backgroundColor: "#f0fdf4" }}
          handleIndicatorStyle={{ backgroundColor: "#059669" }}
        >
          {selectedRecycler ? (
            <View className="p-4">
              <Text className="text-xl font-bold text-emerald-800 mb-1">{selectedRecycler.companyName}</Text>
              <View className="flex-row items-center mb-2">
                <MapPin size={16} color="#059669" />
                <Text className="ml-2 text-gray-700">{selectedRecycler.address}</Text>
              </View>
              {selectedRecycler.distance !== undefined && (
                <Text className="text-emerald-600 mb-2">
                  {selectedRecycler.distance} km away from your location
                </Text>
              )}
              <View className="flex-row items-center mb-2">
                <Info size={16} color="#059669" />
                <Text className="ml-2 text-gray-700">{selectedRecycler.description || "E-waste drop-off and recycling center"}</Text>
              </View>
              {selectedRecycler.phoneNumber && (
                <TouchableOpacity 
                  className="flex-row items-center mb-2"
                  onPress={() => callRecycler(selectedRecycler.phoneNumber!)}
                >
                  <Phone size={16} color="#059669" />
                  <Text className="ml-2 text-gray-700">{selectedRecycler.phoneNumber}</Text>
                </TouchableOpacity>
              )}
              {selectedRecycler.email && (
                <View className="flex-row items-center mb-4">
                  <Info size={16} color="#059669" />
                  <Text className="ml-2 text-gray-700">{selectedRecycler.email}</Text>
                </View>
              )}

              {/* Rating Form */}
              <View className="mt-4 mb-2">
                <Text className="text-base font-semibold text-emerald-800 mb-1">Rate this Recycler:</Text>
                <View className="flex-row items-center mb-2">
                  {[1,2,3,4,5].map(star => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setUserRating(star)}
                      disabled={submittingRating || ratingSuccess}
                    >
                      <Star size={28} color={userRating >= star ? '#fbbf24' : '#d1d5db'} fill={userRating >= star ? '#fbbf24' : 'none'} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg ${userRating > 0 && !ratingSuccess ? 'bg-emerald-600' : 'bg-gray-300'} items-center`}
                  onPress={submitRating}
                  disabled={userRating < 1 || submittingRating || ratingSuccess}
                >
                  <Text className="text-white font-semibold">
                    {submittingRating ? 'Submitting...' : ratingSuccess ? 'Thank you for rating!' : 'Submit Rating'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between mt-4">
                {selectedRecycler.phoneNumber && (
                  <TouchableOpacity
                    className="flex-row items-center px-4 py-2 bg-emerald-600 rounded-lg"
                    onPress={() => callRecycler(selectedRecycler.phoneNumber!)}
                  >
                    <Phone size={18} color="#fff" />
                    <Text className="ml-2 text-white font-semibold">Call</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="flex-row items-center px-4 py-2 bg-emerald-800 rounded-lg"
                  onPress={() => selectedRecycler.latitude && selectedRecycler.longitude && openDirections(selectedRecycler.latitude, selectedRecycler.longitude)}
                >
                  <Navigation size={18} color="#fff" />
                  <Text className="ml-2 text-white font-semibold">Directions</Text>
                </TouchableOpacity>
              </View>
              
              {/* Write Review Button */}
              <TouchableOpacity
                className="flex-row items-center justify-center px-4 py-3 bg-blue-600 rounded-lg mt-3"
                onPress={() => openReviewModal(selectedRecycler)}
              >
                <MessageSquare size={18} color="#fff" />
                <Text className="ml-2 text-white font-semibold">Write Detailed Review</Text>
              </TouchableOpacity>
              <Text className="text-green-700 mt-4">
                ♻️ Thank you for recycling responsibly!
              </Text>
              <TouchableOpacity
                className="mt-6 px-6 py-3 bg-emerald-600 rounded-xl items-center"
                onPress={() => bottomSheetRef.current?.dismiss()}
              >
                <Text className="text-white font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="small" color="#059669" />
            </View>
          )}
        </BottomSheetModal>

        {/* Review Modal */}
        <Modal
          visible={showReviewModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowReviewModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
            <View style={{
              backgroundColor: 'white',
              margin: 20,
              borderRadius: 20,
              padding: 20,
              maxHeight: '80%',
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#047857', flex: 1 }}>
                    Write Review
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowReviewModal(false)}
                    style={{ backgroundColor: '#f3f4f6', borderRadius: 20, padding: 8 }}
                  >
                    <X size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Recycler Info */}
                {reviewRecycler && (
                  <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#047857', marginBottom: 4 }}>
                      {reviewRecycler.companyName}
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>
                      {reviewRecycler.address}
                    </Text>
                    {reviewRecycler.distance !== undefined && (
                      <Text style={{ color: '#059669', fontSize: 12, marginTop: 4 }}>
                        {reviewRecycler.distance} km away
                      </Text>
                    )}
                  </View>
                )}

                {/* Rating Section */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                    Rating *
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setReviewRating(star)}
                        style={{ marginHorizontal: 8 }}
                        disabled={submittingReview}
                      >
                        <Star
                          size={32}
                          color={star <= reviewRating ? "#f59e0b" : "#d1d5db"}
                          fill={star <= reviewRating ? "#f59e0b" : "transparent"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                    {reviewRating > 0 ? `${reviewRating} star${reviewRating > 1 ? 's' : ''}` : 'Tap to rate'}
                  </Text>
                </View>

                {/* Feedback Section */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                    Your Feedback *
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f9fafb',
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                      padding: 12,
                      minHeight: 100,
                      textAlignVertical: 'top',
                      fontSize: 15,
                      color: '#1f2937'
                    }}
                    placeholder="Share your experience with this recycler. What did you like? Any suggestions for improvement?"
                    placeholderTextColor="#9ca3af"
                    value={reviewFeedback}
                    onChangeText={setReviewFeedback}
                    multiline={true}
                    maxLength={500}
                    editable={!submittingReview}
                  />
                  <Text style={{ textAlign: 'right', color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                    {reviewFeedback.length}/500 characters
                  </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: reviewRating > 0 && reviewFeedback.trim().length >= 10 && !submittingReview ? '#059669' : '#d1d5db',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: submittingReview ? 0 : 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                  onPress={submitReview}
                  disabled={reviewRating < 1 || reviewFeedback.trim().length < 10 || submittingReview}
                  activeOpacity={0.8}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Send size={18} color="#ffffff" />
                  )}
                  <Text style={{
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: 16,
                    marginLeft: submittingReview ? 8 : 10
                  }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </BottomSheetModalProvider>
  );
}