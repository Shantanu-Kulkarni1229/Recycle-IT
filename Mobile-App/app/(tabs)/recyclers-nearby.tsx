import React, { useEffect, useRef, useState } from "react";
import { 
  View, Text, ActivityIndicator, Alert, TouchableOpacity, 
  Dimensions, Linking, Modal, ScrollView, FlatList 
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Leaf, MapPin, Info, Phone, Navigation, List, X } from "lucide-react-native";

type Recycler = {
  _id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  description?: string;
  distance?: number;
};

const { width, height } = Dimensions.get("window");

// Hardcoded recyclers data
const hardcodedRecyclers: Recycler[] = [
  {
    _id: "1",
    name: "E-waste Recyclers India",
    address: "Ghansoli, Navi Mumbai 400708",
    city: "Navi Mumbai",
    latitude: 19.1140,
    longitude: 73.0114,
    phone: "9324873485",
    email: "inquiry@ewasterecyclersindia.in",
    description: "E-waste recycling services"
  },
  {
    _id: "2",
    name: "RecycleKaro",
    address: "Office 1603, 16th floor, Building B, Atrium B, Rupa Solitaire, Millennium Business Park, Mahape, Navi Mumbai 400710",
    city: "Navi Mumbai",
    latitude: 19.1175,
    longitude: 73.0264,
    phone: "02241231340",
    email: "info@recyclekaro.com",
    description: "Comprehensive e-waste management"
  },
  {
    _id: "3",
    name: "Green India E-Waste & Recycling Opc Pvt. Ltd.",
    address: "The Corporate Park, 501, Plot No.14, Sector 18, Vashi, Navi Mumbai 400703",
    city: "Navi Mumbai",
    latitude: 19.077064,
    longitude: 72.998992,
    phone: "8655969731",
    email: "ewaste@gier.co.in",
    description: "Professional e-waste recycling"
  },
  {
    _id: "4",
    name: "GoGreen India E-Waste & Recycling",
    address: "Unit No. 75, Hasti Industrial Estate, Mahape, Vashi, Navi Mumbai 400701",
    city: "Navi Mumbai",
    latitude: 19.1123,
    longitude: 73.0114,
    email: "gogreenrecycling15@gmail.com",
    description: "Eco-friendly e-waste solutions"
  },
  {
    _id: "5",
    name: "Eco Friend Industries",
    address: "MIDC, Navi Mumbai",
    city: "Navi Mumbai",
    latitude: 19.11,
    longitude: 73.01,
    phone: "9930763704",
    description: "Sustainable e-waste management"
  },
  {
    _id: "6",
    name: "VVDN Technologies: E-West Recyclers India Centre",
    address: "Plot No. 92, Gali No. – 01, Sector 19C, Vashi, Navi Mumbai 400705",
    city: "Navi Mumbai",
    latitude: 19.07,
    longitude: 72.999,
    phone: "9372166155",
    description: "Technology e-waste specialists"
  },
  {
    _id: "7",
    name: "EcoTech",
    address: "Kharghar, Sector 7, Navi Mumbai (UT Classes, Simran Residency, near Bikaner Sweets)",
    city: "Navi Mumbai",
    latitude: 19.0500,
    longitude: 73.0480,
    phone: "9137029150",
    email: "ecotech.navimumbai@gmail.com",
    description: "Innovative e-waste solutions"
  }
];

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
      
      // Calculate distances and sort by proximity
      const recyclersWithDistance = hardcodedRecyclers.map(recycler => ({
        ...recycler,
        distance: calculateDistance(
          loc.coords.latitude, 
          loc.coords.longitude,
          recycler.latitude,
          recycler.longitude
        )
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setRecyclers(recyclersWithDistance);
      setLoading(false);
    })();
  }, []);

  // Open bottom sheet with recycler details
  const openRecycler = (recycler: Recycler) => {
    setSelectedRecycler(recycler);
    bottomSheetRef.current?.present();
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
      <Text className="text-lg font-bold text-emerald-800">{item.name}</Text>
      <Text className="text-gray-600 text-sm mt-1">{item.address}</Text>
      
      {item.distance !== undefined && (
        <Text className="text-emerald-600 text-sm mt-1">
          {item.distance} km away
        </Text>
      )}
      
      <View className="flex-row justify-between mt-3">
        {item.phone ? (
          <TouchableOpacity 
            className="flex-row items-center bg-emerald-100 px-3 py-2 rounded-lg"
            onPress={() => callRecycler(item.phone!)}
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
          onPress={() => openDirections(item.latitude, item.longitude)}
        >
          <Navigation size={16} color="#fff" />
          <Text className="ml-2 text-white font-medium">Directions</Text>
        </TouchableOpacity>
      </View>
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
              keyExtractor={item => item._id}
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
              <Text className="text-xl font-bold text-emerald-800 mb-1">{selectedRecycler.name}</Text>
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
              
              {selectedRecycler.phone && (
                <TouchableOpacity 
                  className="flex-row items-center mb-2"
                  onPress={() => callRecycler(selectedRecycler.phone!)}
                >
                  <Phone size={16} color="#059669" />
                  <Text className="ml-2 text-gray-700">{selectedRecycler.phone}</Text>
                </TouchableOpacity>
              )}
              
              {selectedRecycler.email && (
                <View className="flex-row items-center mb-4">
                  <Info size={16} color="#059669" />
                  <Text className="ml-2 text-gray-700">{selectedRecycler.email}</Text>
                </View>
              )}
              
              <View className="flex-row justify-between mt-4">
                {selectedRecycler.phone && (
                  <TouchableOpacity
                    className="flex-row items-center px-4 py-2 bg-emerald-600 rounded-lg"
                    onPress={() => callRecycler(selectedRecycler.phone!)}
                  >
                    <Phone size={18} color="#fff" />
                    <Text className="ml-2 text-white font-semibold">Call</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  className="flex-row items-center px-4 py-2 bg-emerald-800 rounded-lg"
                  onPress={() => openDirections(selectedRecycler.latitude, selectedRecycler.longitude)}
                >
                  <Navigation size={18} color="#fff" />
                  <Text className="ml-2 text-white font-semibold">Directions</Text>
                </TouchableOpacity>
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