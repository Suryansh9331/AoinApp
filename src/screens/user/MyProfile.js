import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import Input from '../../components/reuseable/Input';
import ActionButton from '../../components/reuseable/ActionButton';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { Colors } from '../../utils/Colors';
import FONTS from '../../utils/Font';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../../components/Header/Header';
import { getData } from '../../utils/APiCall';

import { BASE_URL, ROUTES } from '../../utils/Routes';
import MyProfileSkeleton from '../../components/Skeleton/MyProfileSkeleton.js';

const MyProfile = () => {
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);
  const navigation = useNavigation();
  const userData = useSelector(state => state.auth.data);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Memoized profile data fetching function
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getData(`${BASE_URL}${ROUTES.USER_PROFILE}`);
      if (response && response.profile) {
        const profile = response.profile;
        setProfileData(profile);

        // Update state with API data
        setFullName(profile.first_name && profile.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : '');
        setEmail(profile.email || '');
        setGender(profile.gender || 'Male');

        // Parse phone number
        if (profile.phone) {
          setPhoneNumber(profile.phone);
        }

        // Parse date of birth
        if (profile.date_of_birth) {
          setDateOfBirth(profile.date_of_birth);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch profile data from API when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );

  // Memoized profile display data
  const profileDisplayData = useMemo(() => {
    if (!profileData) return null;
    
    return {
      fullName: profileData.first_name && profileData.last_name
        ? `${profileData.first_name} ${profileData.last_name}`
        : '',
      email: profileData.email || '',
      gender: profileData.gender || 'Male',
      phoneNumber: profileData.phone || '',
      dateOfBirth: profileData.date_of_birth || '',
      isEmailVerified: profileData.is_email_verified || false,
      isPhoneVerified: profileData.is_phone_verified || false,
    };
  }, [profileData]);

  
  const handleSave = () => {
  
    
    navigation.goBack();
  };


  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header - Always visible */}
      <Header
        title="Account Settings"
        onLeftPress={() => navigation.goBack()}
        rightContent={
          profileData && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('MyProfileEdit', { profileData })}
            >
              <Ionicons name="create-outline" size={20} color={textColor} />
            </TouchableOpacity>
          )
        }
      />

      {/* Show skeleton for form content while loading */}
      {loading ? (
        <MyProfileSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {/* Full Name */}
          <Input
            label="Full Name"
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            type="text"
            disabled={true}
          />

          {/* Email Address */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
             
              {profileData?.is_email_verified && (
                <View style={styles.verifiedContainer}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.PRIMARY} />
                  <Text style={[styles.verifiedText, { color: Colors.PRIMARY }]}>
                    Verified
                  </Text>
                </View>
              )}
            </View>
            <Input
              label="Email Address"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              type="text"
              disabled={true}
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: textColor }]}>Date of Birth</Text>
            <View
              style={[
                styles.dateDisplay,
                { borderColor: borderColor, backgroundColor: backgroundColor },
              ]}>
              <Text style={[styles.dateText, { color: textColor }]}>
                {dateOfBirth || 'Not specified'}
              </Text>
            </View>
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: textColor }]}>Gender</Text>
            <View
              style={[
                styles.genderDisplay,
                { borderColor: borderColor, backgroundColor: backgroundColor },
              ]}>
              <Text style={[styles.genderText, { color: textColor }]}>
                {gender}
              </Text>
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: textColor }]}>Phone Number</Text>
              {profileData?.is_phone_verified && (
                <View style={styles.verifiedContainer}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.PRIMARY} />
                  <Text style={[styles.verifiedText, { color: Colors.PRIMARY }]}>
                    Verified
                  </Text>
                </View>
              )}
            </View>
            <Input
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              type="text"
              disabled={true}
            />
          </View>
        </ScrollView>
      )}

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <ActionButton
          title="Saved"
          onPress={handleSave}
          bgColor={Colors.PRIMARY}
          color={Colors.WHITE}
          fontSize={moderateScale(14)}
          fontWeight="700"
          fontFamily={FONTS.WINDSONG.REGULAR}
          style={styles.saveButton}
        />
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
  scrollView: {
    flex: 1,
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginBottom: verticalScale(5),
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(100),
  },
  fieldContainer: {
    marginBottom: verticalScale(20),
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  verifiedText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  dateDisplay: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  dateText: {
    fontSize: moderateScale(12),
  },
  genderDisplay: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  genderText: {
    fontSize: moderateScale(12),
  },
  buttonContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(20),
    paddingTop: verticalScale(10),
  },
 editButton: {
  padding: scale(8),
  backgroundColor: 'transparent',  // Changed from Colors.PRIMARY
  borderRadius: moderateScale(12),
  alignItems: 'center',
  justifyContent: 'center',
},
  saveButton: {
    height: verticalScale(40),
    
  },
});

export default MyProfile;
