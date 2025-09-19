import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  
  // Separate animation values for native and non-native drivers
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnimNative = useRef(new Animated.Value(50)).current; // For native transforms
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current; // Non-native for width
  const tipFadeAnim = useRef(new Animated.Value(1)).current;
  
  // Enhanced truck animation values
  const truckPositionAnim = useRef(new Animated.Value(0)).current;
  const truckOpacityAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const textOpacityAnim = useRef(new Animated.Value(1)).current;
  const buttonBackgroundAnim = useRef(new Animated.Value(0)).current; // Non-native for background
  
  // State for dynamic content
  const [currentTip, setCurrentTip] = useState(0);
  const [impactCounter, setImpactCounter] = useState(0);
  const [isAnimatingTruck, setIsAnimatingTruck] = useState(false);
  
  const eWasteTips = [
    "📱 Donate or sell old electronics that still work instead of discarding them",
    "🔋 Remove batteries from devices before recycling - they require special handling",
    "💻 Wipe all personal data from devices before recycling or donating",
    "🖨️ Check with manufacturers for take-back programs for their products",
    "🔌 Keep cables and accessories together - they're more valuable when complete",
    "🌍 E-waste contains precious metals - proper recycling conserves resources",
  ];

  const statsData = [
    { value: "53.6M", label: "E-waste generated globally (tons)", progress: 0.78, color: "#10b981" },
    { value: "17.4%", label: "E-waste properly recycled", progress: 0.174, color: "#3b82f6" },
    { value: "$57B", label: "Value of raw materials dumped", progress: 0.62, color: "#f59e0b" },
  ];

  // Initialize animations
  useEffect(() => {
    // Staggered entrance animations for smoother loading
    const animateEntrance = () => {
      Animated.stagger(150, [
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimNative, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Progress animation with delay
    const animateProgress = () => {
      setTimeout(() => {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // Non-native for width
        }).start();
      }, 400);
    };

    animateEntrance();
    animateProgress();

    // Smoother continuous rotation for eco icons
    const createSmoothRotateAnimation = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };
    createSmoothRotateAnimation();

    // Smoother wave effect for background
    const createSmoothWaveAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    createSmoothWaveAnimation();

    // Smoother tip cycling with fade transition
    const tipInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(tipFadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(tipFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentTip((prev) => (prev + 1) % eWasteTips.length);
    }, 4000);

    // Smoother counter animation
    const counterInterval = setInterval(() => {
      setImpactCounter((prev) => {
        if (prev < 1250) {
          return prev + 8; // Slower increment for smoother counting
        }
        return 0;
      });
    }, 80);

    return () => {
      clearInterval(tipInterval);
      clearInterval(counterInterval);
    };
  }, []);

  // Enhanced truck animation function with perfect timing
  const animateTruckAndNavigate = useCallback(() => {
    if (isAnimatingTruck) return;
    
    setIsAnimatingTruck(true);

    // Reset all animation values to initial state
    truckPositionAnim.setValue(0);
    truckOpacityAnim.setValue(0);
    textOpacityAnim.setValue(1);
    buttonBackgroundAnim.setValue(0);
    buttonScaleAnim.setValue(1);

    // Create the perfect truck animation sequence
    Animated.sequence([
      // 1. Button press feedback (quick and subtle)
      Animated.timing(buttonScaleAnim, {
        toValue: 0.96,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      
      // 2. Button returns to normal size while truck appears
      Animated.parallel([
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        // Truck fades in quickly
        Animated.timing(truckOpacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      
      // 3. Main truck journey with synchronized effects
      Animated.parallel([
        // Truck moves smoothly across the button
        Animated.timing(truckPositionAnim, {
          toValue: 1,
          duration: 3000, // 3 seconds for smooth journey
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        // Text starts fading when truck is 25% across
        Animated.timing(textOpacityAnim, {
          toValue: 0,
          duration: 1000,
          delay: 500, // Start fading when truck is 25% across
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Button background starts changing when truck is 20% across
        Animated.timing(buttonBackgroundAnim, {
          toValue: 1,
          duration: 1500,
          delay: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
      
      // 4. Hold the final state briefly
      Animated.delay(300),
      
      // 5. Truck disappears and button returns to original state
      Animated.parallel([
        Animated.timing(truckOpacityAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        // Button background returns to original
        Animated.timing(buttonBackgroundAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        // Text comes back
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 400,
          delay: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      
    ]).start(() => {
      setIsAnimatingTruck(false);
      // Navigate after complete animation
      setTimeout(() => {
        router.push("/pickup-schedule");
      }, 200);
    });
  }, [isAnimatingTruck, router]);

  // Interpolated values for smoother animations
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const waveTranslateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0.8],
  });

  // Enhanced truck position interpolation - perfectly sized for button
  const truckTranslateX = truckPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [320, -40], // Start from right (320), end at left (-40)
  });

  // Enhanced button background color interpolation with smoother transition
  const buttonBackgroundColor = buttonBackgroundAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      'rgba(16, 185, 129, 1)', // Original green
      'rgba(59, 130, 246, 0.8)', // Mid-transition blue
      'rgba(139, 92, 246, 1)' // Final blue
    ],
  });

  // Add subtle shadow animation
  const buttonShadowOpacity = buttonBackgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  // Progress Bar Component
  type ProgressBarProps = {
    progress: number;
    color: string;
  };

  const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color }) => {
    const widthAnim = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', `${progress * 100}%`],
    });

    return (
      <View className="h-2 bg-slate-100 rounded-1 overflow-hidden mt-1.5">
        <Animated.View 
          className="h-full rounded-1"
          style={{
            backgroundColor: color,
            width: widthAnim,
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Animated Background with smoother gradient waves */}
      <View className="absolute inset-0">
        <Animated.View
          style={{
            transform: [{ translateY: waveTranslateY }],
            opacity: waveOpacity,
          }}
        >
          <LinearGradient
            colors={['#059669', '#10b981', '#34d399', '#6ee7b7']}
            locations={[0, 0.3, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-b-[32px]"
            style={{
              height: screenHeight * 0.55,
              width: screenWidth,
            }}
          />
        </Animated.View>
        
        {/* Smoother floating eco elements */}
        <Animated.View
          className="absolute top-[100px] right-12 opacity-15"
          style={{
            transform: [{ rotate: spin }, { scale: 1.2 }],
          }}
        >
          <Ionicons name="reload-circle" size={64} color="#fff" />
        </Animated.View>
        
        <Animated.View
          className="absolute top-[180px] left-10 opacity-20"
          style={{
            transform: [{ rotate: spin }],
          }}
        >
          <MaterialCommunityIcons name="recycle" size={48} color="#fff" />
        </Animated.View>
        
        <Animated.View
          className="absolute top-[140px] right-[100px] opacity-25"
          style={{
            transform: [{ rotate: spin }],
          }}
        >
          <FontAwesome5 name="leaf" size={42} color="#fff" />
        </Animated.View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        {/* Header with proper spacing */}
        <Animated.View
        className="pt-5 px-6 pb-6"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnimNative }],
        }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4 pt-[10px]">
              <Text className="text-white text-4xl font-black mb-1 tracking-tight">
                Recycle IT
              </Text>
              <Text className="text-green-200 text-base leading-6 font-medium">
                Responsible e-waste management for a sustainable future
              </Text>
            </View>
            
            {/* Notification Badge with smooth animation */}
            <TouchableOpacity 
              activeOpacity={0.8}
              className="relative"
            >
              <View className="bg-white/20 p-[14px] rounded-[20px] backdrop-blur-sm">
                <Ionicons name="notifications" size={26} color="#fff" />
              </View>
              <View className="absolute -top-0.5 -right-0.5 bg-amber-400 w-[22px] h-[22px] rounded-[11px] items-center justify-center border-2 border-white">
                <Text className="text-xs font-bold text-slate-900">2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Hero Section with enhanced truck animation */}
        <Animated.View
          className="px-6 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View className="bg-white rounded-[28px] p-7 shadow-lg shadow-green-800/15 elevation-12">
            <View className="items-center mb-5">
              <View className="bg-green-100 p-5 rounded-6 mb-5">
                <MaterialCommunityIcons name="desktop-tower" size={48} color="#059669" />
              </View>
              
              <Text className="text-slate-800 text-[28px] font-black text-center mb-3 tracking-tight">
                Schedule E-Waste Pickup
              </Text>
              
              <Text className="text-slate-500 text-center text-[17px] leading-[26px] mb-7 px-2">
                Responsibly recycle your electronic waste with our certified partners. 
                We ensure data security and environmental compliance.
              </Text>
            </View>

            {/* Enhanced Custom Truck Animation Button */}
            <View className="relative overflow-hidden rounded-[32px]">
              <Animated.View
                style={{
                  transform: [{ scale: buttonScaleAnim }],
                }}
              >
                <TouchableOpacity
                  onPress={animateTruckAndNavigate}
                  activeOpacity={0.95}
                  disabled={isAnimatingTruck}
                  className="relative overflow-hidden rounded-[32px]"
                >
                  {/* Dynamic Button Background with enhanced styling */}
                  <Animated.View
                    className="py-5 px-8 rounded-[32px] relative overflow-hidden min-h-[64px]"
                    style={{
                      backgroundColor: buttonBackgroundColor,
                      shadowColor: '#047857',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: buttonShadowOpacity,
                      shadowRadius: 16,
                      elevation: 8,
                    }}
                  >
                    {/* Animated Text with better positioning */}
                    <Animated.Text 
                      className="text-white text-center text-lg font-bold tracking-wider absolute left-0 right-0 top-1/2 mt-1.5"
                      style={{
                        opacity: textOpacityAnim,
                      }}
                    >
                      Schedule Pickup
                    </Animated.Text>

                    {/* Enhanced Truck Animation with perfect sizing */}
                    <Animated.View
                      className="absolute top-1/2 left-0 right-0 z-10 pointer-events-none"
                      style={{
                        transform: [
                          { translateX: truckTranslateX },
                          { translateY: -14 } // Perfect vertical centering
                        ],
                        opacity: truckOpacityAnim,
                      }}
                    >
                      <Text className="text-[52px]" style={{ 
                        textShadowColor: 'rgba(0,0,0,0.3)',
                        textShadowOffset: { width: 2, height: 2 },
                        textShadowRadius: 4,
                      }}>
                        🚛
                      </Text>
                    </Animated.View>

                    {/* Subtle gradient overlay for depth */}
                    <Animated.View
                      className="absolute inset-0 bg-sky-500 rounded-[32px]"
                      style={{
                        opacity: buttonBackgroundAnim,
                      }}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Quick Stats with better spacing */}
            <View className="flex-row justify-around mt-7 pt-6 border-t border-slate-100">
              <View className="items-center">
                <Text className="text-green-500 text-2xl font-black">
                  {impactCounter}kg
                </Text>
                <Text className="text-slate-500 text-xs mt-1 ml-0.5"> 
                  E-Waste Recycled
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-blue-500 text-2xl font-black">
                  240+
                </Text>
                <Text className="text-slate-500 text-xs mt-1">
                  Businesses
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-blue-500 text-2xl font-black">
                  42
                </Text>
                <Text className="text-slate-500 text-xs mt-1">
                  Tons CO₂ Saved
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* E-Waste Tips Card with better animations */}
        <Animated.View
          className="mx-6 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <LinearGradient
            colors={['#ecfdf5', '#d1fae5', '#a7f3d0']}
            locations={[0, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-6 p-6 shadow-lg shadow-green-600/10 elevation-6"
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="bulb" size={32} color="#059669" />
              <Text className="text-green-800 text-[22px] font-bold flex-1 ml-3">
                E-Waste Tips
              </Text>
              <View className="bg-green-600 px-3 py-1.5 rounded-4">
                <Text className="text-white text-xs font-bold">
                  TIP #{currentTip + 1}
                </Text>
              </View>
            </View>
            
            <Animated.Text
              className="text-green-900 text-base leading-6 font-medium"
              style={{
                opacity: tipFadeAnim,
              }}
              key={currentTip}
            >
              {eWasteTips[currentTip]}
            </Animated.Text>
            
            {/* Progress indicators */}
            <View className="flex-row justify-center mt-5">
              {eWasteTips.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-1 mx-1 ${
                    index === currentTip ? 'bg-green-600' : 'bg-green-300'
                  }`}
                />
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Global E-Waste Statistics */}
        <Animated.View
          className="mx-6 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <LinearGradient
            colors={['#eff6ff', '#dbeafe', '#bfdbfe']}
            locations={[0, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-6 p-6 shadow-lg shadow-blue-500/10 elevation-6"
          >
            <View className="flex-row items-center mb-5">
              <Ionicons name="stats-chart" size={32} color="#3b82f6" />
              <Text className="text-blue-800 text-[22px] font-bold ml-3">
                Global E-Waste Statistics
              </Text>
            </View>
            
            <View className="gap-5">
              {statsData.map((stat, index) => (
                <View key={index}>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-blue-700 text-[15px] font-medium flex-1">
                      {stat.label}
                    </Text>
                    <Text className="text-blue-800 font-black text-base">
                      {stat.value}
                    </Text>
                  </View>
                  <ProgressBar progress={stat.progress} color={stat.color} />
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* E-Waste Categories with horizontal scroll */}
        <Animated.View
          className="mx-6 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <View className="mb-4">
            <Text className="text-slate-800 text-[22px] font-bold mb-1">
              E-Waste Categories
            </Text>
            <Text className="text-slate-500 text-[15px]">
              We accept these types of electronic waste
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
            decelerationRate="fast"
            snapToInterval={160}
            snapToAlignment="start"
          >
            <View className="flex-row gap-4">
              {/* Category 1 */}
              <View className="bg-white rounded-5 p-5 w-40 shadow-md shadow-slate-500/10 elevation-4">
                <View className="bg-blue-100 p-3 rounded-4 mb-3 self-start">
                  <Ionicons name="phone-portrait" size={28} color="#3b82f6" />
                </View>
                <Text className="text-slate-800 font-semibold text-base mb-1">
                  Mobile Devices
                </Text>
                <Text className="text-slate-500 text-xs leading-[18px]">
                  Phones, Tablets, Smartwatches
                </Text>
              </View>
              
              {/* Category 2 */}
              <View className="bg-white rounded-5 p-5 w-40 shadow-md shadow-slate-500/10 elevation-4">
                <View className="bg-green-100 p-3 rounded-4 mb-3 self-start">
                  <Ionicons name="laptop" size={28} color="#10b981" />
                </View>
                <Text className="text-slate-800 font-semibold text-base mb-1">
                  Computers
                </Text>
                <Text className="text-slate-500 text-xs leading-[18px]">
                  Laptops, Desktops, Servers
                </Text>
              </View>
              
              {/* Category 3 */}
              <View className="bg-white rounded-5 p-5 w-40 shadow-md shadow-slate-500/10 elevation-4">
                <View className="bg-amber-100 p-3 rounded-4 mb-3 self-start">
                  <Ionicons name="tv" size={28} color="#f59e0b" />
                </View>
                <Text className="text-slate-800 font-semibold text-base mb-1">
                  Entertainment
                </Text>
                <Text className="text-slate-500 text-xs leading-[18px]">
                  TVs, Speakers, Game Consoles
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Recycling Centers */}
        <Animated.View
          className="mx-6 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <LinearGradient
            colors={['#fffbeb', '#fef3c7', '#fed7aa']}
            locations={[0, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-6 p-6 shadow-lg shadow-amber-500/10 elevation-6"
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="location" size={32} color="#d97706" />
              <Text className="text-amber-900 text-[22px] font-bold flex-1 ml-3">
                Certified E-Waste Centers
              </Text>
              <Text className="text-amber-700 text-sm font-semibold">
                📍 3.2km
              </Text>
            </View>
            
            <Text className="text-amber-700 text-base leading-6 mb-5 font-medium">
              Our certified partners ensure secure data destruction and environmentally 
              compliant recycling processes for all your e-waste.
            </Text>
            
            <TouchableOpacity 
              className="bg-amber-500 py-3.5 px-6 rounded-4 flex-row items-center justify-center shadow-lg shadow-amber-600/20 elevation-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base mr-2">
                Find Centers
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Environmental Impact */}
        <Animated.View
          className="mx-6 mb-8"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <LinearGradient
            colors={['#f0f9ff', '#e0f2fe', '#bae6fd']}
            locations={[0, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-6 p-6 shadow-lg shadow-sky-500/10 elevation-6"
          >
            <View className="flex-row items-center mb-5">
              <Ionicons name="earth" size={32} color="#0284c7" />
              <Text className="text-sky-700 text-[22px] font-bold ml-3">
                Your Impact Matters
              </Text>
            </View>
            
            <View className="gap-4">
              <View className="bg-white/60 p-4 rounded-4 border-l-4 border-sky-500">
                <Text className="text-sky-700 text-[15px] font-semibold leading-[22px]">
                  💻 Recycling one laptop saves enough energy to power a home for 4 hours
                </Text>
              </View>
              
              <View className="bg-white/60 p-4 rounded-4 border-l-4 border-sky-500">
                <Text className="text-sky-700 text-[15px] font-semibold leading-[22px]">
                  📱 1 million phones can yield 35,000 lbs of copper, 772 lbs of silver, and 75 lbs of gold
                </Text>
              </View>
              
              <View className="bg-white/60 p-4 rounded-4 border-l-4 border-sky-500">
                <Text className="text-sky-700 text-[15px] font-semibold leading-[22px]">
                  🔋 Proper e-waste recycling prevents heavy metals from contaminating soil and water
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}