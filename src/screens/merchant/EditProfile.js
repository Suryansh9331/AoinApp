import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import Header from '../../components/Header/Header';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { Colors } from '../../utils/Colors';
import { launchImageLibrary } from 'react-native-image-picker';
import { StatusBar } from 'react-native';
import { getData, putData, uploadFormData } from '../../utils/APiCall';
import { ROUTES } from '../../utils/Routes';
import Input from '../../components/reuseable/Input';

const EditProfile = () => {
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);
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
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await getData(ROUTES.MERCHANT_PROFILE);
     

      if (response && response.profile) {
        setMerchantProfile(response.profile);
      } else {
        setProfileError('Invalid profile data received');
      }
    } catch (error) {
      console.log('Error fetching merchant profile:', error);
      setProfileError(error?.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchantProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Form state - initialized from API data
  const [name, setName] = useState(merchantProfile?.business_name || '');
  const [username, setUsername] = useState(
    merchantProfile?.username || '',
  );
  const [bio, setBio] = useState(merchantProfile?.business_description || '');
  const [businessCategories, setBusinessCategories] = useState('');
  const [email, setEmail] = useState(merchantProfile?.business_email || '');
  const [phoneNumber, setPhoneNumber] = useState(merchantProfile?.business_phone || '');
  const [storeAddress, setStoreAddress] = useState(merchantProfile?.business_address || '');
  const [languages, setLanguages] = useState('');
  const [profileImage, setProfileImage] = useState(
    merchantProfile?.profile_img || 'https://i.pravatar.cc/150?img=1',
  );
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Additional fields for PUT request
  const [countryCode, setCountryCode] = useState(merchantProfile?.country_code || 'IN');
  const [stateProvince, setStateProvince] = useState(merchantProfile?.state_province || '');
  const [city, setCity] = useState(merchantProfile?.city || '');
  const [postalCode, setPostalCode] = useState(merchantProfile?.postal_code || '');
  const [gstin, setGstin] = useState(merchantProfile?.gstin || '');
  const [panNumber, setPanNumber] = useState(merchantProfile?.pan_number || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(merchantProfile?.bank_account_number || '');
  const [bankName, setBankName] = useState(merchantProfile?.bank_name || '');
  const [bankBranch, setBankBranch] = useState(merchantProfile?.bank_branch || '');
  const [bankIfscCode, setBankIfscCode] = useState(merchantProfile?.bank_ifsc_code || '');

  // Update form fields when merchantProfile loads
  useEffect(() => {
    if (merchantProfile) {
      setName(merchantProfile.business_name || '');
      setUsername(merchantProfile.username || '');
      setBio(merchantProfile.business_description || '');
      setEmail(merchantProfile.business_email || '');
      setPhoneNumber(merchantProfile.business_phone || '');
      setStoreAddress(merchantProfile.business_address || '');
      setProfileImage(merchantProfile.profile_img || 'https://i.pravatar.cc/150?img=1');
      setCountryCode(merchantProfile.country_code || 'IN');
      setStateProvince(merchantProfile.state_province || '');
      setCity(merchantProfile.city || '');
      setPostalCode(merchantProfile.postal_code || '');
      setGstin(merchantProfile.gstin || '');
      setPanNumber(merchantProfile.pan_number || '');
      setBankAccountNumber(merchantProfile.bank_account_number || '');
      setBankName(merchantProfile.bank_name || '');
      setBankBranch(merchantProfile.bank_branch || '');
      setBankIfscCode(merchantProfile.bank_ifsc_code || '');
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
        setSelectedImageFile(image);
      }
    });
  };

  const uploadProfileImage = async () => {
    if (!selectedImageFile) {
      return null;
    }

    try {
      setImageUploading(true);


      const formData = new FormData();


      formData.append('profile_image', {
        uri: selectedImageFile.uri,
        type: selectedImageFile.type || 'image/jpeg',
        name: selectedImageFile.fileName || 'profile_image.jpg',
      });




      const response = await uploadFormData(ROUTES.USER_PROFILE_IMAGE, formData);


      if (response && response.message === "Profile image uploaded successfully") {

        setSelectedImageFile(null);
        return response.profile_img_url;
      } else {
       
        throw new Error('Upload failed - unexpected response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Only show error alert if it's a real upload error, not if we're just returning null
      if (error.message !== 'Upload failed - unexpected response') {
        Alert.alert('Error', 'Failed to upload profile image');
      }
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    try {
     
      let uploadedImageUrl = null;
      if (selectedImageFile) {
        uploadedImageUrl = await uploadProfileImage();
        if (!uploadedImageUrl) {
          
          return;
        }
      }

   
      const originalUsername = merchantProfile?.username || '';
      const currentUsername = username.replace('@', '');

      const requestBody = {
        business_name: name,
        business_description: bio,
        business_address: storeAddress,
        profile_img: uploadedImageUrl || profileImage, // Use uploaded URL or current image
        country_code: countryCode,
        state_province: stateProvince,
        city: city,
        postal_code: postalCode,
        gstin: gstin,
        pan_number: panNumber,
        bank_account_number: bankAccountNumber,
        bank_name: bankName,
        bank_branch: bankBranch,
        bank_ifsc_code: bankIfscCode,
      };

      if (currentUsername !== originalUsername) {
        requestBody.username = currentUsername;
      }

     

      const response = await putData(ROUTES.MERCHANT_PROFILE, requestBody);

      if (response && response.status === 'success') {
        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response?.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);

      if (error?.message?.includes('Username can only be updated once per year')) {
        Alert.alert(
          'Username Update Restricted',
          'Username can only be updated once per year. Other profile information will still be updated.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Retry without username
                handleSaveWithoutUsername();
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Error', error?.message || 'Failed to update profile. Please try again.');
      }
    }
  };

  const handleSaveWithoutUsername = async () => {
    try {
      const requestBody = {
        business_name: name,
        business_description: bio,
        business_address: storeAddress,
        profile_img: profileImage,
        country_code: countryCode,
        state_province: stateProvince,
        city: city,
        postal_code: postalCode,
        gstin: gstin,
        pan_number: panNumber,
        bank_account_number: bankAccountNumber,
        bank_name: bankName,
        bank_branch: bankBranch,
        bank_ifsc_code: bankIfscCode,
      };

      

      const response = await putData(ROUTES.MERCHANT_PROFILE, requestBody);

      if (response && response.status === 'success') {
        Alert.alert('Success', 'Profile updated successfully! (Username unchanged)', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response?.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile without username:', error);
      Alert.alert('Error', error?.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={{ backgroundColor }}>
        <Header
          title="Edit Profile"
          leftType="back"
          onLeftPress={() => navigation.goBack()}
          containerStyle={{
            backgroundColor,
            borderBottomWidth: 0,
          }}
          titleStyle={{ color: textColor }}
        />
      </SafeAreaView>

      {profileLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading profile...
          </Text>
        </View>
      ) : profileError ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors.PRIMARY }]}>
            {profileError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: borderColor }]}
            onPress={fetchMerchantProfile}>
            <Text style={[styles.retryButtonText, { color: Colors.PRIMARY }]}>
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
                <Image source={{ uri: profileImage }} style={styles.profilePicture} />
                {imageUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.cameraIconContainer}
                  onPress={handleChangePhoto}
                  activeOpacity={0.8}
                  disabled={imageUploading}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleChangePhoto}
                activeOpacity={0.7}
                style={styles.changePhotoButton}
                disabled={imageUploading}>
                <Text style={[styles.changePhotoText, { color: textColor }]}>
                  {imageUploading ? 'Uploading...' : 'Change photo'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldsContainer}>
              <Input
                label="Name"
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
              />
              <Input
                label="Username"
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
              />
              <Input
                label="Bio"
                placeholder="Add a bio to your profile"
                value={bio}
                onChangeText={setBio}
                multiline
              />
              <Input
                label="Email"
                placeholder="Enter the email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <Input
                label="Phone Number"
                placeholder="Enter the phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                type="phone"
              />
              <Input
                label="Store Address"
                placeholder="Enter the store address"
                value={storeAddress}
                onChangeText={setStoreAddress}
              />
              <Input
                label="City"
                placeholder="Enter city"
                value={city}
                onChangeText={setCity}
              />
              <Input
                label="State"
                placeholder="Enter state/province"
                value={stateProvince}
                onChangeText={setStateProvince}
              />
              <Input
                label="Postal Code"
                placeholder="Enter postal code"
                value={postalCode}
                onChangeText={setPostalCode}
                keyboardType="numeric"
              />
              <Input
                label="Country Code"
                placeholder="Enter country code"
                value={countryCode}
                onChangeText={setCountryCode}
              />
              <Input
                label="GSTIN"
                placeholder="Enter GSTIN"
                value={gstin}
                onChangeText={setGstin}
                autoCapitalize="characters"
              />
              <Input
                label="PAN Number"
                placeholder="Enter PAN number"
                value={panNumber}
                onChangeText={setPanNumber}
                autoCapitalize="characters"
              />
              <Input
                label="Bank Account Number"
                placeholder="Enter bank account number"
                value={bankAccountNumber}
                onChangeText={setBankAccountNumber}
                keyboardType="numeric"
              />
              <Input
                label="Bank Name"
                placeholder="Enter bank name"
                value={bankName}
                onChangeText={setBankName}
              />
              <Input
                label="Bank Branch"
                placeholder="Enter bank branch"
                value={bankBranch}
                onChangeText={setBankBranch}
              />
              <Input
                label="Bank IFSC Code"
                placeholder="Enter bank IFSC code"
                value={bankIfscCode}
                onChangeText={setBankIfscCode}
                autoCapitalize="characters"
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={[styles.actionButtonsContainer, { borderTopColor: borderColor }]}>
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
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
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
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(75),
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    marginTop: verticalScale(8),
    fontWeight: '500',
  },
});

export default EditProfile;
