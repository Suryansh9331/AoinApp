import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import Swiper from 'react-native-swiper';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../utils/Colors';
import useAppTheme from '../theme/useAppTheme';
import { getThemeColors } from '../theme/themeColors';
import Home from '../screens/Home/Home';
// Import Screen Components
import Search from '../screens/Connectivity/Search';
import Profile from '../screens/Profile/Profile';
import Products from '../screens/Products/Products';
import Post from '../screens/Post/Post';



const TAB_ITEMS = [
  {
    key: 'Home',
    label: 'Home',
    component: Home,
    icon: { Component: Ionicons, active: 'home', inactive: 'home-outline' },
  },
  {
    key: 'Search',
    label: 'Search',
    component: Search,
    icon: { Component: Ionicons, active: 'search', inactive: 'search-outline' },
  },
  {
    key: 'Post',
    label: 'Post',
    component: Post,
    icon: {
      Component: Ionicons,
      active: 'add-circle',
      inactive: 'add-circle-outline',
    },
    isCenter: true, // Mark Post as center tab
  },
  {
    key: 'Products',
    label: 'Products',
    component: Products,
    icon: { Component: MaterialIcons, active: 'shopping-bag', inactive: 'shopping-bag' },
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

const BottomTab = () => {
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
    // Don't set activeIndex here - let onIndexChanged handle it
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
          // Pass route params to Profile component
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
          const isCenterTab = tab.isCenter;
          const iconSize = isCenterTab ? moderateScale(24) : moderateScale(20);
          const iconColor = isActive 
            ? (isCenterTab ? '#FFFFFF' : Colors.PRIMARY) 
            : (isCenterTab ? '#FFFFFF' : (theme === 'dark' ? '#6B7280' : '#9CA3AF'));

          // Render icon based on component type
          const renderIcon = () => {
            if (IconComp === Ionicons) {
              return (
                <Ionicons
                  name={iconName}
                  size={iconSize}
                  color={iconColor}
                />
              );
            } else if (IconComp === MaterialIcons) {
              return (
                <MaterialIcons
                  name={iconName}
                  size={iconSize}
                  color={iconColor}
                />
              );
            } else if (IconComp === FontAwesome) {
              return (
                <FontAwesome
                  name={iconName}
                  size={iconSize}
                  color={iconColor}
                />
              );
            }
            return null;
          };

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.85}
              onPress={() => handleTabPress(index)}
              style={[
                styles.tabItem,
                isCenterTab && styles.centerTabItem,
              ]}>
              <View
                style={[
                  styles.iconContainer,
                  isCenterTab && styles.centerIconContainer,
                ]}>
                {renderIcon()}
              </View>
              {!isCenterTab && (
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
              )}
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
  centerTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: verticalScale(-5),
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  tabLabel: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
});

export default BottomTab;
