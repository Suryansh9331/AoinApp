import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native';
import Header from '../../components/Header/Header';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import {launchImageLibrary} from 'react-native-image-picker';
import {StatusBar} from 'react-native';
import {getData} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';

const EditProfile = () => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const navigation = useNavigation();
  const userData = useSelector(state => state.auth.data);
  
  // Get merchant_id from logged-in user data
  const merchantId = useMemo(() => {
    const userInfo = userData?.data || userData || {};
    return userInfo.merchant_id || userInfo.id || userInfo.user_id || null;
  }, [userData]);

  // State for merchant profile data
  const [merchantProfile, setMerchantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Fetch merchant profile
  const fetchMerchantProfile = useCallback(async () => {
    if (!merchantId) {
      setProfileError('Merchant ID not found');
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    try {
      const endpoint = `${ROUTES.MERCHANT_PUBLIC_PROFILE}${merchantId}/public-profile`;
      const response = await getData(endpoint);
      
      if (response && typeof response === 'object' && response.business_name) {
        setMerchantProfile(response);
      } else if (response && response.data && response.data.business_name) {
        setMerchantProfile(response.data);
      } else {
        setProfileError('Invalid profile data received');
      }
    } catch (error) {
      console.log('Error fetching merchant profile:', error);
      setProfileError(error?.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    if (merchantId) {
      fetchMerchantProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  // Form state - initialized from API data
  const [name, setName] = useState(merchantProfile?.business_name || '');
  const [username, setUsername] = useState(
    merchantProfile?.business_name 
      ? `@${merchantProfile.business_name.toLowerCase().replace(/\s+/g, '_')}`
      : '',
  );
  const [bio, setBio] = useState(merchantProfile?.business_description || '');
  const [businessCategories, setBusinessCategories] = useState('');
  const [email, setEmail] = useState(merchantProfile?.business_email || '');
  const [phoneNumber, setPhoneNumber] = useState(merchantProfile?.business_phone || '');
  const [storeAddress, setStoreAddress] = useState(merchantProfile?.business_address || '');
  const [languages, setLanguages] = useState('');
  const [profileImage, setProfileImage] = useState(
    'https://i.pravatar.cc/150?img=1',
  );

  // Update form fields when merchantProfile loads
  useEffect(() => {
    if (merchantProfile) {
      setName(merchantProfile.business_name || '');
      setUsername(
        merchantProfile.business_name 
          ? `@${merchantProfile.business_name.toLowerCase().replace(/\s+/g, '_')}`
          : '',
      );
      setBio(merchantProfile.business_description || '');
      setEmail(merchantProfile.business_email || '');
      setPhoneNumber(merchantProfile.business_phone || '');
      setStoreAddress(merchantProfile.business_address || '');
    }
  }, [merchantProfile]);

  const handleChangePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', 'Failed to select image');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        setProfileImage(image.uri);
      }
    });
  };

  const handleSave = () => {
    console.log('Saving profile:', {
      name,
      username,
      bio,
      businessCategories,
      email,
      phoneNumber,
      storeAddress,
      languages,
    });
    Alert.alert('Success', 'Profile updated successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderField = (
    label,
    value,
    placeholder,
    onChangeText,
    onPress = null,
  ) => {
    return (
      <TouchableOpacity
        style={[styles.fieldContainer, {borderBottomColor: borderColor}]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}>
        <Text style={[styles.fieldLabel, {color: textColor}]}>{label}</Text>
        {onPress ? (
          <View style={styles.fieldValueContainer}>
            <Text
              style={[
                styles.fieldValue,
                {color: value ? textColor : textColor + '80'},
              ]}>
              {value || placeholder}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={textColor + '80'}
            />
          </View>
        ) : (
          <TextInput
            style={[styles.fieldInput, {color: textColor}]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={textColor + '80'}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <SafeAreaView style={{backgroundColor}}>
        <Header
          title="Edit Profile"
          leftType="back"
          onLeftPress={() => navigation.goBack()}
          containerStyle={{
            backgroundColor,
            borderBottomWidth: 0,
          }}
          titleStyle={{color: textColor}}
        />
      </SafeAreaView>

      {profileLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={[styles.loadingText, {color: textColor}]}>
            Loading profile...
          </Text>
        </View>
      ) : profileError ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, {color: Colors.PRIMARY}]}>
            {profileError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, {borderColor: borderColor}]}
            onPress={fetchMerchantProfile}>
            <Text style={[styles.retryButtonText, {color: Colors.PRIMARY}]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : merchantProfile ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.profilePictureSection}>
              <View style={styles.profilePictureContainer}>
                <Image source={{uri: profileImage}} style={styles.profilePicture} />
                <TouchableOpacity
                  style={styles.cameraIconContainer}
                  onPress={handleChangePhoto}
                  activeOpacity={0.8}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleChangePhoto}
                activeOpacity={0.7}
                style={styles.changePhotoButton}>
                <Text style={[styles.changePhotoText, {color: textColor}]}>
                  Change photo
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldsContainer}>
              {renderField('Name', name, 'Enter name', setName)}
              {renderField('Username', username, 'Enter username', setUsername)}
              {renderField('Bio', bio, 'Add a bio to your profile', setBio)}
              {renderField(
                'Business Categories',
                businessCategories,
                'Select Categories',
                null,
                () => {
                  Alert.alert(
                    'Business Categories',
                    'Select categories feature coming soon',
                  );
                },
              )}
              {renderField('Email', email, 'Enter the email Address', setEmail)}
              {renderField(
                'Phone Number',
                phoneNumber,
                'Enter the Phone Number',
                setPhoneNumber,
              )}
              {renderField(
                'Store Address',
                storeAddress,
                'Select the Address',
                null,
                () => {
                  // TODO: Open address selection
                  Alert.alert(
                    'Store Address',
                    'Address selection feature coming soon',
                  );
                },
              )}
              {renderField(
                'Languages',
                languages,
                'Select the Languages',
                null,
                () => {
                  // TODO: Open languages selection
                  Alert.alert(
                    'Languages',
                    'Language selection feature coming soon',
                  );
                },
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={[styles.actionButtonsContainer, {borderTopColor: borderColor}]}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderColor: borderColor,
                  backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                },
              ]}
              onPress={handleCancel}
              activeOpacity={0.7}>
              <Text style={[styles.cancelButtonText, {color: textColor}]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
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
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(100),
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(24),
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: verticalScale(12),
  },
  profilePicture: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  changePhotoButton: {
    paddingVertical: verticalScale(4),
  },
  changePhotoText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  fieldsContainer: {
    paddingHorizontal: scale(16),
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    flex: 1,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  fieldValue: {
    fontSize: moderateScale(14),
    marginRight: scale(8),
  },
  fieldInput: {
    fontSize: moderateScale(14),
    flex: 1,
    textAlign: 'right',
    padding: 0,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: scale(12),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
  },
  saveButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
    paddingHorizontal: scale(20),
  },
  errorText: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  retryButton: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(8),
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
});

export default EditProfile;
