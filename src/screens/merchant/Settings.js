import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch} from 'react-redux';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import {clearCredentials} from '../../redux/slices/authSlice';
import {clearAuthToken} from '../../utils/APiCall';
import {removeItem, AUTH_STORAGE_KEY} from '../../utils/MMKVStorage';

const MerchantSettings = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);

  const rows = [
    {
      title: 'Edit Account',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      title: 'Change Password',
      // Placeholder route; enable when screen exists
      disabled: true,
    },
    {
      title: 'Notifications',
      onPress: () => navigation.navigate('Settings'), // reuse if exists
    },
  ];

  const supportRows = [
    {
      title: '24*7 Support',
      onPress: () => navigation.navigate('HelpCenter'),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch(clearCredentials());
            clearAuthToken();
            removeItem(AUTH_STORAGE_KEY);
            navigation.reset({
              index: 0,
              routes: [{name: 'Splash'}],
            });
          },
        },
      ],
    );
  };

  const renderRow = (item, isLast = false) => (
    <TouchableOpacity
      key={item.title}
      style={[
        styles.row,
        {borderBottomColor: isLast ? 'transparent' : borderColor},
        item.disabled && styles.rowDisabled,
      ]}
      activeOpacity={item.disabled ? 1 : 0.7}
      onPress={!item.disabled ? item.onPress : undefined}>
      <Text style={[styles.rowText, {color: textColor, opacity: item.disabled ? 0.5 : 1}]}>
        {item.title}
      </Text>
      {!item.disabled && (
        <Ionicons name="chevron-forward" size={18} color={textColor} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={false}
      />

      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>Account Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: textColor}]}>Account Information</Text>
        <View style={[
          styles.card, 
          {
            borderColor: borderColor,
            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF'
          }
        ]}>
          {rows.map((item, idx) => renderRow(item, idx === rows.length - 1))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: textColor}]}>Service Support</Text>
        <View style={[
          styles.card, 
          {
            borderColor: borderColor,
            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF'
          }
        ]}>
          {supportRows.map((item, idx) => renderRow(item, idx === supportRows.length - 1))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  headerButton: {
    padding: scale(6),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  headerSpacer: {
    width: scale(28),
  },
  section: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: moderateScale(10),
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  rowDisabled: {
    opacity: 0.5,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(20),
  },
  signOutButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
});

export default MerchantSettings;

