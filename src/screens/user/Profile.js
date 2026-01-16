import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, CommonActions} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {useDispatch, useSelector} from 'react-redux';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import {clearCredentials} from '../../redux/slices/authSlice';
import {clearAuthToken} from '../../utils/APiCall';
import {removeItem, AUTH_STORAGE_KEY} from '../../utils/MMKVStorage';
import Header from '../../components/Header/Header';

const Profile = () => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const userData = useSelector(state => state.auth.data);
  const userProfile = userData?.data || userData || {};
  const userName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
    : userProfile?.first_name 
    ? userProfile.first_name.trim()
    : userProfile?.username 
    ? userProfile.username.trim()
    : 'User';
  const userEmail = userProfile?.email || userData?.email || '';
  const userPhone = userProfile?.phone || '';
  const userProfileImage = userProfile?.profile_img || userProfile?.avatar || userData?.profile_img || 'https://i.pravatar.cc/150?img=1';

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
           
            removeItem(AUTH_STORAGE_KEY);
            
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
      title: 'Followers',
      icon: 'people-outline',
      onPress: () => {
        
        const currentUserId = userData?.data?.id || userData?.id || userData?.user_id;
        if (currentUserId) {
          navigation.navigate('FollowerList', { merchantId: currentUserId });
        }
      },
      showArrow: true,
    },
    // {
    //   id: '3',
    //   title: 'Settings',
    //   icon: 'settings-outline',
    //   onPress: () => {
    //     navigation.navigate('Settings');
    //   },
    //   showArrow: true,
    // },
    {
      id: '4',
      title: 'Help Center',
      icon: 'help-circle-outline',
      onPress: () => {
        navigation.navigate('HelpCenter');
      },
      showArrow: true,
    },
    {
      id: '5',
      title: 'Invite Friends',
      icon: 'person-add-outline',
      
      showArrow: true,
    },
    {
      id: '6',
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
      <Header
        title="Account"
        leftType="none"
      />
    
      {/* Profile Section */}
      <View style={[styles.profileSection, {borderBottomColor: borderColor}]}>
        <View style={styles.profileInfo}>
          <Image
            source={{uri: userProfileImage}}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, {color: textColor}]}>
              {userName}
            </Text>
            <Text style={[styles.profileEmail, {color: Colors.GRAY}]}>
              {userEmail}
            </Text>
            {userPhone && (
              <Text style={[styles.profilePhone, {color: Colors.GRAY}]}>
                {userPhone.replace(/[^\d]/g, '')}
              </Text>
            )}
          </View>
        </View>
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
  
  profileSection: {
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  profileImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  profileEmail: {
    fontSize: moderateScale(12),
    fontWeight: '400',
  },
  profilePhone: {
    fontSize: moderateScale(12),
    fontWeight: '400',
    marginTop: verticalScale(2),
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

