import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import Swiper from 'react-native-swiper';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../utils/Colors';
import useAppTheme from '../theme/useAppTheme';
import { getThemeColors } from '../theme/themeColors';
import Home from '../screens/user/Home';
import Explore from '../screens/user/Explore';
import Notification from '../screens/user/Notification';
import Profile from '../screens/user/Profile';

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
    key: 'Notification',
    label: 'Notification',
    component: Notification,
    icon: { Component: Ionicons, active: 'notifications', inactive: 'notifications-outline' },
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
];

const UserBottomTab = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);

  // Handle navigation to specific tab with params
  useEffect(() => {
    const params = route.params;
    if (params?.navigateToTab) {
      const tabIndex = TAB_ITEMS.findIndex(tab => tab.key === params.navigateToTab);
      if (tabIndex !== -1 && swiperRef.current) {
        setActiveIndex(tabIndex);
        swiperRef.current.scrollTo(tabIndex, true);
      }
    }
  }, [route.params]);

  const handleTabPress = index => {
    if (swiperRef.current) {
      swiperRef.current.scrollTo(index, true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Swiper
        ref={swiperRef}
        loop={false}
        index={activeIndex}
        showsPagination={false}
        onIndexChanged={setActiveIndex}
        loadMinimal
        loadMinimalSize={1}>
        {TAB_ITEMS.map(({ key, component: ScreenComponent }, idx) => {
          const profileParams = key === 'Profile' && route.params?.userId 
            ? { userId: route.params.userId }
            : undefined;
          
          return (
            <View style={[styles.slide, { backgroundColor }]} key={key}>
              <ScreenComponent 
                navigation={navigation} 
                routeKey={key}
                routeParams={profileParams}
              />
            </View>
          );
        })}
      </Swiper>

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

