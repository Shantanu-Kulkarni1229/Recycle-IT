import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Leaf, MapPin, Info, Phone } from "lucide-react-native";
import api from "../../api/api";

type Recycler = {
  _id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  description?: string;
};
const { width, height } = Dimensions.get("window");

export default function recyclers_nearby() {
 const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [selectedRecycler, setSelectedRecycler] = useState<Recycler | null>(null);
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
      fetchRecyclers(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  // Fetch recyclers from backend
  const fetchRecyclers = async (lat: number, lng: number) => {
    try {
      // You can also use reverse geocoding to get city if needed
      const res = await api.get(`recyclers/nearby?lat=${lat}&lng=${lng}`);
      setRecyclers(res.data.data || []);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to fetch recyclers");
    }
    setLoading(false);
  };

  // Open bottom sheet with recycler details
  const openRecycler = (recycler: Recycler) => {
    setSelectedRecycler(recycler);
    bottomSheetRef.current?.present();
  };

  // Map region
  const region: Region | undefined = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04 * (width / height),
      }
    : undefined;

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <View className="px-4 pt-8 pb-2 bg-emerald-50 border-b border-emerald-100">
          <Text className="text-2xl font-bold text-emerald-800 mb-1">Nearby Recyclers</Text>
          <Text className="text-gray-600">Find e-waste drop-off points around you</Text>
        </View>
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
            {/* Recycler markers */}
            {recyclers.map((rec) => (
              <Marker
                key={rec._id}
                coordinate={{ latitude: rec.latitude, longitude: rec.longitude }}
                title={rec.name}
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

        {/* Bottom Sheet for Recycler Details */}
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={["40%"]}
          backgroundStyle={{ backgroundColor: "#f0fdf4" }}
          handleIndicatorStyle={{ backgroundColor: "#059669" }}
        >
          {selectedRecycler ? (
            <View className="p-4">
              <Text className="text-xl font-bold text-emerald-800 mb-1">{selectedRecycler.name}</Text>
              <View className="flex-row items-center mb-2">
                <MapPin size={16} color="#059669" />
                <Text className="ml-2 text-gray-700">{selectedRecycler.address}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Info size={16} color="#059669" />
                <Text className="ml-2 text-gray-700">{selectedRecycler.description || "E-waste drop-off and recycling center"}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Phone size={16} color="#059669" />
                <Text className="ml-2 text-gray-700">{selectedRecycler.phone || "N/A"}</Text>
              </View>
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
      </View>
    </BottomSheetModalProvider>
  );
}