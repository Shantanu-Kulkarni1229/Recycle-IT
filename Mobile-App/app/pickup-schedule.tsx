import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform, ActivityIndicator, Animated, Easing, Dimensions 
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "@/context/UserContext";
import api from "../api/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');
const deviceConditions = [
  "Working",
  "Partially Working",
  "Not Working",
  "Scrap"
];

export default function PickupSchedule() {
  const router = useRouter();
  const { userId } = useUser();
  const [form, setForm] = useState({
    deviceType: "",
    brand: "",
    model: "",
    purchaseDate: "",
    condition: "",
    weight: "",
    notes: "",
    pickupAddress: "",
    city: "",
    state: "",
    pincode: "",
    preferredPickupDate: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0]; // ✅ Start visible
  const slideAnim = useState(new Animated.Value(0))[0]; // ✅ Start in position

  // Error state for each field
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Animation for section transitions
  const animateSection = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  };

  // Handle input changes
  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  // Validate all fields before submit
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.deviceType.trim()) newErrors.deviceType = "Device type is required";
    if (!form.brand.trim()) newErrors.brand = "Brand is required";
    if (!form.model.trim()) newErrors.model = "Model is required";
    if (!form.condition) newErrors.condition = "Condition is required";
    if (!form.pickupAddress.trim()) newErrors.pickupAddress = "Pickup address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Valid 6-digit pincode required";
    if (!form.preferredPickupDate) newErrors.preferredPickupDate = "Pickup date is required";
    if (form.purchaseDate && new Date(form.purchaseDate) > new Date()) newErrors.purchaseDate = "Purchase date cannot be in the future";
    if (form.weight && isNaN(Number(form.weight))) newErrors.weight = "Weight must be a number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        userId,
        weight: form.weight ? Number(form.weight) : undefined,
        purchaseDate: form.purchaseDate ? new Date(form.purchaseDate) : undefined,
        preferredPickupDate: new Date(form.preferredPickupDate),
      };
      const res = await api.post("schedule-pickup", payload);
      Alert.alert("Success", "Pickup scheduled successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)/home") }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to schedule pickup");
    } finally {
      setLoading(false);
    }
  };

  // Next section handler
  const nextSection = () => {
    if (currentSection < 2) {
      setCurrentSection(currentSection + 1);
      // animateSection will be called by useEffect
    }
  };

  // Previous section handler
  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      // animateSection will be called by useEffect
    }
  };

  // Render device information section
  const renderDeviceInfo = () => (
    <Animated.View 
      style={{ 
        opacity: fadeAnim, 
        transform: [{ translateY: slideAnim }] 
      }}
    >
      <Text className="text-green-700 text-xl font-bold mb-6 text-center">
        Device Information
      </Text>

      {/* Device Type */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Device Type *</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            placeholder="e.g. Laptop, Mobile, TV"
            className="p-4 text-green-900"
            value={form.deviceType}
            onChangeText={text => handleChange("deviceType", text)}
          />
        </View>
        {errors.deviceType && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.deviceType}</Text>
          </View>
        )}
      </View>

      {/* Brand */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Brand *</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            placeholder="e.g. Dell, Samsung"
            className="p-4 text-green-900"
            value={form.brand}
            onChangeText={text => handleChange("brand", text)}
          />
        </View>
        {errors.brand && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.brand}</Text>
          </View>
        )}
      </View>

      {/* Model */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Model *</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            placeholder="e.g. Inspiron 15"
            className="p-4 text-green-900"
            value={form.model}
            onChangeText={text => handleChange("model", text)}
          />
        </View>
        {errors.model && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.model}</Text>
          </View>
        )}
      </View>

      {/* Purchase Date */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Purchase Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-white rounded-2xl p-4 shadow-sm border border-green-100 flex-row justify-between items-center"
        >
          <Text className={form.purchaseDate ? "text-green-900" : "text-green-400"}>
            {form.purchaseDate ? new Date(form.purchaseDate).toLocaleDateString() : "Select date"}
          </Text>
          <Ionicons name="calendar" size={20} color="#10b981" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.purchaseDate ? new Date(form.purchaseDate) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) handleChange("purchaseDate", date.toISOString());
            }}
          />
        )}
        {errors.purchaseDate && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.purchaseDate}</Text>
          </View>
        )}
      </View>

      {/* Condition */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Condition *</Text>
        <View className="flex-row flex-wrap justify-between">
          {deviceConditions.map(cond => (
            <TouchableOpacity
              key={cond}
              className={`px-4 py-3 mb-3 rounded-xl border flex-1 mx-1 min-w-[45%] items-center ${form.condition === cond ? "bg-green-500 border-green-500 shadow-md" : "bg-white border-green-200"}`}
              onPress={() => handleChange("condition", cond)}
              style={{
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: form.condition === cond ? 0.2 : 0,
                shadowRadius: 4,
                elevation: form.condition === cond ? 3 : 0,
              }}
            >
              <Text className={form.condition === cond ? "text-white font-bold" : "text-green-700"}>{cond}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.condition && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.condition}</Text>
          </View>
        )}
      </View>

      {/* Weight */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Weight (kg)</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100 flex-row items-center">
          <TextInput
            placeholder="e.g. 2.5"
            className="p-4 flex-1 text-green-900"
            value={form.weight}
            onChangeText={text => handleChange("weight", text.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
          />
          <Text className="pr-4 text-green-500">kg</Text>
        </View>
        {errors.weight && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.weight}</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Notes</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            placeholder="Any special instructions?"
            className="p-4 text-green-900 h-20"
            value={form.notes}
            onChangeText={text => handleChange("notes", text)}
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>
    </Animated.View>
  );

  // Render address section
  const renderAddressInfo = () => (
    <Animated.View 
      style={{ 
        opacity: fadeAnim, 
        transform: [{ translateY: slideAnim }] 
      }}
    >
      <Text className="text-green-700 text-xl font-bold mb-6 text-center">
        Pickup Address
      </Text>

      {/* Pickup Address */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Pickup Address *</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            placeholder="Full address"
            className="p-4 text-green-900 h-20"
            value={form.pickupAddress}
            onChangeText={text => handleChange("pickupAddress", text)}
            multiline
            textAlignVertical="top"
          />
        </View>
        {errors.pickupAddress && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.pickupAddress}</Text>
          </View>
        )}
      </View>

      {/* City */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">City *</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            placeholder="City"
            className="p-4 text-green-900"
            value={form.city}
            onChangeText={text => handleChange("city", text)}
          />
        </View>
        {errors.city && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.city}</Text>
          </View>
        )}
      </View>

      {/* State */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">State *</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            placeholder="State"
            className="p-4 text-green-900"
            value={form.state}
            onChangeText={text => handleChange("state", text)}
          />
        </View>
        {errors.state && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.state}</Text>
          </View>
        )}
      </View>

      {/* Pincode */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Pincode *</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            placeholder="6-digit pincode"
            className="p-4 text-green-900"
            value={form.pincode}
            onChangeText={text => handleChange("pincode", text.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
        {errors.pincode && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.pincode}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  // Render scheduling section
  const renderSchedulingInfo = () => (
    <Animated.View 
      style={{ 
        opacity: fadeAnim, 
        transform: [{ translateY: slideAnim }] 
      }}
    >
      <Text className="text-green-700 text-xl font-bold mb-6 text-center">
        Pickup Scheduling
      </Text>

      {/* Preferred Pickup Date */}
      <View className="mb-8">
        <Text className="text-green-800 font-medium mb-2">Preferred Pickup Date *</Text>
        <TouchableOpacity
          onPress={() => setShowPickupDatePicker(true)}
          className="bg-white rounded-2xl p-4 shadow-sm border border-green-100 flex-row justify-between items-center"
        >
          <Text className={form.preferredPickupDate ? "text-green-900" : "text-green-400"}>
            {form.preferredPickupDate ? new Date(form.preferredPickupDate).toLocaleDateString() : "Select date"}
          </Text>
          <Ionicons name="calendar" size={20} color="#10b981" />
        </TouchableOpacity>
        {showPickupDatePicker && (
          <DateTimePicker
            value={form.preferredPickupDate ? new Date(form.preferredPickupDate) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
            onChange={(_, date) => {
              setShowPickupDatePicker(false);
              if (date) handleChange("preferredPickupDate", date.toISOString());
            }}
          />
        )}
        {errors.preferredPickupDate && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1">{errors.preferredPickupDate}</Text>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`bg-green-600 rounded-2xl p-5 items-center justify-center shadow-lg ${loading ? "opacity-70" : ""}`}
        onPress={handleSubmit}
        disabled={loading}
        style={{
          shadowColor: "#059669",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-lg mr-2">Schedule Pickup</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  useEffect(() => {
    animateSection();
  }, [currentSection]); // Trigger when currentSection changes

  return (
    <View className="flex-1 bg-green-50">
      {/* Header */}
      <View className="bg-green-600 pt-12 pb-5 px-5 rounded-b-3xl shadow-lg">
        <Text className="text-white text-2xl font-bold text-center">
          Schedule E-Waste Pickup
        </Text>
        <Text className="text-green-100 text-center mt-1">
          Help the environment by recycling your e-waste
        </Text>
        
        {/* Progress Indicator */}
        <View className="flex-row justify-center mt-6 mb-2">
          {[0, 1, 2].map((i) => (
            <View 
              key={i} 
              className={`h-2 rounded-full mx-1 ${currentSection === i ? 'bg-green-300 w-8' : 'bg-green-400 w-2'}`}
            />
          ))}
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-5 mt-5" 
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {currentSection === 0 && renderDeviceInfo()}
        {currentSection === 1 && renderAddressInfo()}
        {currentSection === 2 && renderSchedulingInfo()}
      </ScrollView>

      {/* Navigation Buttons */}
      {currentSection > 0 && (
        <View className="px-5 pb-5 pt-2 bg-green-50 border-t border-green-100">
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={prevSection}
              className="bg-white rounded-2xl p-4 flex-row items-center justify-center border border-green-200 flex-1 mr-2"
            >
              <Ionicons name="arrow-back" size={18} color="#10b981" />
              <Text className="text-green-700 font-medium ml-2">Previous</Text>
            </TouchableOpacity>
            
            {currentSection < 2 && (
              <TouchableOpacity
                onPress={nextSection}
                className="bg-green-500 rounded-2xl p-4 flex-row items-center justify-center flex-1 ml-2 shadow-sm"
                style={{
                  shadowColor: "#059669",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white font-medium mr-2">Next</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      
      {currentSection === 0 && (
        <View className="px-5 pb-5 pt-2 bg-green-50 border-t border-green-100">
          <TouchableOpacity
            onPress={nextSection}
            className="bg-green-500 rounded-2xl p-4 flex-row items-center justify-center shadow-sm"
            style={{
              shadowColor: "#059669",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-white font-medium mr-2">Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}