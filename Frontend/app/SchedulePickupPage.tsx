import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Alert, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Dimensions,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createPickup } from "../api/api";
import { Picker } from "@react-native-picker/picker";
import * as Location from 'expo-location';
import { 
  Calendar, 
  MapPin, 
  Info, 
  ChevronDown, 
  CheckCircle, 
  Smartphone,
  Clock,
  Star,
  Zap,
  Shield,
  Recycle,
  Navigation,
  RefreshCw,
  AlertCircle
} from "lucide-react-native";

const { width, height } = Dimensions.get('window');

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
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const deviceTypes = ["Laptop", "Smartphone", "Tablet", "Desktop", "Monitor", "Printer", "Other"];
  const conditionOptions = ["Working", "Partially Working", "Not Working", "Scrap"];

  const benefits = [
    { icon: Recycle, text: "Eco-friendly recycling", color: "#10B981" },
    { icon: Shield, text: "Data security guaranteed", color: "#3B82F6" },
    { icon: Zap, text: "Quick pickup service", color: "#F59E0B" },
    { icon: Star, text: "Trusted by 10,000+ users", color: "#8B5CF6" }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!pickup.deviceType) newErrors.deviceType = "Device type is required";
    if (!pickup.brand) newErrors.brand = "Brand is required";
    if (!pickup.model) newErrors.model = "Model is required";
    if (!pickup.pickupAddress) newErrors.pickupAddress = "Address is required";
    if (!pickup.city) newErrors.city = "City is required";
    if (!pickup.state) newErrors.state = "State is required";
    if (!pickup.pincode) newErrors.pincode = "Pincode is required";
    if (pickup.pincode && !/^\d{6}$/.test(pickup.pincode)) newErrors.pincode = "Pincode must be 6 digits";
    if (pickup.weight && isNaN(parseFloat(pickup.weight))) newErrors.weight = "Weight must be a number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-fetch location function
  const fetchCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Location permission is needed to automatically fill your address. You can still enter it manually.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      // Get current position
      let location = await Location.getCurrentPositionAsync({});
      
      // Reverse geocoding to get address
      let addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        setPickup({
          ...pickup,
          pickupAddress: `${address.name || ''} ${address.street || ''}`.trim(),
          city: address.city || '',
          state: address.region || '',
          pincode: address.postalCode || '',
        });
        
        // Clear any previous location errors
        const newErrors = {...errors};
        delete newErrors.pickupAddress;
        delete newErrors.city;
        delete newErrors.state;
        delete newErrors.pincode;
        setErrors(newErrors);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert(
        'Location Error', 
        'Unable to fetch current location. Please enter your address manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Authentication Error", "Please log in to schedule a pickup");
      return;
    }
    
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    
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

    try {
      const response = await createPickup(payload);
      console.log("Response:", response.data);

      Alert.alert("Success", "Pickup scheduled successfully!");
      setIsSubmitted(true);

      // Reset form
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
      
      setErrors({});

      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error: any) {
      console.log("API Error:", error.response || error.message || error);
      Alert.alert(
        "Submission Error", 
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to handle input changes with validation
  const handleInputChange = (field: string, value: string) => {
    setPickup({ ...pickup, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = {...errors};
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section with Gradient */}
          <Animated.View 
            className="bg-blue-600 px-6 pt-12 pb-8 rounded-b-3xl"
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <View className="flex-row items-center justify-center mb-4">
              <Smartphone size={32} color="#FFFFFF" />
              <Text className="text-3xl font-bold text-white ml-3">EcoPickup</Text>
            </View>
            <Text className="text-white text-center text-lg opacity-90">
              Turn your old devices into a greener future
            </Text>
            <Text className="text-white text-center text-sm opacity-75 mt-2">
              Secure • Fast • Eco-friendly
            </Text>
          </Animated.View>

          {/* Benefits Section */}
          <Animated.View style={{ opacity: fadeAnim }} className="px-6 -mt-6">
            <View className="bg-white rounded-2xl p-5 shadow-lg mb-6">
              <View className="flex-row flex-wrap justify-between">
                {benefits.map((benefit, index) => (
                  <View key={index} className="w-1/2 items-center p-3">
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: `${benefit.color}15` }}
                    >
                      <benefit.icon size={24} color={benefit.color} />
                    </View>
                    <Text className="text-xs text-center text-gray-700 font-medium">
                      {benefit.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          <View className="px-6 pb-10">
            {/* Success Message */}
            {isSubmitted && (
              <Animated.View 
                className="bg-green-50 border border-green-200 p-4 rounded-2xl mb-6 flex-row items-center"
                style={{ opacity: fadeAnim }}
              >
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <CheckCircle size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-green-800 font-semibold">Pickup Scheduled!</Text>
                  <Text className="text-green-600 text-sm">We'll contact you soon with details</Text>
                </View>
              </Animated.View>
            )}

            {/* Device Information Card */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
                  <Info size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900">Device Details</Text>
                  <Text className="text-gray-500 text-sm">Tell us about your device</Text>
                </View>
              </View>

              {/* Device Type Picker */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-3 text-base">Device Type *</Text>
                <View className={`border rounded-xl bg-gray-50 overflow-hidden ${errors.deviceType ? 'border-red-500' : 'border-gray-200'}`}>
                  <Picker
                    selectedValue={pickup.deviceType}
                    onValueChange={(itemValue) => handleInputChange("deviceType", itemValue)}
                    dropdownIconColor="#6B7280"
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Select your device type" value="" />
                    {deviceTypes.map((type) => <Picker.Item key={type} label={type} value={type} />)}
                  </Picker>
                </View>
                {errors.deviceType && <Text className="text-red-500 text-sm mt-1">{errors.deviceType}</Text>}
              </View>

              {/* Brand & Model Row */}
              <View className="flex-row mb-5">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-700 font-semibold mb-3 text-base">Brand *</Text>
                  <TextInput
                    placeholder="e.g., Apple, Samsung"
                    value={pickup.brand}
                    onChangeText={(text) => handleInputChange("brand", text)}
                    className={`border p-4 rounded-xl bg-gray-50 text-gray-900 ${errors.brand ? 'border-red-500' : 'border-gray-200'}`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.brand && <Text className="text-red-500 text-sm mt-1">{errors.brand}</Text>}
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-700 font-semibold mb-3 text-base">Model *</Text>
                  <TextInput
                    placeholder="e.g., iPhone 12"
                    value={pickup.model}
                    onChangeText={(text) => handleInputChange("model", text)}
                    className={`border p-4 rounded-xl bg-gray-50 text-gray-900 ${errors.model ? 'border-red-500' : 'border-gray-200'}`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.model && <Text className="text-red-500 text-sm mt-1">{errors.model}</Text>}
                </View>
              </View>

              {/* Condition Picker */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-3 text-base">Condition</Text>
                <View className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker
                    selectedValue={pickup.condition}
                    onValueChange={(itemValue) => setPickup({ ...pickup, condition: itemValue })}
                    dropdownIconColor="#6B7280"
                    style={{ height: 50 }}
                  >
                    {conditionOptions.map((condition) => (
                      <Picker.Item key={condition} label={condition} value={condition} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Weight Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-3 text-base">Weight (kg)</Text>
                <TextInput
                  placeholder="Approximate weight"
                  keyboardType="numeric"
                  value={pickup.weight}
                  onChangeText={(text) => handleInputChange("weight", text)}
                  className={`border p-4 rounded-xl bg-gray-50 text-gray-900 ${errors.weight ? 'border-red-500' : 'border-gray-200'}`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.weight && <Text className="text-red-500 text-sm mt-1">{errors.weight}</Text>}
              </View>

              {/* Notes Input */}
              <View className="mb-2">
                <Text className="text-gray-700 font-semibold mb-3 text-base">Additional Notes</Text>
                <TextInput
                  placeholder="Any special instructions or details..."
                  value={pickup.notes}
                  onChangeText={(text) => setPickup({ ...pickup, notes: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="border border-gray-200 p-4 rounded-xl bg-gray-50 text-gray-900 min-h-[100px]"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Location Card */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center mr-4">
                    <MapPin size={24} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">Pickup Location</Text>
                    <Text className="text-gray-500 text-sm">Where should we collect?</Text>
                  </View>
                </View>
                
                {/* Auto Location Button */}
                <TouchableOpacity
                  onPress={fetchCurrentLocation}
                  disabled={isLoadingLocation}
                  className="flex-row items-center bg-green-50 px-3 py-2 rounded-xl"
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator size="small" color="#10B981" />
                  ) : (
                    <Navigation size={16} color="#10B981" />
                  )}
                  <Text className="text-green-700 text-xs font-medium ml-1">
                    {isLoadingLocation ? "Getting..." : "Auto"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Address Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-semibold mb-3 text-base">Address *</Text>
                <TextInput
                  placeholder="Street address, building name..."
                  value={pickup.pickupAddress}
                  onChangeText={(text) => handleInputChange("pickupAddress", text)}
                  className={`border p-4 rounded-xl bg-gray-50 text-gray-900 ${errors.pickupAddress ? 'border-red-500' : 'border-gray-200'}`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.pickupAddress && <Text className="text-red-500 text-sm mt-1">{errors.pickupAddress}</Text>}
              </View>

              {/* City & State Row */}
              <View className="flex-row mb-5">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-700 font-semibold mb-3 text-base">City *</Text>
                  <TextInput
                    placeholder="Your city"
                    value={pickup.city}
                    onChangeText={(text) => handleInputChange("city", text)}
                    className={`border p-4 rounded-xl bg-gray-50 text-gray-900 ${errors.city ? 'border-red-500' : 'border-gray-200'}`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.city && <Text className="text-red-500 text-sm mt-1">{errors.city}</Text>}
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-700 font-semibold mb-3 text-base">State *</Text>
                  <TextInput
                    placeholder="Your state"
                    value={pickup.state}
                    onChangeText={(text) => handleInputChange("state", text)}
                    className={`border p-4 rounded-xl bg-gray-50 text-gray-900 ${errors.state ? 'border-red-500' : 'border-gray-200'}`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.state && <Text className="text-red-500 text-sm mt-1">{errors.state}</Text>}
                </View>
              </View>

              {/* Pincode */}
              <View className="mb-2">
                <Text className="text-gray-700 font-semibold mb-3 text-base">Pincode *</Text>
                <TextInput
                  placeholder="6-digit pincode"
                  keyboardType="numeric"
                  maxLength={6}
                  value={pickup.pincode}
                  onChangeText={(text) => handleInputChange("pincode", text)}
                  className={`border p-4 rounded-xl bg-gray-50 text-gray-900 ${errors.pincode ? 'border-red-500' : 'border-gray-200'}`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.pincode && <Text className="text-red-500 text-sm mt-1">{errors.pincode}</Text>}
              </View>
            </View>

            {/* Date Selection Card */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mr-4">
                  <Calendar size={24} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900">Pickup Date</Text>
                  <Text className="text-gray-500 text-sm">When works best for you?</Text>
                </View>
              </View>

              <TouchableOpacity
                className="border border-gray-200 p-4 rounded-xl flex-row justify-between items-center bg-gray-50"
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Clock size={20} color="#6B7280" />
                  <Text className="text-gray-700 ml-3 font-medium">
                    {pickup.preferredPickupDate.toDateString()}
                  </Text>
                </View>
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

            {/* Submit Button */}
            <TouchableOpacity 
              className="bg-blue-600 p-5 rounded-2xl items-center mb-8 shadow-lg"
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="items-center">
                  <View className="flex-row items-center">
                    <CheckCircle size={24} color="#FFFFFF" />
                    <Text className="text-white font-bold text-lg ml-3">Schedule Pickup</Text>
                  </View>
                  <Text className="text-white opacity-90 text-sm mt-1">
                    Free pickup • Secure process • Instant confirmation
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Footer Info */}
            <View className="bg-gray-50 rounded-xl p-4 mb-8">
              <Text className="text-center text-gray-600 text-sm">
                🔒 Your data is secure • ♻️ 100% eco-friendly • 🚚 Free doorstep pickup
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SchedulePickupPage;