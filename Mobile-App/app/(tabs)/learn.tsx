import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  FlatList,
} from "react-native";
import {
  Leaf,
  Globe,
  Recycle,
  Zap,
  Heart,
  Users,
  Droplets,
  Sun,
  Building2,
  Lightbulb,
  Shield,
  ChevronRight,
  Play,
  BookOpen,
  Award,
  Target,
  TrendingUp,
  Smartphone,
  Monitor,
  Battery,
  Cpu,
  Info,
  Star,
  Clock,
  CheckCircle,
  X,
  Trophy,
} from "lucide-react-native";

const { width, height } = Dimensions.get("window");

// SDG Data with colors and detailed info
const sdgData = [
  {
    id: 1,
    title: "No Poverty",
    icon: "🏠",
    color: "#E5383B",
    connection: "E-waste recycling creates jobs and income opportunities in developing communities.",
    impact: "Recycling 1 million phones can recover $30,000 worth of gold!",
    shortDesc: "End poverty in all its forms everywhere",
  },
  {
    id: 2,
    title: "Zero Hunger",
    icon: "🌾",
    color: "#DDA63A",
    connection: "Electronic waste contaminates soil, affecting food production and agricultural yields.",
    impact: "Proper e-waste disposal protects farmland from toxic contamination.",
    shortDesc: "End hunger, achieve food security and improved nutrition",
  },
  {
    id: 3,
    title: "Good Health",
    icon: "🏥",
    color: "#4C9F38",
    connection: "Toxic metals from e-waste cause cancer, respiratory diseases, and neurological disorders.",
    impact: "Proper recycling prevents 50+ toxic chemicals from entering our environment.",
    shortDesc: "Ensure healthy lives and promote well-being for all",
  },
  {
    id: 4,
    title: "Quality Education",
    icon: "📚",
    color: "#C5192D",
    connection: "Refurbished electronics provide educational tools for underprivileged students.",
    impact: "1 refurbished laptop can serve 10+ students in digital learning programs.",
    shortDesc: "Ensure inclusive and equitable quality education",
  },
  {
    id: 5,
    title: "Gender Equality",
    icon: "⚖️",
    color: "#FF3A21",
    connection: "E-waste recycling programs empower women through employment and entrepreneurship.",
    impact: "60% of informal e-waste workers are women - proper programs ensure fair wages.",
    shortDesc: "Achieve gender equality and empower all women and girls",
  },
  {
    id: 6,
    title: "Clean Water",
    icon: "💧",
    color: "#26BDE2",
    connection: "E-waste leaching contaminates groundwater with mercury, lead, and cadmium.",
    impact: "1 smartphone improperly disposed can pollute 60,000 liters of water.",
    shortDesc: "Ensure availability and sustainable management of water",
  },
  {
    id: 7,
    title: "Clean Energy",
    icon: "⚡",
    color: "#FCC30B",
    connection: "Recycling batteries and solar panels supports renewable energy infrastructure.",
    impact: "Recycled lithium can power 1000+ new electric vehicle batteries.",
    shortDesc: "Ensure access to affordable, reliable, sustainable energy",
  },
  {
    id: 8,
    title: "Economic Growth",
    icon: "💼",
    color: "#A21942",
    connection: "E-waste industry creates millions of jobs in collection, processing, and manufacturing.",
    impact: "The global e-waste recycling market is worth $60+ billion annually.",
    shortDesc: "Promote sustained, inclusive economic growth and employment",
  },
  {
    id: 9,
    title: "Innovation",
    icon: "🏭",
    color: "#FD6925",
    connection: "Recycled materials drive innovation in sustainable technology and manufacturing.",
    impact: "95% of materials in electronics can be recovered and reused.",
    shortDesc: "Build resilient infrastructure, promote industrialization",
  },
  {
    id: 10,
    title: "Reduced Inequalities",
    icon: "🤝",
    color: "#DD1367",
    connection: "Digital divide is reduced when old devices are refurbished for underprivileged communities.",
    impact: "Bridging the digital gap through responsible e-waste management.",
    shortDesc: "Reduce inequality within and among countries",
  },
  {
    id: 11,
    title: "Sustainable Cities",
    icon: "🏙️",
    color: "#FD9D24",
    connection: "Smart e-waste management is essential for sustainable urban development.",
    impact: "Cities generate 70% of global e-waste - proper management is crucial.",
    shortDesc: "Make cities and human settlements inclusive and sustainable",
  },
  {
    id: 12,
    title: "Responsible Consumption",
    icon: "♻️",
    color: "#BF8B2E",
    connection: "Core principle of circular economy - reduce, reuse, recycle electronics.",
    impact: "Extending device lifespan by 1 year reduces environmental impact by 25%.",
    shortDesc: "Ensure sustainable consumption and production patterns",
  },
  {
    id: 13,
    title: "Climate Action",
    icon: "🌍",
    color: "#3F7E44",
    connection: "E-waste recycling reduces greenhouse gas emissions and mining activities.",
    impact: "Recycling 1 million phones saves 75,000 lbs of CO2 emissions.",
    shortDesc: "Take urgent action to combat climate change",
  },
  {
    id: 14,
    title: "Life Below Water",
    icon: "🐟",
    color: "#0A97D9",
    connection: "E-waste chemicals pollute oceans, harming marine life and ecosystems.",
    impact: "Microplastics from electronics are found in 90% of marine animals.",
    shortDesc: "Conserve and sustainably use oceans and marine resources",
  },
  {
    id: 15,
    title: "Life on Land",
    icon: "🌲",
    color: "#56C02B",
    connection: "Responsible mining for recycled materials protects forests and biodiversity.",
    impact: "Recycling reduces need for mining, protecting 1000+ hectares of forest.",
    shortDesc: "Protect, restore and promote sustainable use of ecosystems",
  },
  {
    id: 16,
    title: "Peace & Justice",
    icon: "⚖️",
    color: "#00689D",
    connection: "Conflict minerals in electronics fuel wars - recycling reduces demand for new mining.",
    impact: "Ethical sourcing and recycling promote peace in mining regions.",
    shortDesc: "Promote peaceful and inclusive societies for development",
  },
  {
    id: 17,
    title: "Partnerships",
    icon: "🤝",
    color: "#19486A",
    connection: "Global collaboration needed for effective e-waste management solutions.",
    impact: "International partnerships have increased e-waste recycling by 300%.",
    shortDesc: "Strengthen means of implementation for sustainable development",
  },
];

// E-waste facts and tips
const eWasteFacts = [
  {
    id: 1,
    title: "The Hidden Gold Mine",
    icon: "💰",
    fact: "Your smartphone contains more gold than a ton of gold ore!",
    detail: "A typical smartphone contains 0.034g of gold, 0.34g of silver, and rare earth elements worth $3-5.",
    tip: "Always recycle old phones - you're literally throwing away precious metals!",
    category: "Value",
  },
  {
    id: 2,
    title: "The Growing Mountain",
    icon: "📈",
    fact: "We generate 50+ million tons of e-waste annually - enough to fill 1.23 million trucks!",
    detail: "That's 6kg per person globally, and it's growing 3x faster than population.",
    tip: "Buy only what you need and use devices longer to reduce this mountain.",
    category: "Scale",
  },
  {
    id: 3,
    title: "Toxic Time Bomb",
    icon: "☢️",
    fact: "E-waste contains 1000+ toxic substances including mercury, lead, and cadmium.",
    detail: "A single CRT monitor contains 4-8 pounds of lead.",
    tip: "Never throw electronics in regular trash - always use certified recyclers.",
    category: "Health",
  },
  {
    id: 4,
    title: "Energy Savings Champion",
    icon: "⚡",
    fact: "Recycling aluminum from electronics saves 95% of the energy needed to make new aluminum!",
    detail: "The energy saved from recycling one laptop can power it for 1 month.",
    tip: "Choose products with recycled materials to support the circular economy.",
    category: "Energy",
  },
];

// Quiz questions about SDGs and e-waste
const quizQuestions = [
  {
    id: 1,
    question: "How many SDGs directly relate to e-waste management?",
    options: ["5", "10", "17", "None"],
    correct: 2,
    explanation: "All 17 SDGs are interconnected with e-waste management in various ways!",
  },
  {
    id: 2,
    question: "What percentage of e-waste is currently recycled globally?",
    options: ["80%", "50%", "20%", "5%"],
    correct: 2,
    explanation: "Only about 20% of global e-waste is formally recycled, leaving huge room for improvement.",
  },
  {
    id: 3,
    question: "Which rare earth element is most valuable in smartphones?",
    options: ["Gold", "Silver", "Copper", "Indium"],
    correct: 0,
    explanation: "Gold is the most valuable, worth about $2-3 per phone when properly extracted.",
  },
];

type SDGType = {
  id: number;
  title: string;
  icon: string;
  color: string;
  connection: string;
  impact: string;
  shortDesc: string;
};

export default function Learn() {
  const [selectedSDG, setSelectedSDG] = useState<SDGType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("sdgs"); // "sdgs", "facts", "quiz"
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [particleAnim] = useState(new Animated.Value(0));
  const particles = useRef(Array.from({ length: 20 }).map(() => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(Math.random() * 100),
    scale: new Animated.Value(0),
    opacity: new Animated.Value(0),
  }))).current;

  useEffect(() => {
    // Animate particles on mount
    particles.forEach((particle, index) => {
      const delay = index * 150;
      
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ]).start();
      
      // Floating animation
      const baseY = Math.random() * 100;
      particle.y.setValue(baseY);
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.y, {
            toValue: baseY + 20,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: baseY - 20,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const animateTransition = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleTabChange = (tab: React.SetStateAction<string>) => {
    animateTransition();
    setTimeout(() => setActiveTab(tab), 150);
  };

  const handleSDGPress = (sdg: SDGType) => {
    setSelectedSDG(sdg);
    setModalVisible(true);
  };

  const handleQuizAnswer = (answerIndex: number) => {
      const question = quizQuestions[currentQuizIndex];
      setSelectedAnswer(answerIndex);
      
      setTimeout(() => {
        if (answerIndex === question.correct) {
          setQuizScore(quizScore + 1);
        }
        
        if (currentQuizIndex < quizQuestions.length - 1) {
          setCurrentQuizIndex(currentQuizIndex + 1);
          setSelectedAnswer(null);
        } else {
          setShowQuizResult(true);
        }
      }, 1500);
    };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setShowQuizResult(false);
    setSelectedAnswer(null);
  };

  // Render SDGs Section with enhanced animations
  const renderSDGs = () => (
    <Animated.View style={{ opacity: fadeAnim }} className="px-4">
      <View className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-3xl mb-6 shadow-sm">
        <View className="flex-row items-center mb-3">
          <Globe size={28} color="#059669" />
          <Text className="text-2xl font-bold text-gray-800 ml-3">UN Sustainable Development Goals</Text>
        </View>
        <Text className="text-gray-600 leading-6">
          Discover how e-waste management connects to all 17 SDGs and contributes to a sustainable future for our planet.
        </Text>
      </View>

      <FlatList
        data={sdgData}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        renderItem={({ item, index }) => {
          const animValue = new Animated.Value(0);
          
          useEffect(() => {
            Animated.spring(animValue, {
              toValue: 1,
              delay: index * 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }, []);
          
          const scale = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1]
          });
          
          const opacity = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          });
          
          return (
            <Animated.View style={{ transform: [{ scale }], opacity }}>
              <TouchableOpacity
                onPress={() => handleSDGPress(item)}
                className="w-[48%] bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
                style={{ backgroundColor: item.color + "10" }}
                activeOpacity={0.8}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mb-3 self-start"
                  style={{ backgroundColor: item.color + "20" }}
                >
                  <Text className="text-xl">{item.icon}</Text>
                </View>
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs font-bold text-gray-500">SDG {item.id}</Text>
                </View>
                <Text className="text-sm font-bold text-gray-800 mb-2">{item.title}</Text>
                <Text className="text-xs text-gray-600 leading-4" numberOfLines={3}>
                  {item.shortDesc}
                </Text>
                <View className="flex-row items-center mt-3">
                  <Text className="text-xs text-emerald-600 font-medium">Learn more</Text>
                  <ChevronRight size={12} color="#059669" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </Animated.View>
  );

  // Render Facts Section with enhanced animations
  const renderFacts = () => (
    <Animated.View style={{ opacity: fadeAnim }} className="px-4">
      <View className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-3xl mb-6 shadow-sm">
        <View className="flex-row items-center mb-3">
          <Lightbulb size={28} color="#8b5cf6" />
          <Text className="text-2xl font-bold text-gray-800 ml-3">E-Waste Facts</Text>
        </View>
        <Text className="text-gray-600 leading-6">
          Mind-blowing facts about electronic waste that will change how you think about your devices.
        </Text>
      </View>

      {eWasteFacts.map((fact, index) => {
        const animValue = new Animated.Value(0);
        
        useEffect(() => {
          Animated.spring(animValue, {
            toValue: 1,
            delay: index * 150,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }, []);
        
        const translateY = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0]
        });
        
        return (
          <Animated.View 
            key={fact.id} 
            style={{ transform: [{ translateY }], opacity: animValue }}
            className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-gray-100"
          >
            <View className="flex-row items-start mb-4">
              <View className="bg-purple-100 p-3 rounded-full mr-4">
                <Text className="text-2xl">{fact.icon}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Text className="text-lg font-bold text-gray-800 flex-1">{fact.title}</Text>
                  <View className="bg-purple-100 px-3 py-1 rounded-full">
                    <Text className="text-purple-700 text-xs font-bold">{fact.category}</Text>
                  </View>
                </View>
                <Text className="text-emerald-600 font-semibold text-base mb-2">{fact.fact}</Text>
                <Text className="text-gray-600 text-sm leading-5 mb-3">{fact.detail}</Text>
                <View className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <View className="flex-row items-start">
                    <Lightbulb size={16} color="#059669" />
                    <Text className="text-emerald-700 text-sm ml-2 font-medium">{fact.tip}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        );
      })}
    </Animated.View>
  );

  // Render Quiz Section with enhanced animations
  const renderQuiz = () => (
    <Animated.View style={{ opacity: fadeAnim }} className="px-4">
      <View className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-3xl mb-6 shadow-sm">
        <View className="flex-row items-center mb-3">
          <Award size={28} color="#f59e0b" />
          <Text className="text-2xl font-bold text-gray-800 ml-3">Knowledge Quiz</Text>
        </View>
        <Text className="text-gray-600 leading-6">
          Test your knowledge about SDGs and e-waste management!
        </Text>
      </View>

      {!showQuizResult ? (
        <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-orange-600 font-bold">
              Question {currentQuizIndex + 1} of {quizQuestions.length}
            </Text>
            <View className="flex-row items-center bg-orange-100 px-3 py-1 rounded-full">
              <Star size={14} color="#f59e0b" />
              <Text className="text-orange-700 ml-1 font-bold">{quizScore} points</Text>
            </View>
          </View>

          <Text className="text-lg font-semibold text-gray-800 mb-6 leading-6">
            {quizQuestions[currentQuizIndex].question}
          </Text>

          {quizQuestions[currentQuizIndex].options.map((option, index) => {
            const animValue = new Animated.Value(0);
            
            useEffect(() => {
              Animated.spring(animValue, {
                toValue: 1,
                delay: index * 100,
                friction: 8,
                useNativeDriver: true,
              }).start();
            }, [currentQuizIndex]);
            
            const translateX = animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            });
            
            return (
              <Animated.View key={index} style={{ transform: [{ translateX }], opacity: animValue }}>
                <TouchableOpacity
                  onPress={() => handleQuizAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-xl mb-3 border-2 ${
                    selectedAnswer === null
                      ? "border-gray-200 bg-gray-50"
                      : selectedAnswer === index
                      ? index === quizQuestions[currentQuizIndex].correct
                        ? "border-green-400 bg-green-50"
                        : "border-red-400 bg-red-50"
                      : index === quizQuestions[currentQuizIndex].correct
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 bg-gray-100"
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                      selectedAnswer === null
                        ? "border-gray-400"
                        : selectedAnswer === index
                        ? index === quizQuestions[currentQuizIndex].correct
                          ? "border-green-500 bg-green-500"
                          : "border-red-500 bg-red-500"
                        : index === quizQuestions[currentQuizIndex].correct
                        ? "border-green-500 bg-green-500"
                        : "border-gray-400"
                    }`}>
                      {selectedAnswer !== null && (selectedAnswer === index || index === quizQuestions[currentQuizIndex].correct) && (
                        <CheckCircle size={16} color="#fff" />
                      )}
                    </View>
                    <Text className={`font-medium ${
                      selectedAnswer === null
                        ? "text-gray-700"
                        : selectedAnswer === index
                        ? index === quizQuestions[currentQuizIndex].correct
                          ? "text-green-700"
                          : "text-red-700"
                        : index === quizQuestions[currentQuizIndex].correct
                        ? "text-green-700"
                        : "text-gray-500"
                    }`}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {selectedAnswer !== null && (
            <Animated.View 
              style={{ 
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1]
                })}]
              }}
              className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-200"
            >
              <View className="flex-row items-start">
                <Info size={18} color="#2563eb" />
                <View className="ml-3 flex-1">
                  <Text className="text-blue-800 font-semibold mb-1">Did you know?</Text>
                  <Text className="text-blue-700 text-sm">
                    {quizQuestions[currentQuizIndex].explanation}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      ) : (
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1]
            })}]
          }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 items-center"
        >
          <View className="bg-gradient-to-br from-emerald-100 to-green-100 p-6 rounded-full mb-4">
            <Trophy size={40} color="#059669" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</Text>
          <Text className="text-lg text-gray-600 mb-4">
            You scored {quizScore} out of {quizQuestions.length}
          </Text>
          <View className="bg-emerald-50 p-4 rounded-xl mb-6 w-full">
            <Text className="text-emerald-700 text-center">
              {quizScore === quizQuestions.length
                ? "🎉 Perfect! You're an e-waste expert!"
                : quizScore >= quizQuestions.length / 2
                ? "👏 Great job! Keep learning!"
                : "📚 Good start! There's more to discover!"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={resetQuiz}
            className="bg-emerald-600 px-8 py-3 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Take Quiz Again</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Animated particles in background */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            transform: [{ scale: particle.scale }],
            opacity: particle.opacity,
            width: 6 + Math.random() * 6,
            height: 6 + Math.random() * 6,
            borderRadius: 50,
            backgroundColor: ['#86efac', '#4ade80', '#22c55e', '#16a34a'][index % 4],
          }}
        />
      ))}
      
      {/* Enhanced Header */}
      <View className="px-4 pt-8 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-gray-800">Learn & Discover</Text>
            <Text className="text-gray-600">Expand your knowledge on sustainability</Text>
          </View>
          <View className="bg-emerald-100 p-3 rounded-full">
            <BookOpen size={24} color="#059669" />
          </View>
        </View>

        {/* Enhanced Tab Navigation */}
        <View className="flex-row bg-gray-100 rounded-2xl p-1">
          {[
            {
              id: "sdgs",
              label: "17 SDGs",
              icon: Globe
            },
            {
              id: "facts",
              label: "E-Waste Facts",
              icon: Lightbulb
            },
            {
              id: "quiz",
              label: "Quiz",
              icon: Award
            }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabChange(tab.id)}
              className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${
                activeTab === tab.id ? "bg-white shadow-sm" : ""
              }`}
              activeOpacity={0.7}
            >
              <tab.icon size={16} color={activeTab === tab.id ? "#059669" : "#6b7280"} />
              <Text
                className={`ml-2 font-semibold text-sm ${
                  activeTab === tab.id ? "text-emerald-600" : "text-gray-600"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === "sdgs" && renderSDGs()}
        {activeTab === "facts" && renderFacts()}
        {activeTab === "quiz" && renderQuiz()}
      </ScrollView>

      {/* SDG Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <Animated.View 
            className="bg-white rounded-3xl p-6 w-full max-h-[80%]"
            style={{
              transform: [{
                scale: modalVisible ? 
                  fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1]
                  }) : 1
              }]
            }}
          >
            {selectedSDG && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-2xl font-bold text-gray-800 flex-1">SDG {selectedSDG.id}</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-gray-100 p-2 rounded-full"
                  >
                    <X size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row items-center mb-4">
                  <View 
                    className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: selectedSDG.color + "20" }}
                  >
                    <Text className="text-3xl">{selectedSDG.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">{selectedSDG.title}</Text>
                    <Text className="text-gray-600 text-sm">{selectedSDG.shortDesc}</Text>
                  </View>
                </View>

                <View className="bg-emerald-50 p-4 rounded-2xl mb-4 border border-emerald-200">
                  <Text className="text-emerald-800 font-semibold mb-2">🔗 E-Waste Connection</Text>
                  <Text className="text-emerald-700 leading-5">{selectedSDG.connection}</Text>
                </View>

                <View className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <Text className="text-blue-800 font-semibold mb-2">💡 Impact Fact</Text>
                  <Text className="text-blue-700 leading-5">{selectedSDG.impact}</Text>
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}