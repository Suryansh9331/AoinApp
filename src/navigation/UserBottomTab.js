import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text, FlatList, Dimensions } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../utils/Colors';
import useAppTheme from '../theme/useAppTheme';
import { getThemeColors } from '../theme/themeColors';
import Home from '../screens/user/Home';
import Explore from '../screens/user/Explore';
import Profile from '../screens/user/Profile';
import Settings from '../screens/user/Settings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TAB_ITEMS = [
  {
    key: 'Home',
    label: 'Home',
    component: Home,
    icon: { Component: Ionicons, active: 'home', inactive: 'home-outline' },
  },
  {
    key: 'Explore',
    label: 'Explore',
    component: Explore,
    icon: { Component: Ionicons, active: 'compass', inactive: 'compass-outline' },
  },
  {
    key: 'Profile',
    label: 'Profile',
    component: Profile,
    icon: {
      Component: Ionicons,
      active: 'person',
      inactive: 'person-outline',
    },
  },
  {
    key: 'Settings',
    label: 'Settings',
    component: Settings,
    icon: { Component: Ionicons, active: 'settings', inactive: 'settings-outline' },
  },
  
];

const UserBottomTab = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);

  // Initialize activeIndex from route params
  const getInitialIndex = () => {
    const navTo = route?.params?.navigateToTab;
    const idx = navTo ? TAB_ITEMS.findIndex(tab => tab.key === navTo) : -1;
    return idx >= 0 ? idx : 0;
  };

  // Handle initial navigation from route params
  useEffect(() => {
    const initialIndex = getInitialIndex();
    setActiveIndex(initialIndex);
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: initialIndex, animated: false });
    }
  }, []);

  const handleTabPress = index => {
    if (index === activeIndex || !flatListRef.current) {
      return;
    }
    setActiveIndex(index);
    flatListRef.current.scrollToIndex({ index: index, animated: false });
  };

  // Render screen component
  const renderScreen = ({ item, index }) => {
    const ScreenComponent = item.component;
    // Only render the active screen
    if (index !== activeIndex) {
      return (
        <View style={[styles.slide, { backgroundColor }]}>
          {/* Empty view for non-active screens */}
        </View>
      );
    }
    
    const profileParams = item.key === 'Profile' && route.params?.userId 
      ? { userId: route.params.userId }
      : undefined;
    
    const homeParams = item.key === 'Home' && route.params?.reelId
      ? { reelId: route.params.reelId }
      : undefined;
    
    const screenParams = item.key === 'Home' ? homeParams : profileParams;
    
    return (
      <View style={[styles.slide, { backgroundColor }]}>
        <ScreenComponent 
          navigation={navigation} 
          routeKey={item.key}
          routeParams={screenParams}
        />
      </View>
    );
  };

  // Get layout for FlatList
  const getItemLayout = (data, index) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        ref={flatListRef}
        data={TAB_ITEMS}
        renderItem={renderScreen}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        initialScrollIndex={activeIndex}
        scrollEnabled={false}
        bounces={false}
      />

      <View style={[
        styles.tabBar,
        {
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          borderTopColor: borderColor,
          shadowColor: theme === 'dark' ? '#000000' : '#111827',
        }
      ]}>
        {TAB_ITEMS.map((tab, index) => {
          const isActive = index === activeIndex;
          const { Component: IconComp, active, inactive } = tab.icon;
          const iconName = isActive ? active : inactive;
          const iconColor = isActive 
            ? Colors.PRIMARY 
            : (theme === 'dark' ? '#6B7280' : '#9CA3AF');

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.85}
              onPress={() => handleTabPress(index)}
              style={styles.tabItem}>
              <View style={styles.iconContainer}>
                <IconComp
                  name={iconName}
                  size={moderateScale(20)}
                  color={iconColor}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { 
                    color: isActive 
                      ? Colors.PRIMARY 
                      : (theme === 'dark' ? '#6B7280' : '#9CA3AF')
                  },
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: verticalScale(Platform.OS === 'ios' ? 8 : 6),
    paddingTop: verticalScale(6),  
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: moderateScale(6),
    elevation: 12,
    position: 'relative',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(12),
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
});

export default UserBottomTab;

