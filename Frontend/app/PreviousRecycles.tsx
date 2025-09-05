import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { getUserPickups } from "../api/api";

const PreviousRecycles = ({ userId }: { userId: string }) => {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const response = await getUserPickups(userId);
        if (response.data.success) setPickups(response.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPickups();
  }, [userId]);

  if (loading) return <ActivityIndicator size="large" className="mt-10" />;

  return (
    <ScrollView className="flex-1 p-4 bg-gray-50">
      <Text className="text-2xl font-bold mb-4">Your Previous Pickups</Text>

      {pickups.length === 0 ? (
        <Text>No pickups found.</Text>
      ) : (
        pickups.map((pickup) => (
          <View key={pickup._id} className="bg-white p-4 mb-3 rounded shadow">
            <Text className="font-semibold">Address: {pickup.address}</Text>
            <Text>Status: {pickup.pickupStatus}</Text>
            <Text>Description: {pickup.description}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default PreviousRecycles;
