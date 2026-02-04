import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {useSelector, useDispatch} from 'react-redux';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import {setThemeMode} from '../../redux/slices/themeSlice';
import Header from '../../components/Header/Header';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Alert} from 'react-native';
import {delete_Account_Request} from '../../redux/slices/authSlice';

const Settings = () => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const themeMode = useSelector(state => state.theme?.themeMode || 'light');

  const [generalNotifications, setGeneralNotifications] = useState(true);
  const [appUpdates, setAppUpdates] = useState(true);
  const [newServiceAvailable, setNewServiceAvailable] = useState(true);

  const handleDarkModeToggle = value => {
    const newTheme = value ? 'dark' : 'light';
    dispatch(setThemeMode(newTheme));
  };

  const deleteLoading = useSelector(state => state.auth.deleteAccountLoading);

  const settingsOptions = [
    {
      id: '1',
      title: 'General Notifications',
      value: generalNotifications,
      onValueChange: setGeneralNotifications,
    },
    {
      id: '2',
      title: 'Dark Mode',
      value: themeMode === 'dark',
      onValueChange: handleDarkModeToggle,
    },
    {
      id: '3',
      title: 'App Updates',
      value: appUpdates,
      onValueChange: setAppUpdates,
    },
    {
      id: '4',
      title: 'New Service Available',
      value: newServiceAvailable,
      onValueChange: setNewServiceAvailable,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor}]}>
      {/* Header */}
      <Header title="Account Settings" leftType="none" />

      {/* Settings Options List */}
      <View style={styles.settingsContainer}>
        {settingsOptions.map((item, index) => (
          <View key={item.id}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingText, {color: textColor}]}>
                {item.title}
              </Text>
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{
                  false: '#E5E7EB',
                  true: Colors.PRIMARY,
                }}
                thumbColor={item.value ? Colors.PRIMARY : '#FFFFFF'}
                ios_backgroundColor="#E5E7EB"
              />
            </View>
            {index < settingsOptions.length - 1 && (
              <View style={[styles.divider, {backgroundColor: borderColor}]} />
            )}
          </View>
        ))}
    
      </View>
    </SafeAreaView>
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
  settingsContainer: {
    paddingTop: verticalScale(8),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  settingText: {
    fontSize: moderateScale(16),
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: scale(16),
  },

  deleteButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Settings;
