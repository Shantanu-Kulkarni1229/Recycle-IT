import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator, 
  Animated, Easing, Dimensions, Image, Modal, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { useUser } from "@/context/UserContext";
import api from "../api/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCustomAlert } from "../components/CustomAlert";
import { schedulePickupNotification, requestNotificationPermissions } from "../utils/notifications";

const { width } = Dimensions.get('window');
const deviceConditions = [
  "Working",
  "Partially Working", 
  "Not Working",
  "Scrap"
];

const deviceTypes = [
  "Smartphone", "Laptop", "Desktop", "Tablet", "Television", "Monitor", 
  "Printer", "Router", "Camera", "Gaming Console", "Smart Watch", "Headphones", "Other"
];

// Define types for better TypeScript support
type FormData = {
  deviceType: string;
  brand: string;
  model: string;
  purchaseDate: string;
  condition: string;
  weight: string;
  notes: string;
  pickupAddress: string;
  city: string;
  state: string;
  pincode: string;
  preferredPickupDate: string;
  customDeviceType?: string;
  latitude?: number;
  longitude?: number;
};

type DeviceImage = { uri: string; name: string; type: string };
type DocumentFile = { uri: string; name: string; type: string };
type Errors = Partial<Record<keyof FormData, string>>;

// Recycler type definition
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
  servicesOffered: string[];
  operatingHours: string;
  website?: string;
  description?: string;
};

export default function PickupSchedule() {
  const router = useRouter();
  const { userId } = useUser();
  const scrollViewRef = useRef<ScrollView>(null);
  const { showAlert, AlertComponent } = useCustomAlert();
  
  const [form, setForm] = useState<FormData>({
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
  
  // File upload states
  const [deviceImages, setDeviceImages] = useState<DeviceImage[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Error state for each field
  const [errors, setErrors] = useState<Errors>({});

  // Recycler selection states
  const [showRecyclerModal, setShowRecyclerModal] = useState(false);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [selectedRecycler, setSelectedRecycler] = useState<Recycler | null>(null);
  const [loadingRecyclers, setLoadingRecyclers] = useState(false);
  const [recyclerSelectionMode, setRecyclerSelectionMode] = useState<'auto' | 'manual' | null>(null);

  // Celebration animation states
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const celebrationScale = useState(new Animated.Value(0))[0];
  const celebrationOpacity = useState(new Animated.Value(0))[0];
  const confettiAnimations = useState(() => 
    Array.from({ length: 15 }, () => ({
      translateY: new Animated.Value(-100),
      translateX: new Animated.Value(Math.random() * width),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(1),
    }))
  )[0];
  const floatingIconsAnimations = useState(() =>
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  )[0];

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
    // Also request notification permissions
    requestNotificationPermissions();
  }, []);

  const requestPermissions = async () => {
    // Request camera permission
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      console.log('Camera permission not granted');
    }

    // Request media library permission
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaPermission.status !== 'granted') {
      console.log('Media library permission not granted');
    }

    // Request location permission
    const locationPermission = await Location.requestForegroundPermissionsAsync();
    if (locationPermission.status !== 'granted') {
      console.log('Location permission not granted');
    }
  };

  // Function to fetch current location
  const fetchCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      // Check if location permission is granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          type: 'warning',
          title: 'Permission Required',
          message: 'Please enable location permissions in your device settings to use this feature.',
        });
        setIsFetchingLocation(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get address details
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];
        
        // Update form with location data
        setForm(prev => ({
          ...prev,
          pickupAddress: `${address.name || ''} ${address.street || ''} ${address.streetNumber || ''}`.trim(),
          city: address.city || '',
          state: address.region || '',
          pincode: address.postalCode || '',
          latitude,
          longitude,
        }));

        showAlert({
          type: 'success',
          title: 'Location Found! 📍',
          message: 'Your current location has been successfully added to the address fields.',
        });
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      showAlert({
        type: 'warning',
        title: 'Location Access Failed',
        message: 'Unable to fetch your current location. Please check your GPS settings or enter the address manually.',
      });
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // Animation for section transitions
  const animateSection = useCallback(() => {
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
  }, [fadeAnim, slideAnim]);

  // Celebration animation functions
  const closeCelebrationModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(celebrationScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowCelebrationModal(false);
    });
  }, [celebrationScale, celebrationOpacity]);

  const startCelebrationAnimation = useCallback(() => {
    setShowCelebrationModal(true);
    
    // Reset animation values
    celebrationScale.setValue(0);
    celebrationOpacity.setValue(0);
    confettiAnimations.forEach(anim => {
      anim.translateY.setValue(-100);
      anim.translateX.setValue(Math.random() * width);
      anim.rotate.setValue(0);
      anim.scale.setValue(1);
    });
    floatingIconsAnimations.forEach(anim => {
      anim.translateY.setValue(0);
      anim.opacity.setValue(1);
    });

    // Main modal animation
    Animated.parallel([
      Animated.spring(celebrationScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Confetti animation
    const confettiAnimationLoop = Animated.stagger(100, 
      confettiAnimations.map(anim => 
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: Dimensions.get('window').height + 100,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 360 * (2 + Math.random() * 3),
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.scale, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 0.8,
              duration: 2500 + Math.random() * 2000,
              useNativeDriver: true,
            })
          ])
        ])
      )
    );

    // Floating icons animation
    const floatingIconsLoop = Animated.stagger(200,
      floatingIconsAnimations.map(anim =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim.translateY, {
              toValue: -30,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ]),
          { iterations: -1 }
        )
      )
    );

    confettiAnimationLoop.start();
    floatingIconsLoop.start();

    // Auto close after 5 seconds
    setTimeout(() => {
      closeCelebrationModal();
    }, 5000);
  }, [celebrationScale, celebrationOpacity, confettiAnimations, floatingIconsAnimations, closeCelebrationModal]);

  // Handle input changes
  const handleChange = (key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  };

  // Image picker functions
  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage = {
          uri: result.assets[0].uri,
          name: `device_image_${Date.now()}.jpg`,
          type: 'image/jpeg'
        };
        setDeviceImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      showAlert({
        type: 'error',
        title: 'Camera Error',
        message: 'Failed to take photo. Please check camera permissions.',
      });
    }
    setShowImageOptions(false);
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset, index) => ({
          uri: asset.uri,
          name: `device_image_${Date.now()}_${index}.jpg`,
          type: 'image/jpeg'
        }));
        setDeviceImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      showAlert({
        type: 'error',
        title: 'Gallery Error',
        message: 'Failed to pick images from gallery. Please check permissions.',
      });
    }
    setShowImageOptions(false);
  };

  // Document picker function
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'text/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled) {
        const newDocuments = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name || `document_${Date.now()}`,
          type: asset.mimeType || 'application/octet-stream'
        }));
        setDocuments(prev => [...prev, ...newDocuments]);
      }
    } catch (error) {
      console.error("Error picking documents:", error);
      showAlert({
        type: 'error',
        title: 'Document Picker Error',
        message: 'Failed to pick documents. Please try again.',
      });
    }
  };

  // Remove image function
  const removeImage = (index: number) => {
    const updatedImages = deviceImages.filter((_, i) => i !== index);
    setDeviceImages(updatedImages);
  };

  // Remove document function
  const removeDocument = (index: number) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
  };

  // Fetch recyclers from API
  const fetchRecyclers = async (): Promise<Recycler[]> => {
    try {
      setLoadingRecyclers(true);
      const response = await api.get('/users/recyclers');
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error('Failed to fetch recyclers');
      }
    } catch (error: any) {
      console.error('Error fetching recyclers:', error);
      showAlert({
        type: 'error',
        title: 'Failed to Load Recyclers',
        message: 'Unable to fetch recycler list. Please try again.',
      });
      return [];
    } finally {
      setLoadingRecyclers(false);
    }
  };

  // Show recycler selection popup
  const showRecyclerSelectionPopup = () => {
    showAlert({
      type: 'info',
      title: '🔄 Choose Recycler Option',
      message: 'How would you like to select a recycler for your pickup?',
      primaryButton: {
        text: '📍 Let Us Choose (Nearby)',
        onPress: () => handleRecyclerChoice('auto')
      },
      secondaryButton: {
        text: '👤 I\'ll Choose Myself',
        onPress: () => handleRecyclerChoice('manual')
      }
    });
  };

  // Handle recycler choice
  const handleRecyclerChoice = async (mode: 'auto' | 'manual') => {
    setRecyclerSelectionMode(mode);
    
    if (mode === 'auto') {
      // Auto mode - submit directly
      await proceedWithSubmission();
    } else {
      // Manual mode - show recycler list
      const recyclerList = await fetchRecyclers();
      setRecyclers(recyclerList);
      setShowRecyclerModal(true);
    }
  };

  // Proceed with form submission
  const proceedWithSubmission = async () => {
    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add form fields
      Object.keys(form).forEach(key => {
        const formKey = key as keyof FormData;
        if (form[formKey]) {
          formData.append(key, form[formKey] as string);
        }
      });
      
      // Add userId
      formData.append('userId', userId!);
      
      // Add selected recycler if manual mode
      if (recyclerSelectionMode === 'manual' && selectedRecycler) {
        formData.append('selectedRecyclerId', selectedRecycler.id);
        formData.append('selectedRecyclerName', selectedRecycler.companyName);
      }
      
      // Add device images
      deviceImages.forEach((image) => {
        formData.append('deviceImages', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      });
      
      // Add documents
      documents.forEach((doc) => {
        formData.append('documents', {
          uri: doc.uri,
          name: doc.name,
          type: doc.type,
        } as any);
      });

      await api.post("schedule-pickup", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 🔔 Schedule notification for pickup
      await schedulePickupNotification(
        form.deviceType === "Other" ? form.customDeviceType || "Custom Device" : form.deviceType,
        form.brand,
        form.model,
        form.preferredPickupDate
      );

      // 🎉 Show celebration animation
      startCelebrationAnimation();

      // 🎉 Show beautiful success alert after celebration
      setTimeout(() => {
        const recyclerMessage = recyclerSelectionMode === 'manual' && selectedRecycler 
          ? ` Your chosen recycler: ${selectedRecycler.companyName}.`
          : ' Our system will assign the best nearby recycler for you.';

        showAlert({
          type: 'success',
          title: '🎉 Pickup Scheduled Successfully!',
          message: `Your ${form.brand} ${form.model} pickup has been scheduled for ${new Date(form.preferredPickupDate).toLocaleDateString()}.${recyclerMessage} You'll receive a notification when our team is ready to collect your device.`,
          primaryButton: {
            text: 'Go to Home',
            onPress: () => {
              router.push("/(tabs)/home");
            }
          },
          secondaryButton: {
            text: 'Schedule Another',
            onPress: () => {
              // Reset form for another pickup
              setForm({
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
              setDeviceImages([]);
              setDocuments([]);
              setSelectedRecycler(null);
              setRecyclerSelectionMode(null);
              setCurrentSection(0);
            }
          }
        });
      }, 5500); // Show after celebration animation

    } catch (err: any) {
      console.error("Submit error:", err);
      
      // 🚨 Show beautiful error alert
      showAlert({
        type: 'error',
        title: 'Oops! Something went wrong',
        message: err.response?.data?.message || 'Failed to schedule pickup. Please check your internet connection and try again.',
        primaryButton: {
          text: 'Try Again',
          onPress: () => {
            // Just close the alert, user can retry
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Validate all fields before submit
  const validate = (): boolean => {
    const newErrors: Errors = {};
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

  // Handle form submit with file uploads
  const handleSubmit = async () => {
    if (!userId) {
      showAlert({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to schedule a pickup.',
        primaryButton: {
          text: 'Go to Login',
          onPress: () => router.push('/auth/login')
        }
      });
      return;
    }
    
    if (!validate()) {
      showAlert({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in all required fields before submitting.',
        primaryButton: {
          text: 'Review Form',
          onPress: () => {
            // Scroll to top to show errors
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }
        }
      });
      return;
    }

    // Show recycler selection popup instead of directly submitting
    showRecyclerSelectionPopup();
  };

  // Next section handler
  const nextSection = () => {
    if (currentSection < 3) {
      setCurrentSection(currentSection + 1);
    }
  };

  // Previous section handler
  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Scroll to top when section changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    animateSection();
  }, [currentSection, animateSection]);

  // Refs for inputs
  const brandRef = useRef<TextInput>(null);
  const modelRef = useRef<TextInput>(null);
  const weightRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const pincodeRef = useRef<TextInput>(null);

  // Render device information section
  const renderDeviceInfo = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Text className="text-green-700 text-xl font-bold mb-6 text-center">
        Device Information
      </Text>

      {/* Device Type Dropdown/Selection */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Device Type *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2">
            {deviceTypes.map(type => (
              <TouchableOpacity
                key={type}
                className={`px-4 py-2 rounded-full border ${form.deviceType === type ? "bg-green-500 border-green-500" : "bg-white border-green-200"}`}
                onPress={() => handleChange("deviceType", type)}
              >
                <Text className={form.deviceType === type ? "text-white font-medium" : "text-green-700"}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {form.deviceType === "Other" && (
          <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100 mt-2">
            <TextInput
              placeholder="Please specify device type"
              className="p-4 text-green-900"
              value={form.customDeviceType || ""}
              onChangeText={text => handleChange("customDeviceType" as keyof FormData, text)}
              returnKeyType="next"
              onSubmitEditing={() => brandRef.current?.focus()}
            />
          </View>
        )}
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
            ref={brandRef}
            placeholder="e.g. Dell, Samsung, Apple"
            className="p-4 text-green-900"
            value={form.brand}
            onChangeText={text => handleChange("brand", text)}
            returnKeyType="next"
            onSubmitEditing={() => modelRef.current?.focus()}
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
            ref={modelRef}
            placeholder="e.g. Inspiron 15, Galaxy S21"
            className="p-4 text-green-900"
            value={form.model}
            onChangeText={text => handleChange("model", text)}
            returnKeyType="next"
            onSubmitEditing={() => weightRef.current?.focus()}
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
              style={[
                {
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  flex: 1,
                  marginHorizontal: 4,
                  minWidth: '45%',
                  alignItems: 'center',
                },
                form.condition === cond 
                  ? {
                      backgroundColor: '#10b981',
                      borderColor: '#10b981',
                      shadowColor: '#10b981',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                  : {
                      backgroundColor: '#ffffff',
                      borderColor: '#bbf7d0',
                    }
              ]}
              onPress={() => {
                console.log('Condition selected:', cond); // Add this for debugging
                setForm(prev => ({ ...prev, condition: cond }));
                setErrors(prev => ({ ...prev, condition: "" }));
              }}
            >
              <Text 
                style={[
                  { fontWeight: form.condition === cond ? 'bold' : 'normal' },
                  form.condition === cond 
                    ? { color: '#ffffff' }
                    : { color: '#047857' }
                ]}
              >
                {cond}
              </Text>
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
        <Text className="text-green-800 font-medium mb-2">Estimated Weight (kg)</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100 flex-row items-center">
          <TextInput
            ref={weightRef}
            placeholder="e.g. 2.5"
            className="p-4 flex-1 text-green-900"
            value={form.weight}
            onChangeText={text => handleChange("weight", text.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            returnKeyType="next"
            onSubmitEditing={() => notesRef.current?.focus()}
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
        <Text className="text-green-800 font-medium mb-2">Additional Notes</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            ref={notesRef}
            placeholder="Any special instructions or additional information?"
            className="p-4 text-green-900 h-20"
            value={form.notes}
            onChangeText={text => handleChange("notes", text)}
            multiline
            textAlignVertical="top"
            blurOnSubmit={true}
          />
        </View>
      </View>
    </Animated.View>
  );

  // Render photo upload section
  const renderPhotoUpload = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Text className="text-green-700 text-xl font-bold mb-6 text-center">
        Device Photos & Documents
      </Text>
      
      {/* Device Images Section */}
      <View className="mb-6">
        <Text className="text-green-800 font-medium mb-3">Device Photos (Optional)</Text>
        <Text className="text-green-600 text-sm mb-3">
          Add photos of your device to help us provide better service
        </Text>
        
        {/* Add Image Button */}
        <TouchableOpacity
          onPress={() => setShowImageOptions(true)}
          className="bg-green-100 border-2 border-dashed border-green-300 rounded-2xl p-6 items-center justify-center mb-4"
        >
          <Ionicons name="camera" size={32} color="#10b981" />
          <Text className="text-green-700 font-medium mt-2">Add Device Photos</Text>
          <Text className="text-green-500 text-xs">Tap to take photo or select from gallery</Text>
        </TouchableOpacity>

        {/* Display Selected Images */}
        {deviceImages.length > 0 && (
          <View>
            <Text className="text-green-700 font-medium mb-2">Selected Photos ({deviceImages.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {deviceImages.map((image, index) => (
                <View key={index} className="mr-3 relative">
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImageIndex(index);
                      setImagePreviewModal(true);
                    }}
                  >
                    <Image 
                      source={{ uri: image.uri }} 
                      className="w-20 h-20 rounded-xl"
                      style={{ width: 80, height: 80 }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Documents Section */}
      <View className="mb-6">
        <Text className="text-green-800 font-medium mb-3">Supporting Documents (Optional)</Text>
        <Text className="text-green-600 text-sm mb-3">
          Purchase receipt, warranty card, or other relevant documents
        </Text>
        
        {/* Add Document Button */}
        <TouchableOpacity
          onPress={pickDocument}
          className="bg-blue-100 border-2 border-dashed border-blue-300 rounded-2xl p-6 items-center justify-center mb-4"
        >
          <Ionicons name="document" size={32} color="#3b82f6" />
          <Text className="text-blue-700 font-medium mt-2">Add Documents</Text>
          <Text className="text-blue-500 text-xs">PDF, images, or text files</Text>
        </TouchableOpacity>

        {/* Display Selected Documents */}
        {documents.length > 0 && (
          <View>
            <Text className="text-green-700 font-medium mb-2">Selected Documents ({documents.length})</Text>
            {documents.map((doc, index) => (
              <View key={index} className="bg-white rounded-xl p-3 mb-2 flex-row items-center justify-between border border-gray-200">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="document-text" size={20} color="#6b7280" />
                  <Text className="text-gray-700 ml-2 flex-1" numberOfLines={1}>
                    {doc.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeDocument(index)}
                  className="bg-red-100 rounded-full p-1"
                >
                  <Ionicons name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Tips Section */}
      <View className="bg-green-50 rounded-2xl p-4 border border-green-200">
        <View className="flex-row items-center mb-2">
          <Ionicons name="information-circle" size={20} color="#10b981" />
          <Text className="text-green-800 font-medium ml-2">Photo Tips</Text>
        </View>
        <Text className="text-green-700 text-sm leading-5">
          • Take clear photos showing device condition{'\n'}
          • Include serial numbers if visible{'\n'}
          • Show any damage or wear{'\n'}
          • Include original packaging if available
        </Text>
      </View>
    </Animated.View>
  );

  // Render address section with location button
  const renderAddressInfo = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Text className="text-green-700 text-xl font-bold mb-6 text-center">
        Pickup Address
      </Text>

      {/* Location Fetch Button */}
      <TouchableOpacity
        onPress={fetchCurrentLocation}
        disabled={isFetchingLocation}
        className="bg-blue-500 rounded-2xl p-4 flex-row items-center justify-center mb-6"
      >
        {isFetchingLocation ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="location" size={20} color="#fff" />
            <Text className="text-white font-medium ml-2">Use My Current Location</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Pickup Address */}
      <View className="mb-5">
        <Text className="text-green-800 font-medium mb-2">Pickup Address *</Text>
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-green-100">
          <TextInput
            ref={addressRef}
            placeholder="Building name, street, area"
            className="p-4 text-green-900 h-20"
            value={form.pickupAddress}
            onChangeText={text => handleChange("pickupAddress", text)}
            multiline
            textAlignVertical="top"
            returnKeyType="next"
            onSubmitEditing={() => cityRef.current?.focus()}
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
            ref={cityRef}
            placeholder="City"
            className="p-4 text-green-900"
            value={form.city}
            onChangeText={text => handleChange("city", text)}
            returnKeyType="next"
            onSubmitEditing={() => stateRef.current?.focus()}
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
            ref={stateRef}
            placeholder="State"
            className="p-4 text-green-900"
            value={form.state}
            onChangeText={text => handleChange("state", text)}
            returnKeyType="next"
            onSubmitEditing={() => pincodeRef.current?.focus()}
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
            ref={pincodeRef}
            placeholder="6-digit pincode"
            className="p-4 text-green-900"
            value={form.pincode}
            onChangeText={text => handleChange("pincode", text.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
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
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
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

      {/* Summary */}
      <View className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200">
        <Text className="text-green-800 font-bold mb-3">Pickup Summary</Text>
        <Text className="text-green-700 text-sm">
          Device: {form.brand} {form.model} ({form.deviceType}){'\n'}
          Condition: {form.condition}{'\n'}
          Photos: {deviceImages.length} attached{'\n'}
          Documents: {documents.length} attached{'\n'}
          Address: {form.city}, {form.state} - {form.pincode}
        </Text>
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-green-50"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
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
              {[0, 1, 2, 3].map((i) => (
                <View 
                  key={i} 
                  className={`h-2 rounded-full mx-1 ${currentSection === i ? 'bg-green-300 w-8' : 'bg-green-400 w-2'}`}
                />
              ))}
            </View>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 px-5 mt-5" 
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {currentSection === 0 && renderDeviceInfo()}
            {currentSection === 1 && renderPhotoUpload()}
            {currentSection === 2 && renderAddressInfo()}
            {currentSection === 3 && renderSchedulingInfo()}
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
                
                {currentSection < 3 && (
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

          {/* Image Options Modal */}
          <Modal
            visible={showImageOptions}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowImageOptions(false)}
          >
            <View className="flex-1 justify-end bg-black bg-opacity-50">
              <View className="bg-white rounded-t-3xl p-6">
                <Text className="text-xl font-bold text-center mb-6">Add Device Photo</Text>
                
                <TouchableOpacity
                  onPress={pickImageFromCamera}
                  className="bg-green-100 rounded-2xl p-4 mb-4 flex-row items-center"
                >
                  <Ionicons name="camera" size={24} color="#10b981" />
                  <Text className="text-green-800 font-medium ml-3">Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={pickImageFromGallery}
                  className="bg-blue-100 rounded-2xl p-4 mb-4 flex-row items-center"
                >
                  <Ionicons name="images" size={24} color="#3b82f6" />
                  <Text className="text-blue-800 font-medium ml-3">Choose from Gallery</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowImageOptions(false)}
                  className="bg-gray-100 rounded-2xl p-4 flex-row items-center justify-center"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Image Preview Modal */}
          <Modal
            visible={imagePreviewModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setImagePreviewModal(false)}
          >
            <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
              <View className="relative">
                <Image 
                  source={{ uri: deviceImages[selectedImageIndex]?.uri }} 
                  style={{ width: width - 40, height: width - 40 }}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  onPress={() => setImagePreviewModal(false)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          {/* Recycler Selection Modal */}
          <Modal
            visible={showRecyclerModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowRecyclerModal(false)}
          >
            <View className="flex-1 bg-green-50">
              {/* Header */}
              <View className="bg-green-600 px-6 pt-16 pb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-xl font-bold">Choose Your Recycler</Text>
                  <TouchableOpacity
                    onPress={() => setShowRecyclerModal(false)}
                    className="bg-green-700 rounded-full p-2"
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-green-100 text-sm mt-2">
                  Select a recycler to handle your e-waste pickup
                </Text>
              </View>

              {/* Recyclers List */}
              <ScrollView className="flex-1 px-4 py-4">
                {loadingRecyclers ? (
                  <View className="flex-1 justify-center items-center py-20">
                    <ActivityIndicator size="large" color="#059669" />
                    <Text className="text-green-600 mt-4 text-center">Loading recyclers...</Text>
                  </View>
                ) : recyclers.length === 0 ? (
                  <View className="flex-1 justify-center items-center py-20">
                    <Ionicons name="business-outline" size={64} color="#9ca3af" />
                    <Text className="text-gray-500 text-lg font-medium mt-4">No Recyclers Found</Text>
                    <Text className="text-gray-400 text-center mt-2 px-8">
                      No recyclers are currently available. Please try again later.
                    </Text>
                  </View>
                ) : (
                  recyclers.map((recycler, index) => (
                    <View
                      key={recycler.id}
                      className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border ${
                        selectedRecycler?.id === recycler.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      {/* Company Header */}
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-green-800 text-lg font-bold">{recycler.companyName}</Text>
                          <Text className="text-green-600 text-sm">Owner: {recycler.ownerName}</Text>
                        </View>
                        <View className="bg-green-100 rounded-full px-3 py-1">
                          <Text className="text-green-700 text-xs font-medium">#{index + 1}</Text>
                        </View>
                      </View>

                      {/* Contact Info */}
                      <View className="mb-3">
                        <View className="flex-row items-center mb-1">
                          <Ionicons name="mail" size={16} color="#059669" />
                          <Text className="text-gray-700 text-sm ml-2">{recycler.email}</Text>
                        </View>
                        <View className="flex-row items-center mb-1">
                          <Ionicons name="call" size={16} color="#059669" />
                          <Text className="text-gray-700 text-sm ml-2">{recycler.phoneNumber}</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="location" size={16} color="#059669" />
                          <Text className="text-gray-700 text-sm ml-2">{recycler.city}, {recycler.state} - {recycler.pincode}</Text>
                        </View>
                      </View>

                      {/* Address */}
                      <View className="mb-3 bg-gray-50 rounded-lg p-3">
                        <Text className="text-gray-600 text-sm">{recycler.address}</Text>
                      </View>

                      {/* Services */}
                      {recycler.servicesOffered && recycler.servicesOffered.length > 0 && (
                        <View className="mb-3">
                          <Text className="text-green-700 text-sm font-medium mb-2">Services Offered:</Text>
                          <View className="flex-row flex-wrap">
                            {recycler.servicesOffered.map((service, serviceIndex) => (
                              <View key={serviceIndex} className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2">
                                <Text className="text-blue-700 text-xs">{service}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Operating Hours */}
                      <View className="mb-4">
                        <View className="flex-row items-center">
                          <Ionicons name="time" size={16} color="#059669" />
                          <Text className="text-green-700 text-sm font-medium ml-2">Operating Hours:</Text>
                        </View>
                        <Text className="text-gray-600 text-sm ml-6">{recycler.operatingHours}</Text>
                      </View>

                      {/* Website */}
                      {recycler.website && (
                        <View className="mb-4">
                          <View className="flex-row items-center">
                            <Ionicons name="globe" size={16} color="#059669" />
                            <Text className="text-blue-600 text-sm ml-2">{recycler.website}</Text>
                          </View>
                        </View>
                      )}

                      {/* Description */}
                      {recycler.description && (
                        <View className="mb-4 bg-green-50 rounded-lg p-3">
                          <Text className="text-green-700 text-sm font-medium mb-1">About:</Text>
                          <Text className="text-green-600 text-sm">{recycler.description}</Text>
                        </View>
                      )}

                      {/* Selection Button */}
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedRecycler(recycler);
                          setShowRecyclerModal(false);
                          proceedWithSubmission();
                        }}
                        className={`rounded-xl p-4 items-center justify-center ${
                          selectedRecycler?.id === recycler.id
                            ? 'bg-green-600'
                            : 'bg-green-500'
                        }`}
                        style={{
                          shadowColor: "#059669",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      >
                        <Text className="text-white font-semibold text-base">
                          {selectedRecycler?.id === recycler.id ? '✓ Selected - Schedule Pickup' : 'Select This Recycler'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>

              {/* Bottom Actions */}
              <View className="bg-white border-t border-gray-200 px-4 py-4">
                <TouchableOpacity
                  onPress={() => setShowRecyclerModal(false)}
                  className="bg-gray-100 rounded-xl p-4 items-center justify-center"
                >
                  <Text className="text-gray-700 font-medium">Cancel Selection</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          {/* Custom Alert Component */}
          <AlertComponent />

          {/* Celebration Modal */}
          <Modal
            visible={showCelebrationModal}
            transparent={true}
            animationType="none"
            onRequestClose={closeCelebrationModal}
          >
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
              {/* Confetti */}
              {confettiAnimations.map((anim, index) => (
                <Animated.View
                  key={`confetti-${index}`}
                  style={{
                    position: 'absolute',
                    transform: [
                      { translateX: anim.translateX },
                      { translateY: anim.translateY },
                      { rotate: anim.rotate.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg']
                      }) },
                      { scale: anim.scale }
                    ],
                  }}
                >
                  <View 
                    style={{
                      width: 8 + Math.random() * 6,
                      height: 8 + Math.random() * 6,
                      backgroundColor: ['#22c55e', '#10b981', '#06d6a0', '#ffd60a', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][Math.floor(Math.random() * 8)],
                      borderRadius: Math.random() > 0.5 ? 0 : 10,
                    }} 
                  />
                </Animated.View>
              ))}

              {/* Floating Icons */}
              {floatingIconsAnimations.map((anim, index) => {
                const icons = ['🌍', '♻️', '🌳', '💚', '✨', '⚡', '💧', '🔥'];
                return (
                  <Animated.View
                    key={`icon-${index}`}
                    style={{
                      position: 'absolute',
                      left: 50 + (index * (width - 100) / 8),
                      top: 200 + Math.random() * 400,
                      transform: [
                        { translateY: anim.translateY },
                      ],
                      opacity: anim.opacity,
                    }}
                  >
                    <Text style={{ fontSize: 24 + Math.random() * 16 }}>
                      {icons[index]}
                    </Text>
                  </Animated.View>
                );
              })}

              {/* Main Celebration Content */}
              <Animated.View
                style={{
                  transform: [{ scale: celebrationScale }],
                  opacity: celebrationOpacity,
                }}
                className="bg-white rounded-3xl p-8 mx-6 items-center shadow-2xl"
              >
                {/* Header */}
                <View className="items-center mb-6">
                  <View className="bg-green-100 rounded-full p-4 mb-4">
                    <Text style={{ fontSize: 48 }}>🎉</Text>
                  </View>
                  <Text className="text-green-800 text-2xl font-bold text-center mb-2">
                    Pickup Confirmed!
                  </Text>
                </View>

                {/* Message */}
                <View className="items-center mb-6">
                  <Text className="text-gray-700 text-lg text-center leading-6 mb-4">
                    You just turned trash into <Text style={{ fontSize: 18 }}>🌍</Text> treasure! <Text style={{ fontSize: 18 }}>💚</Text>
                  </Text>
                  <Text className="text-gray-600 text-base text-center leading-6 mb-4">
                    Thanks for choosing Recycle&apos;IT and making a real impact on sustainability. <Text style={{ fontSize: 16 }}>♻✨</Text>
                  </Text>
                  <Text className="text-gray-700 text-base text-center leading-6 mb-4">
                    Keep going — every device you recycle saves the planet! <Text style={{ fontSize: 16 }}>🌳⚡💧</Text>
                  </Text>
                  <Text className="text-green-700 text-base text-center leading-6 font-medium">
                    Keep up your streak <Text style={{ fontSize: 16 }}>🔥</Text> and climb the leaderboard — the planet is cheering for you! <Text style={{ fontSize: 16 }}>♻✨</Text>
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="w-full space-y-3">
                  <TouchableOpacity
                    onPress={() => {
                      closeCelebrationModal();
                      router.push("/(tabs)/home");
                    }}
                    className="bg-green-600 rounded-2xl p-4 items-center"
                    style={{
                      shadowColor: "#059669",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 6,
                    }}
                  >
                    <Text className="text-white text-lg font-bold">Continue to Home 🏠</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={closeCelebrationModal}
                    className="bg-gray-100 rounded-2xl p-4 items-center"
                  >
                    <Text className="text-gray-700 text-base font-medium">Close</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}