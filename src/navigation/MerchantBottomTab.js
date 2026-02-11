import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text, FlatList, Dimensions } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../utils/Colors';
import useAppTheme from '../theme/useAppTheme';
import { getThemeColors } from '../theme/themeColors';
import Home from '../screens/merchant/Home';
import Post from '../screens/merchant/Post';
import Products from '../screens/merchant/Products';
import Profile from '../screens/merchant/Profile';
import Search from '../screens/merchant/Search';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    isCenter: true,
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
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef(null);
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);

  // Initialize activeIndex from route params
  const getInitialIndex = () => {
    const navTo = route?.params?.navigateToTab;
    const idx = navTo ? TAB_ITEMS.findIndex(tab => tab.key === navTo) : -1;
    return idx >= 0 ? idx : 0;
  };

  const [activeIndex, setActiveIndex] = useState(getInitialIndex());

  // Handle initial navigation from route params
  useEffect(() => {
    const initialIndex = getInitialIndex();
    setActiveIndex(initialIndex);
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: initialIndex, animated: false });
    }
  }, []);

  // Handle tab press
  const handleTabPress = (index) => {
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
    return (
      <View style={[styles.slide, { backgroundColor }]}>
        <ScreenComponent
          navigation={navigation}
          routeKey={item.key}
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
          paddingBottom: Math.max(insets.bottom, verticalScale(8)),
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

