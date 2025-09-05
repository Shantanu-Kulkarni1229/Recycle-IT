import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createPickup } from "../api/api";
import { Picker } from "@react-native-picker/picker";
import { Calendar, MapPin, Info, ChevronDown, CheckCircle } from "lucide-react-native";

const SchedulePickupPage = ({ userId }: { userId: string }) => {
  const [pickup, setPickup] = useState({
    deviceType: "",
    brand: "",
    model: "",
    purchaseDate: new Date(),
    condition: "Working",
    weight: "",
    notes: "",
    pickupAddress: "",
    city: "",
    state: "",
    pincode: "",
    preferredPickupDate: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const deviceTypes = ["Laptop", "Smartphone", "Tablet", "Desktop", "Monitor", "Printer", "Other"];
  const conditionOptions = ["Working", "Partially Working", "Not Working", "Scrap"];

  const handleSubmit = async () => {
    // Validate required fields
    if (!userId) return Alert.alert("Error", "User not logged in");
    if (!pickup.deviceType || !pickup.brand || !pickup.model || !pickup.pickupAddress || !pickup.city || !pickup.state || !pickup.pincode) {
      return Alert.alert("Error", "Please fill all required fields");
    }

    const payload = {
      deviceType: pickup.deviceType,
      brand: pickup.brand,
      model: pickup.model,
      purchaseDate: pickup.purchaseDate.toISOString(),
      condition: pickup.condition,
      weight: pickup.weight ? parseFloat(pickup.weight) : 0,
      notes: pickup.notes,
      pickupAddress: pickup.pickupAddress,
      city: pickup.city,
      state: pickup.state,
      pincode: pickup.pincode,
      preferredPickupDate: pickup.preferredPickupDate.toISOString(),
      userId,
    };

    console.log("Submitting payload:", payload);

    try {
      const response = await createPickup(payload);
      console.log("Response:", response.data);

      Alert.alert("Success", "Pickup scheduled successfully!");
      setIsSubmitted(true);

      setPickup({
        deviceType: "",
        brand: "",
        model: "",
        purchaseDate: new Date(),
        condition: "Working",
        weight: "",
        notes: "",
        pickupAddress: "",
        city: "",
        state: "",
        pincode: "",
        preferredPickupDate: new Date(),
      });

      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error: any) {
      console.log("API Error:", error.response || error.message || error);
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-5 bg-gray-50">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Schedule Pickup</Text>
          <Text className="text-gray-600 mt-2">Fill in your device details and pickup information</Text>
        </View>

        {isSubmitted && (
          <View className="bg-green-50 p-4 rounded-lg mb-6 flex-row items-center">
            <CheckCircle size={20} color="#10B981" />
            <Text className="text-green-800 ml-2">Pickup scheduled successfully!</Text>
          </View>
        )}

        {/* Device Info */}
        <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Info size={20} color="#4B5563" />
            <Text className="text-lg font-semibold ml-2 text-gray-800">Device Information</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Device Type</Text>
            <View className="border rounded-lg bg-white border-gray-300">
              <Picker
                selectedValue={pickup.deviceType}
                onValueChange={(itemValue) => setPickup({ ...pickup, deviceType: itemValue })}
                dropdownIconColor="#6B7280"
              >
                <Picker.Item label="Select device type" value="" />
                {deviceTypes.map((type) => <Picker.Item key={type} label={type} value={type} />)}
              </Picker>
            </View>
          </View>

          <TextInput
            placeholder="Brand"
            value={pickup.brand}
            onChangeText={(text) => setPickup({ ...pickup, brand: text })}
            className="border p-4 mb-4 rounded-lg bg-white border-gray-300"
          />
          <TextInput
            placeholder="Model"
            value={pickup.model}
            onChangeText={(text) => setPickup({ ...pickup, model: text })}
            className="border p-4 mb-4 rounded-lg bg-white border-gray-300"
          />

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Condition</Text>
            <View className="border rounded-lg bg-white border-gray-300">
              <Picker
                selectedValue={pickup.condition}
                onValueChange={(itemValue) => setPickup({ ...pickup, condition: itemValue })}
                dropdownIconColor="#6B7280"
              >
                {conditionOptions.map((condition) => <Picker.Item key={condition} label={condition} value={condition} />)}
              </Picker>
            </View>
          </View>

          <TextInput
            placeholder="Weight (kg)"
            keyboardType="numeric"
            value={pickup.weight}
            onChangeText={(text) => setPickup({ ...pickup, weight: text })}
            className="border p-4 mb-4 rounded-lg bg-white border-gray-300"
          />

          <TextInput
            placeholder="Additional Notes (optional)"
            value={pickup.notes}
            onChangeText={(text) => setPickup({ ...pickup, notes: text })}
            multiline
            numberOfLines={3}
            className="border p-4 mb-4 rounded-lg bg-white border-gray-300"
          />
        </View>

        {/* Pickup Location */}
        <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <MapPin size={20} color="#4B5563" />
            <Text className="text-lg font-semibold ml-2 text-gray-800">Pickup Location</Text>
          </View>

          <TextInput
            placeholder="Pickup Address"
            value={pickup.pickupAddress}
            onChangeText={(text) => setPickup({ ...pickup, pickupAddress: text })}
            className="border p-4 mb-4 rounded-lg bg-white border-gray-300"
          />

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <TextInput
                placeholder="City"
                value={pickup.city}
                onChangeText={(text) => setPickup({ ...pickup, city: text })}
                className="border p-4 rounded-lg bg-white border-gray-300"
              />
            </View>
            <View className="flex-1 ml-2">
              <TextInput
                placeholder="State"
                value={pickup.state}
                onChangeText={(text) => setPickup({ ...pickup, state: text })}
                className="border p-4 rounded-lg bg-white border-gray-300"
              />
            </View>
          </View>

          <TextInput
            placeholder="Pincode"
            keyboardType="numeric"
            value={pickup.pincode}
            onChangeText={(text) => setPickup({ ...pickup, pincode: text })}
            className="border p-4 mb-4 rounded-lg bg-white border-gray-300"
          />
        </View>

        {/* Pickup Date */}
        <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Calendar size={20} color="#4B5563" />
            <Text className="text-lg font-semibold ml-2 text-gray-800">Preferred Pickup Date</Text>
          </View>

          <TouchableOpacity
            className="border p-4 rounded-lg flex-row justify-between items-center bg-white border-gray-300"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-gray-700">{pickup.preferredPickupDate.toDateString()}</Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={pickup.preferredPickupDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setPickup({ ...pickup, preferredPickupDate: selectedDate });
              }}
            />
          )}
        </View>

        <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center mb-10" onPress={handleSubmit}>
          <Text className="text-white font-semibold text-lg">Schedule Pickup</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SchedulePickupPage;
