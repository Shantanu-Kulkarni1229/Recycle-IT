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
      'rgba(139, 92, 246, 1)' // Final purple
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
      <View style={{
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 6,
      }}>
        <Animated.View 
          style={{
            height: '100%',
            backgroundColor: color,
            borderRadius: 4,
            width: widthAnim,
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Animated Background with smoother gradient waves */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
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
            style={{
              height: screenHeight * 0.55,
              width: screenWidth,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          />
        </Animated.View>
        
        {/* Smoother floating eco elements */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 100,
            right: 48,
            opacity: 0.15,
            transform: [{ rotate: spin }, { scale: 1.2 }],
          }}
        >
          <Ionicons name="reload-circle" size={64} color="#fff" />
        </Animated.View>
        
        <Animated.View
          style={{
            position: 'absolute',
            top: 180,
            left: 40,
            opacity: 0.2,
            transform: [{ rotate: spin }],
          }}
        >
          <MaterialCommunityIcons name="recycle" size={48} color="#fff" />
        </Animated.View>
        
        <Animated.View
          style={{
            position: 'absolute',
            top: 140,
            right: 100,
            opacity: 0.25,
            transform: [{ rotate: spin }],
          }}
        >
          <FontAwesome5 name="leaf" size={42} color="#fff" />
        </Animated.View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        {/* Header with proper spacing */}
        <Animated.View
        style={{
          paddingTop: 20,
          paddingHorizontal: 24,
          paddingBottom: 24,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnimNative }],
        }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 16 , paddingTop: 10}}>
              <Text style={{ 
                color: '#fff', 
                fontSize: 36, 
                fontWeight: '800',
                marginBottom: 4,
                letterSpacing: -0.5,
              }}>
                Recycle IT
              </Text>
              <Text style={{ 
                color: '#a7f3d0', 
                fontSize: 16,
                lineHeight: 24,
                fontWeight: '500',
              }}>
                Responsible e-waste management for a sustainable future
              </Text>
            </View>
            
            {/* Notification Badge with smooth animation */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={{ position: 'relative' }}
            >
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: 14,
                borderRadius: 20,
                backdropFilter: 'blur(10px)',
              }}>
                <Ionicons name="notifications" size={26} color="#fff" />
              </View>
              <View style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: '#fbbf24',
                width: 22,
                height: 22,
                borderRadius: 11,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#fff',
              }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a' }}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Hero Section with enhanced truck animation */}
        <Animated.View
          style={{
            paddingHorizontal: 24,
            marginBottom: 24,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 28,
            padding: 28,
            shadowColor: '#047857',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 12,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{
                backgroundColor: '#dcfce7',
                padding: 20,
                borderRadius: 24,
                marginBottom: 20,
              }}>
                <MaterialCommunityIcons name="desktop-tower" size={48} color="#059669" />
              </View>
              
              <Text style={{
                color: '#1e293b',
                fontSize: 28,
                fontWeight: '800',
                textAlign: 'center',
                marginBottom: 12,
                letterSpacing: -0.5,
              }}>
                Schedule E-Waste Pickup
              </Text>
              
              <Text style={{
                color: '#64748b',
                textAlign: 'center',
                fontSize: 17,
                lineHeight: 26,
                marginBottom: 28,
                paddingHorizontal: 8,
              }}>
                Responsibly recycle your electronic waste with our certified partners. 
                We ensure data security and environmental compliance.
              </Text>
            </View>

            {/* Enhanced Custom Truck Animation Button */}
            <View style={{ position: 'relative', overflow: 'hidden', borderRadius: 20 }}>
              <Animated.View
                style={{
                  transform: [{ scale: buttonScaleAnim }],
                }}
              >
                <TouchableOpacity
                  onPress={animateTruckAndNavigate}
                  activeOpacity={0.95}
                  disabled={isAnimatingTruck}
                  style={{ position: 'relative', overflow: 'hidden', borderRadius: 20 }}
                >
                  {/* Dynamic Button Background with enhanced styling */}
                  <Animated.View
                    style={{
                      backgroundColor: buttonBackgroundColor,
                      paddingVertical: 20,
                      paddingHorizontal: 32,
                      borderRadius: 20,
                      shadowColor: '#047857',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: buttonShadowOpacity,
                      shadowRadius: 16,
                      elevation: 8,
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: 64, // Ensure consistent height
                    }}
                  >
                    {/* Animated Text with better positioning */}
                    <Animated.Text 
                      style={{
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: '700',
                        letterSpacing: 0.5,
                        opacity: textOpacityAnim,
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '50%',
                        marginTop: 6, // Half of text height for perfect centering
                      }}
                    >
                      Schedule Pickup
                    </Animated.Text>

                    {/* Enhanced Truck Animation with perfect sizing */}
                    <Animated.View
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        transform: [
                          { translateX: truckTranslateX },
                          { translateY: -14 } // Perfect vertical centering
                        ],
                        opacity: truckOpacityAnim,
                        zIndex: 10,
                      }}
                      pointerEvents="none"
                    >
                      <Text style={{ 
                        fontSize: 52,
                        textShadowColor: 'rgba(0,0,0,0.3)',
                        textShadowOffset: { width: 2, height: 2 },
                        textShadowRadius: 4,
                        // Remove rotate: '360deg' for emoji, or use flip if needed
                      }}>
                        🚛
                      </Text>
                    </Animated.View>

                    {/* Subtle gradient overlay for depth */}
                    <Animated.View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        // background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0))', // Not valid in React Native
                        backgroundColor: 'skyblue',
                        opacity: buttonBackgroundAnim,
                        borderRadius: 20,
                      }}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Quick Stats with better spacing */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 28,
              paddingTop: 24,
              borderTopWidth: 1,
              borderTopColor: '#f1f5f9',
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#10b981', fontSize: 24, fontWeight: '800' }}>
                  {impactCounter}kg
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 , marginLeft:2}}> 
                  E-Waste Recycled
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#3b82f6', fontSize: 24, fontWeight: '800' }}>
                  240+
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                  Businesses
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#8b5cf6', fontSize: 24, fontWeight: '800' }}>
                  42
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                  Tons CO₂ Saved
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* E-Waste Tips Card with better animations */}
        <Animated.View
          style={{
            marginHorizontal: 24,
            marginBottom: 24,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <LinearGradient
            colors={['#ecfdf5', '#d1fae5', '#a7f3d0']}
            locations={[0, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 24,
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="bulb" size={32} color="#059669" />
              <Text style={{
                color: '#047857',
                fontSize: 22,
                fontWeight: '700',
                flex: 1,
                marginLeft: 12,
              }}>
                E-Waste Tips
              </Text>
              <View style={{
                backgroundColor: '#059669',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                  TIP #{currentTip + 1}
                </Text>
              </View>
            </View>
            
            <Animated.Text
              style={{
                color: '#065f46',
                fontSize: 16,
                lineHeight: 24,
                opacity: tipFadeAnim,
                fontWeight: '500',
              }}
              key={currentTip}
            >
              {eWasteTips[currentTip]}
            </Animated.Text>
            
            {/* Progress indicators */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 20,
            }}>
              {eWasteTips.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor: index === currentTip ? '#059669' : '#86efac',
                  }}
                />
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Global E-Waste Statistics */}
        <Animated.View
          style={{
            marginHorizontal: 24,
            marginBottom: 24,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <LinearGradient
            colors={['#eff6ff', '#dbeafe', '#bfdbfe']}
            locations={[0, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 24,
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="stats-chart" size={32} color="#3b82f6" />
              <Text style={{
                color: '#1e40af',
                fontSize: 22,
                fontWeight: '700',
                marginLeft: 12,
              }}>
                Global E-Waste Statistics
              </Text>
            </View>
            
            <View style={{ gap: 20 }}>
              {statsData.map((stat, index) => (
                <View key={index}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}>
                    <Text style={{ color: '#1d4ed8', fontSize: 15, fontWeight: '500', flex: 1 }}>
                      {stat.label}
                    </Text>
                    <Text style={{ color: '#1e40af', fontWeight: '800', fontSize: 16 }}>
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
          style={{
            marginHorizontal: 24,
            marginBottom: 24,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              color: '#1e293b',
              fontSize: 22,
              fontWeight: '700',
              marginBottom: 4,
            }}>
              E-Waste Categories
            </Text>
            <Text style={{ color: '#64748b', fontSize: 15 }}>
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
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {/* Category 1 */}
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                width: 160,
                shadowColor: '#64748b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}>
                <View style={{
                  backgroundColor: '#dbeafe',
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 12,
                  alignSelf: 'flex-start',
                }}>
                  <Ionicons name="phone-portrait" size={28} color="#3b82f6" />
                </View>
                <Text style={{
                  color: '#1e293b',
                  fontWeight: '600',
                  fontSize: 16,
                  marginBottom: 4,
                }}>
                  Mobile Devices
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 18 }}>
                  Phones, Tablets, Smartwatches
                </Text>
              </View>
              
              {/* Category 2 */}
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                width: 160,
                shadowColor: '#64748b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}>
                <View style={{
                  backgroundColor: '#dcfce7',
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 12,
                  alignSelf: 'flex-start',
                }}>
                  <Ionicons name="laptop" size={28} color="#10b981" />
                </View>
                <Text style={{
                  color: '#1e293b',
                  fontWeight: '600',
                  fontSize: 16,
                  marginBottom: 4,
                }}>
                  Computers
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 18 }}>
                  Laptops, Desktops, Servers
                </Text>
              </View>
              
              {/* Category 3 */}
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                width: 160,
                shadowColor: '#64748b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}>
                <View style={{
                  backgroundColor: '#fef3c7',
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 12,
                  alignSelf: 'flex-start',
                }}>
                  <Ionicons name="tv" size={28} color="#f59e0b" />
                </View>
                <Text style={{
                  color: '#1e293b',
                  fontWeight: '600',
                  fontSize: 16,
                  marginBottom: 4,
                }}>
                  Entertainment
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 18 }}>
                  TVs, Speakers, Game Consoles
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Recycling Centers */}
        <Animated.View
          style={{
            marginHorizontal: 24,
            marginBottom: 24,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <LinearGradient
            colors={['#fffbeb', '#fef3c7', '#fed7aa']}
            locations={[0, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 24,
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="location" size={32} color="#d97706" />
              <Text style={{
                color: '#92400e',
                fontSize: 22,
                fontWeight: '700',
                flex: 1,
                marginLeft: 12,
              }}>
                Certified E-Waste Centers
              </Text>
              <Text style={{ color: '#a16207', fontSize: 14, fontWeight: '600' }}>
                📍 3.2km
              </Text>
            </View>
            
            <Text style={{
              color: '#a16207',
              fontSize: 16,
              lineHeight: 24,
              marginBottom: 20,
              fontWeight: '500',
            }}>
              Our certified partners ensure secure data destruction and environmentally 
              compliant recycling processes for all your e-waste.
            </Text>
            
            <TouchableOpacity 
              style={{
                backgroundColor: '#f59e0b',
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#d97706',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: 16,
                marginRight: 8,
              }}>
                Find Centers
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Environmental Impact */}
        <Animated.View
          style={{
            marginHorizontal: 24,
            marginBottom: 32,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimNative }],
          }}
        >
          <LinearGradient
            colors={['#faf5ff', '#f3e8ff', '#e9d5ff']}
            locations={[0, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 24,
              shadowColor: '#8b5cf6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="earth" size={32} color="#8b5cf6" />
              <Text style={{
                color: '#6b21a8',
                fontSize: 22,
                fontWeight: '700',
                marginLeft: 12,
              }}>
                Your Impact Matters
              </Text>
            </View>
            
            <View style={{ gap: 16 }}>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                padding: 16,
                borderRadius: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#8b5cf6',
              }}>
                <Text style={{
                  color: '#7c3aed',
                  fontSize: 15,
                  fontWeight: '600',
                  lineHeight: 22,
                }}>
                  💻 Recycling one laptop saves enough energy to power a home for 4 hours
                </Text>
              </View>
              
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                padding: 16,
                borderRadius: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#8b5cf6',
              }}>
                <Text style={{
                  color: '#7c3aed',
                  fontSize: 15,
                  fontWeight: '600',
                  lineHeight: 22,
                }}>
                  📱 1 million phones can yield 35,000 lbs of copper, 772 lbs of silver, and 75 lbs of gold
                </Text>
              </View>
              
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                padding: 16,
                borderRadius: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#8b5cf6',
              }}>
                <Text style={{
                  color: '#7c3aed',
                  fontSize: 15,
                  fontWeight: '600',
                  lineHeight: 22,
                }}>
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