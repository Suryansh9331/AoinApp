import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, CommonActions} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {useDispatch} from 'react-redux';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import {clearCredentials} from '../../redux/slices/authSlice';
import {clearAuthToken} from '../../utils/APiCall';
import {removeItem, AUTH_STORAGE_KEY} from '../../utils/MMKVStorage';

const Profile = () => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            dispatch(clearCredentials());
            clearAuthToken();
            // Clear auth data from MMKV storage
            removeItem(AUTH_STORAGE_KEY);
            // Immediately navigate to Splash screen to start from beginning
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              })
            );
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: '1',
      title: 'Your Profile',
      icon: 'person-outline',
      onPress: () => {
        navigation.navigate('MyProfile');
      },
      showArrow: true,
    },
    {
      id: '2',
      title: 'Settings',
      icon: 'settings-outline',
      onPress: () => {
        navigation.navigate('Settings');
      },
      showArrow: true,
    },
    {
      id: '3',
      title: 'Help Center',
      icon: 'help-circle-outline',
      onPress: () => {
        navigation.navigate('HelpCenter');
      },
      showArrow: true,
    },
    {
      id: '4',
      title: 'Invite Friends',
      icon: 'person-add-outline',
      onPress: () => {
        // TODO: Navigate to invite friends
        console.log('Navigate to Invite Friends');
      },
      showArrow: true,
    },
    {
      id: '5',
      title: 'Log Out',
      icon: 'log-out-outline',
      onPress: handleLogout,
      showArrow: false,
      isLogout: true,
    },
  ];

  return (
    <View style={[styles.container, {backgroundColor}]}>
      {/* <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={false}
      /> */}
      {/* Header */}
      <View style={[
        styles.header, 
        {borderBottomColor: borderColor},
        Platform.OS === 'ios' && {paddingTop: insets.top + verticalScale(12)}
      ]}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, {color: textColor}]}>
            Account
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Menu Items List */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={moderateScale(24)}
                  color={item.isLogout ? Colors.PRIMARY : textColor}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    {
                      color: item.isLogout ? Colors.PRIMARY : textColor,
                    },
                  ]}>
                  {item.title}
                </Text>
              </View>
              {item.showArrow && (
                <Ionicons
                  name="chevron-forward"
                  size={moderateScale(20)}
                  color={textColor}
                />
              )}
            </TouchableOpacity>
            {index < menuItems.length - 1 && (
              <View style={[styles.divider, {backgroundColor: borderColor}]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginLeft: scale(8),
  },
  menuContainer: {
    paddingTop: verticalScale(8),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  menuItemText: {
    fontSize: moderateScale(16),
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: scale(56),
  },
});

export default Profile;

