import React, { useEffect, useState } from "react";
import { 
  View, Text, ScrollView, ActivityIndicator, Alert, RefreshControl, SafeAreaView, Platform, StatusBar 
} from "react-native";
import { getUserPickups } from "../api/api";

interface PreviousRecyclesProps {
  userId: string;
}

const PreviousRecycles: React.FC<PreviousRecyclesProps> = ({ userId }) => {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchUserPickups = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getUserPickups(userId);
      if (response.data?.success) {
        setPickups(response.data.data || []);
      } else {
        Alert.alert("Error", "Failed to fetch pickups");
      }
    } catch (error) {
      console.log("Fetch error:", error);
      Alert.alert("Error", "Something went wrong while fetching pickups");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserPickups();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserPickups();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 10, fontWeight: "bold" }}>Loading your pickups...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={["#10B981"]} />}
      >
        {pickups.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#6B7280" }}>
              No previous pickups found.
            </Text>
          </View>
        ) : (
          pickups.map((pickup, index) => (
            <View key={index} style={{ backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>{pickup.deviceType} - {pickup.brand} {pickup.model}</Text>
              <Text style={{ color: "#6B7280", marginTop: 4 }}>Purchase Date: {pickup.purchaseDate}</Text>
              <Text style={{ color: "#6B7280" }}>Pickup Status: {pickup.status}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PreviousRecycles;
