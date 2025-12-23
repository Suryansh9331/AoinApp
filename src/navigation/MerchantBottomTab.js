import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import Swiper from 'react-native-swiper';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { fetchPublicReels_Success } from '../redux/slices/reelSlice';
import { Colors } from '../utils/Colors';
import useAppTheme from '../theme/useAppTheme';
import { getThemeColors } from '../theme/themeColors';
import Home from '../screens/merchant/Home';

import Post from '../screens/merchant/Post';
import Products from '../screens/merchant/Products';
import Profile from '../screens/merchant/Profile';
import Notifications from '../screens/merchant/Notifications';

const TAB_ITEMS = [
  {
    key: 'Home',
    label: 'Home',
    component: Home,
    icon: { Component: Ionicons, active: 'home', inactive: 'home-outline' },
  },
  {
    key: 'Notifications',
    label: 'Notifications',
    component: Notifications,
    icon: { Component: Ionicons, active: 'notifications', inactive: 'notifications-outline' },
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

const MerchantBottomTab = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const swiperRef = useRef(null);
  const isManualChangeRef = useRef(false);
  const swiperUpdatingRef = useRef(false);
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);
  const dispatch = useDispatch();

  // Initialize activeIndex from route params so the correct tab is mounted
  // immediately (prevents brief mount of Home with no params).
  const initialTabIndex = (() => {
    const navTo = route?.params?.navigateToTab;
    const idx = navTo ? TAB_ITEMS.findIndex(tab => tab.key === navTo) : -1;
    return idx >= 0 ? idx : 0;
  })();

  const [activeIndex, setActiveIndex] = useState(initialTabIndex);

  // Handle navigation to specific tab with params
  useEffect(() => {
    const params = route.params || {};
    
    // If caller passed preloadedReels, hydrate publicReels in Redux immediately
    if (params.preloadedReels && Array.isArray(params.preloadedReels) && params.preloadedReels.length > 0) {
      dispatch(fetchPublicReels_Success({ 
        reels: params.preloadedReels, 
        pagination: { 
          page: 1, 
          pages: 1, 
          per_page: params.preloadedReels.length, 
          total: params.preloadedReels.length 
        } 
      }));
    }
    
    // Handle tab navigation
    if (params.navigateToTab) {
      const tabIndex = TAB_ITEMS.findIndex(tab => tab.key === params.navigateToTab);
      if (tabIndex !== -1 && tabIndex !== activeIndex) {
        isManualChangeRef.current = true;
        setActiveIndex(tabIndex);
        // Use setTimeout to ensure swiper is ready
        setTimeout(() => {
          if (swiperRef.current && !swiperUpdatingRef.current) {
            swiperUpdatingRef.current = true;
            swiperRef.current.scrollTo(tabIndex, true);
            setTimeout(() => {
              swiperUpdatingRef.current = false;
              isManualChangeRef.current = false;
            }, 300);
          }
        }, 50);
      }
    }
  }, [route.params]);

  const handleTabPress = index => {
    // Prevent action if already on this tab or if swiper is updating
    if (index === activeIndex || swiperUpdatingRef.current) {
      return;
    }
    
    console.log('Tab pressed:', TAB_ITEMS[index].key, 'Index:', index, 'Current activeIndex:', activeIndex);
    
    // Mark as manual change to prevent onIndexChanged from interfering
    isManualChangeRef.current = true;
    swiperUpdatingRef.current = true;
    
    // Update state immediately for instant visual feedback
    setActiveIndex(index);
    
    // Scroll swiper to the new index immediately (no animation for tab clicks)
    if (swiperRef.current) {
      try {
        swiperRef.current.scrollTo(index, false);
      } catch (error) {
        console.log('Error scrolling swiper:', error);
      }
    }
    
    // Clear any navigation params that might be causing issues
    navigation.setParams({ 
      navigateToTab: null,
      reelId: null,
      preloadedReels: null,
      userId: null,
      editingReel: null,
      editingReelId: null
    });
    
    // Reset flags after a delay to allow swiper to update
    setTimeout(() => {
      isManualChangeRef.current = false;
      swiperUpdatingRef.current = false;
      console.log('Tab navigation complete. New activeIndex:', index);
    }, 200);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Swiper
        ref={swiperRef}
        loop={false}
        index={activeIndex}
        showsPagination={false}
        onIndexChanged={(index) => {
          // Only update if this is a swipe gesture (not manual tab press)
          // Also check if swiper is not currently being updated programmatically
          if (!isManualChangeRef.current && !swiperUpdatingRef.current) {
            if (index !== activeIndex) {
              console.log('Swiper index changed via swipe:', index, 'Previous activeIndex:', activeIndex);
              setActiveIndex(index);
              // Clear navigation params when swiping between tabs
              navigation.setParams({
                navigateToTab: null,
                reelId: null,
                preloadedReels: null,
                userId: null,
                editingReel: null,
                editingReelId: null
              });
            }
          } else {
            console.log('onIndexChanged ignored (manual change or updating):', index);
          }
        }}
        loadMinimal
        loadMinimalSize={1}>
        {TAB_ITEMS.map(({ key, component: ScreenComponent }, idx) => {
          const profileParams = key === 'Profile' && route.params?.userId
            ? { userId: route.params.userId }
            : undefined;

          const postParams = key === 'Post' && route.params?.editingReel
            ? {
                editingReel: route.params.editingReel,
                editingReelId: route.params.editingReelId,
              }
            : undefined;

          const homeParams = key === 'Home' && route.params?.reelId
            ? {
                reelId: route.params.reelId,
                preloadedReels: route.params.preloadedReels,
              }
            : undefined;

          const homeInitialReels = key === 'Home'
            ? (route.params?.preloadedReels || undefined)
            : undefined;

          return (
            <View style={[styles.slide, { backgroundColor }]} key={key}>
              <ScreenComponent
                navigation={navigation}
                routeKey={key}
                routeParams={profileParams || postParams || homeParams}
                // Explicitly pass initialReels only to Home
                initialReels={homeInitialReels}
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

export default MerchantBottomTab;

