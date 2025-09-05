import React from "react";
import { View, TouchableOpacity, Text, Dimensions, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { 
  Home, 
  MapPin, 
  Clock, 
  BookOpen, 
  User,
  Home as HomeActive,
  MapPin as MapPinActive,
  Clock as ClockActive,
  BookOpen as BookOpenActive,
  User as UserActive
} from "react-native-feather";

const BottomNavbar = (props: BottomTabBarProps) => {
  const navigation = useNavigation<any>();
  const { state } = props;
  const { width } = Dimensions.get('window');
  const tabWidth = width / 5;

  const tabs = [
    { 
      name: "Home", 
      route: "Home", 
      icon: Home, 
      activeIcon: HomeActive 
    },
    { 
      name: "Recyclers", 
      route: "RecyclersNearby", 
      icon: MapPin, 
      activeIcon: MapPinActive 
    },
    { 
      name: "History", 
      route: "PreviousRecycles", 
      icon: Clock, 
      activeIcon: ClockActive 
    },
    { 
      name: "Learn", 
      route: "Learn", 
      icon: BookOpen, 
      activeIcon: BookOpenActive 
    },
    { 
      name: "Profile", 
      route: "Profile", 
      icon: User, 
      activeIcon: UserActive 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab, index) => {
          const isActive = state.index === index;
          const IconComponent = isActive ? tab.activeIcon : tab.icon;
          
          return (
            <TouchableOpacity 
              key={tab.name} 
              onPress={() => navigation.navigate(tab.route)}
              style={[styles.tab, { width: tabWidth }]}
              activeOpacity={0.7}
            >
              <IconComponent 
                width={24} 
                height={24} 
                color={isActive ? "#059669" : "#9CA3AF"} 
              />
              <Text 
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : styles.tabTextInactive
                ]}
                numberOfLines={1}
              >
                {tab.name}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#059669',
  },
  tabTextInactive: {
    color: '#9CA3AF',
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#059669',
  },
});

export default BottomNavbar;