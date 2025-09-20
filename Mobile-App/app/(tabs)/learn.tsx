import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type SDGGoal = {
  id: number;
  title: string;
  description: string;
  color: string;
  icon: string;
  details: string;
  actions: string[];
  youtubeUrl: string;
  videoId: string;
};

export const sdgGoals: SDGGoal[] = [
  {
    id: 1,
    title: "No Poverty",
    description: "End poverty in all its forms everywhere",
    color: "#E5243B",
    icon: "people-outline",
    details:
      "Eradicating poverty is not a task of charity, it's an act of justice and the key to unlocking an enormous human potential.",
    actions: ["Support local businesses", "Donate to poverty-focused NGOs", "Volunteer in community programs"],
    youtubeUrl: "https://www.youtube.com/watch?v=Xe8fIjxicoo",
    videoId: "Xe8fIjxicoo"
  },
  {
    id: 2,
    title: "Zero Hunger",
    description: "End hunger, achieve food security and improved nutrition",
    color: "#DDA63A",
    icon: "restaurant-outline",
    details:
      "A world with zero hunger can positively impact our economies, health, education, equality and social development.",
    actions: ["Reduce food waste", "Support sustainable farming", "Donate to food banks"],
    youtubeUrl: "https://www.youtube.com/watch?v=2Vbk4oUXcK4",
    videoId: "2Vbk4oUXcK4"
  },
  {
    id: 3,
    title: "Good Health",
    description: "Ensure healthy lives and promote well-being for all",
    color: "#4C9F38",
    icon: "heart-outline",
    details:
      "Health is a fundamental human right and essential for sustainable development.",
    actions: ["Maintain personal hygiene", "Exercise regularly", "Support healthcare initiatives"],
    youtubeUrl: "https://www.youtube.com/watch?v=Qgn_FD7pFKw",
    videoId: "Qgn_FD7pFKw"
  },
  {
    id: 4,
    title: "Quality Education",
    description: "Ensure inclusive and equitable quality education",
    color: "#C5192D",
    icon: "school-outline",
    details:
      "Education is the most powerful weapon which you can use to change the world.",
    actions: ["Read regularly", "Support education programs", "Share knowledge with others"],
    youtubeUrl: "https://www.youtube.com/watch?v=73ExwNeFG0E",
    videoId: "73ExwNeFG0E"
  },
  {
    id: 5,
    title: "Gender Equality",
    description: "Achieve gender equality and empower all women and girls",
    color: "#FF3A21",
    icon: "people-circle-outline",
    details:
      "Gender equality is not only a fundamental human right, but a necessary foundation for a peaceful world.",
    actions: ["Promote equal opportunities", "Support women-led businesses", "Challenge stereotypes"],
    youtubeUrl: "https://www.youtube.com/watch?v=C-LnQxOXPG0",
    videoId: "C-LnQxOXPG0"
  },
  {
    id: 6,
    title: "Clean Water",
    description: "Ensure availability of water and sanitation for all",
    color: "#26BDE2",
    icon: "water-outline",
    details:
      "Water is life. Access to safe water and sanitation is a human right.",
    actions: ["Conserve water", "Support clean water projects", "Avoid water pollution"],
    youtubeUrl: "https://www.youtube.com/watch?v=0j5cFPFhgJU",
    videoId: "0j5cFPFhgJU"
  },
  {
    id: 7,
    title: "Affordable Energy",
    description: "Ensure access to affordable, reliable, sustainable energy",
    color: "#FCC30B",
    icon: "flash-outline",
    details:
      "Energy is central to nearly every major challenge and opportunity the world faces today.",
    actions: ["Use renewable energy", "Improve energy efficiency", "Support clean energy projects"],
    youtubeUrl: "https://www.youtube.com/watch?v=LpdVQKhgmDI",
    videoId: "LpdVQKhgmDI"
  },
  {
    id: 8,
    title: "Decent Work",
    description: "Promote sustained, inclusive economic growth and employment",
    color: "#A21942",
    icon: "briefcase-outline",
    details:
      "Economic growth should be a shared benefit that improves lives and doesn't harm the environment.",
    actions: ["Support fair trade", "Promote workplace equality", "Develop skills continuously"],
    youtubeUrl: "https://www.youtube.com/watch?v=RWsx1X8PV_A",
    videoId: "RWsx1X8PV_A"
  },
  {
    id: 9,
    title: "Innovation",
    description: "Build resilient infrastructure and foster innovation",
    color: "#FD6925",
    icon: "construct-outline",
    details:
      "Innovation and infrastructure are crucial drivers of economic growth and development.",
    actions: ["Embrace technology", "Support research", "Invest in sustainable infrastructure"],
    youtubeUrl: "https://www.youtube.com/watch?v=tKLY891gJpE",
    videoId: "tKLY891gJpE"
  },
  {
    id: 10,
    title: "Reduced Inequalities",
    description: "Reduce inequality within and among countries",
    color: "#DD1367",
    icon: "scale-outline",
    details:
      "Reducing inequalities is not only a moral imperative but also essential for sustainable development.",
    actions: ["Advocate for equal rights", "Support inclusive policies", "Challenge discrimination"],
    youtubeUrl: "https://www.youtube.com/watch?v=4q-bTmPp-3Y",
    videoId: "4q-bTmPp-3Y"
  },
  {
    id: 11,
    title: "Sustainable Cities",
    description: "Make cities and settlements inclusive, safe, resilient",
    color: "#FD9D24",
    icon: "business-outline",
    details:
      "Cities are hubs for ideas, commerce, culture, science, productivity, social development and much more.",
    actions: ["Use public transport", "Support urban planning", "Promote green spaces"],
    youtubeUrl: "https://www.youtube.com/watch?v=qHGjfz5sf6k",
    videoId: "qHGjfz5sf6k"
  },
  {
    id: 12,
    title: "Responsible Consumption",
    description: "Ensure sustainable consumption and production patterns",
    color: "#BF8B2E",
    icon: "refresh-outline",
    details:
      "We must learn to live within the means of our planet and change our consumption patterns.",
    actions: ["Reduce, reuse, recycle", "Buy sustainable products", "Minimize waste"],
    youtubeUrl: "https://www.youtube.com/watch?v=_xqnQj7EGMU",
    videoId: "_xqnQj7EGMU"
  },
  {
    id: 13,
    title: "Climate Action",
    description: "Take urgent action to combat climate change",
    color: "#3F7E44",
    icon: "earth-outline",
    details:
      "Climate change is a global challenge that affects everyone, everywhere.",
    actions: ["Reduce carbon footprint", "Support renewable energy", "Plant trees"],
    youtubeUrl: "https://www.youtube.com/watch?v=ipVxxxqwBQw",
    videoId: "ipVxxxqwBQw"
  },
  {
    id: 14,
    title: "Life Below Water",
    description: "Conserve and use oceans, seas and marine resources",
    color: "#0A97D9",
    icon: "fish-outline",
    details:
      "Our oceans drive global systems that make Earth habitable for humankind.",
    actions: ["Reduce plastic use", "Support marine conservation", "Choose sustainable seafood"],
    youtubeUrl: "https://www.youtube.com/watch?v=F-yDDb_cn_I",
    videoId: "F-yDDb_cn_I"
  },
  {
    id: 15,
    title: "Life on Land",
    description: "Protect, restore and promote sustainable use of ecosystems",
    color: "#56C02B",
    icon: "leaf-outline",
    details:
      "Forests cover 30% of the Earth's surface and are essential for our survival.",
    actions: ["Plant trees", "Support conservation", "Protect biodiversity"],
    youtubeUrl: "https://www.youtube.com/watch?v=0Puv0Pss33M",
    videoId: "0Puv0Pss33M"
  },
  {
    id: 16,
    title: "Peace & Justice",
    description: "Promote peaceful and inclusive societies",
    color: "#00689D",
    icon: "shield-checkmark-outline",
    details:
      "Peace, justice and strong institutions are fundamental for sustainable development.",
    actions: ["Promote non-violence", "Support justice initiatives", "Participate in democracy"],
    youtubeUrl: "https://www.youtube.com/watch?v=6KIeB8iNX-w",
    videoId: "6KIeB8iNX-w"
  },
  {
    id: 17,
    title: "Partnerships",
    description: "Strengthen means of implementation and global partnership",
    color: "#19486A",
    icon: "handshake-outline",
    details:
      "The SDGs can only be realized with strong global partnerships and cooperation.",
    actions: ["Collaborate across sectors", "Share resources", "Build networks"],
    youtubeUrl: "https://www.youtube.com/watch?v=0XTBYMfZyrM",
    videoId: "0XTBYMfZyrM"
  }
];


const eWasteInfo = {
  title: "E-Waste Management",
  description: "Electronic waste is the fastest-growing waste stream globally",
  youtubeUrl: "https://www.youtube.com/watch?v=MQLbakWESkw",
  videoId: "MQLbakWESkw",
  facts: [
    "54 million tons of e-waste generated annually",
    "Only 20% of e-waste is formally recycled",
    "E-waste contains valuable materials worth $62.5 billion",
    "Improper disposal causes environmental damage"
  ],
  solutions: [
    "Proper recycling facilities",
    "Manufacturer responsibility programs",
    "Consumer awareness campaigns",
    "Legislation and regulations"
  ],
  tips: [
    "Extend device lifespan through proper care",
    "Donate or sell working electronics",
    "Use certified e-waste recycling centers",
    "Buy refurbished electronics when possible"
  ]
};

export default function Learn() {
  const [selectedTab, setSelectedTab] = useState('sdgs');
  const [selectedGoal, setSelectedGoal] = useState<SDGGoal | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const openVideo = (videoId: string) => {
    setCurrentVideoId(videoId);
    setShowVideo(true);
  };

  const openYouTubeApp = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open YouTube. Please check if YouTube app is installed.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while opening the video.");
    }
  };

  const renderSDGCard = ({ item }: { item: SDGGoal }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedGoal(item);
        setModalVisible(true);
        animatePress();
      }}
      className="m-2 rounded-2xl overflow-hidden shadow-lg"
      style={{ width: width * 0.42 }}
    >
      <LinearGradient
        colors={[item.color, `${item.color}CC`]}
        className="p-4 h-40"
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-white text-lg font-bold">#{item.id}</Text>
          <Ionicons name={item.icon as any} size={24} color="white" />
        </View>
        <Text className="text-white text-sm font-semibold leading-tight">
          {item.title}
        </Text>
        <Text className="text-white text-xs opacity-90 mt-2 leading-4">
          {item.description}
        </Text>
        {/* Video indicator */}
        <View className="absolute bottom-2 right-2">
          <Ionicons name="play-circle" size={20} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEWasteSection = () => (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with eco-friendly green gradient */}
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        className="p-6 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold mb-2">
              {eWasteInfo.title}
            </Text>
            <Text className="text-white opacity-90 text-base">
              {eWasteInfo.description}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => openVideo(eWasteInfo.videoId)}
            className="ml-3 bg-white bg-opacity-20 p-3 rounded-full"
          >
            <Ionicons name="play" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Facts */}
      <View className="p-4">
        <Text className="text-gray-800 text-xl font-bold mb-3">Quick Facts</Text>
        {eWasteInfo.facts.map((fact, index) => (
          <View key={index} className="flex-row items-center mb-3 bg-white p-3 rounded-lg shadow-sm">
            <Ionicons name="information-circle" size={20} color="#10b981" />
            <Text className="ml-3 text-gray-700 flex-1">{fact}</Text>
          </View>
        ))}
      </View>

      {/* Solutions */}
      <View className="p-4">
        <Text className="text-gray-800 text-xl font-bold mb-3">Solutions</Text>
        {eWasteInfo.solutions.map((solution, index) => (
          <View key={index} className="flex-row items-center mb-3 bg-green-50 p-3 rounded-lg">
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text className="ml-3 text-gray-700 flex-1">{solution}</Text>
          </View>
        ))}
      </View>

      {/* Action Tips */}
      <View className="p-4 mb-6">
        <Text className="text-gray-800 text-xl font-bold mb-3">What You Can Do</Text>
        {eWasteInfo.tips.map((tip, index) => (
          <View key={index} className="flex-row items-center mb-3 bg-emerald-50 p-3 rounded-lg">
            <Ionicons name="bulb-outline" size={20} color="#059669" />
            <Text className="ml-3 text-gray-700 flex-1">{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Animated Header with Eco-Friendly Green */}
      <Animated.View
        style={{
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -50],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={['#10b981', '#059669', '#047857']}
          className="pt-12 pb-6 px-4"
        >
          <Text className="text-white text-3xl font-bold text-center mb-2">
            Learn & Grow
          </Text>
          <Text className="text-white opacity-90 text-center text-base">
            Discover sustainable development goals and environmental awareness
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Tab Navigation with Green Theme */}
      <View className="flex-row bg-white shadow-sm">
        <TouchableOpacity
          onPress={() => setSelectedTab('sdgs')}
          className={`flex-1 py-4 ${
            selectedTab === 'sdgs' ? 'border-b-2 border-emerald-500' : ''
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === 'sdgs' ? 'text-emerald-600' : 'text-gray-500'
            }`}
          >
            17 SDG Goals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('ewaste')}
          className={`flex-1 py-4 ${
            selectedTab === 'ewaste' ? 'border-b-2 border-emerald-500' : ''
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === 'ewaste' ? 'text-emerald-600' : 'text-gray-500'
            }`}
          >
            E-Waste Management
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'sdgs' ? (
        <FlatList
          data={sdgGoals}
          renderItem={renderSDGCard}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 8, paddingBottom: 20 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      ) : (
        renderEWasteSection()
      )}

      {/* Modal for SDG Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <Animated.View
            style={[
              { transform: [{ scale: scaleAnim }] },
              { maxHeight: height * 0.8 }
            ]}
            className="bg-white rounded-t-3xl p-6"
          >
            {selectedGoal && (
              <>
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: selectedGoal.color }}
                    >
                      <Text className="text-white font-bold">
                        {selectedGoal.id}
                      </Text>
                    </View>
                    <Text className="text-gray-800 text-xl font-bold flex-1">
                      {selectedGoal.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="p-2"
                  >
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Video Section */}
                <TouchableOpacity
                  onPress={() => openVideo(selectedGoal.videoId)}
                  className="bg-gray-900 rounded-xl p-6 mb-4 flex-row items-center justify-center"
                >
                  <Ionicons name="play-circle" size={32} color="white" />
                  <Text className="text-white font-semibold ml-2 text-base">
                    Watch Educational Video
                  </Text>
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text className="text-gray-600 text-base mb-4 leading-6">
                    {selectedGoal.details}
                  </Text>

                  <Text className="text-gray-800 text-lg font-semibold mb-3">
                    How You Can Help:
                  </Text>
                  {selectedGoal.actions.map((action, index) => (
                    <View
                      key={index}
                      className="flex-row items-center mb-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <Ionicons
                        name="arrow-forward-circle"
                        size={20}
                        color={selectedGoal.color}
                      />
                      <Text className="ml-3 text-gray-700 flex-1">{action}</Text>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => openYouTubeApp(selectedGoal.youtubeUrl)}
                    className="mt-4 p-3 rounded-lg flex-row items-center justify-center"
                    style={{ backgroundColor: selectedGoal.color }}
                  >
                    <Ionicons name="logo-youtube" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Open in YouTube App
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showVideo}
        onRequestClose={() => setShowVideo(false)}
      >
        {/* <View className="flex-1 bg-black">
          <View className="flex-row justify-between items-center p-4 pt-12 bg-black">
            <Text className="text-white text-lg font-semibold">Educational Video</Text>
            <TouchableOpacity
              onPress={() => setShowVideo(false)}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          {currentVideoId ? (
            <WebView
              source={{ uri: `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&controls=1` }}
              style={{ flex: 1 }}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View className="flex-1 justify-center items-center bg-black">
                  <Text className="text-white">Loading video...</Text>
                </View>
              )}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-white">Video not available</Text>
            </View>
          )}
        </View> */}
      </Modal>
    </View>
  );
}