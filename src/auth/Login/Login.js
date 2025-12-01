import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import Input from '../../components/reuseable/Input';
import ActionButton from '../../components/reuseable/ActionButton';
import { ImageData } from '../../utils/resources';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import FONTS from '../../utils/Font';
import { Colors } from '../../utils/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { ROUTES } from '../../utils/Routes';
import { postData, setAuthToken } from '../../utils/APiCall';
import { login_Success } from '../../redux/slices/authSlice';


const Login = () => {
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const { backgroundColor, textColor } = getThemeColors(theme);
  const navigation = useNavigation();
  const route = useRoute();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get role from route params, with listener to update when params change
  const [role, setRole] = useState(route?.params?.role || 'user');
  const isMerchant = role === 'merchant';
  
  // Update role when route params change
  useEffect(() => {
    const currentRole = route?.params?.role || 'user';
    console.log('Login screen - Route params changed. Role:', currentRole);
    console.log('Full route params:', route?.params);
    setRole(currentRole);
  }, [route?.params?.role]);
  
  // Debug log to check role
  useEffect(() => {
    console.log('Login screen - Current Role:', role, 'isMerchant:', isMerchant);
  }, [role, isMerchant]);

  const handleMerchantLogin = async () => {
    if (!businessEmail) {
      Alert.alert('Error', 'Please enter your business email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(businessEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await postData(ROUTES.MERCHANT_LOGIN, {
        business_email: businessEmail.trim(),
        password: password,
      });
      
      console.log('Merchant login response:', response);
      setLoading(false);
      
      if (response) {
        // Extract tokens and user data from response
        const accessToken = response?.access_token || response?.data?.access_token;
        const refreshToken = response?.refresh_token || response?.data?.refresh_token;
        const userData = response?.user || response?.data?.user || response?.data;
        
        if (accessToken) {
          // Set auth token for API calls
          setAuthToken(accessToken);

          // Store in Redux
          dispatch(
            login_Success({
              data: userData,
              token: accessToken,
              refreshToken: refreshToken,
            })
          );

          // The AppNavigator will automatically redirect to BottomTab based on token
          Alert.alert('Success', response?.message || 'Login successful!', [
            {
              text: 'OK',
              onPress: () => {
                // AppNavigator will automatically show MerchantBottomTab when token is set
              },
            },
          ]);
        } else {
          Alert.alert('Error', 'Failed to login. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Failed to login. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.log('Merchant login error:', error);
      
      let errorMessage = 'Failed to login. Please try again.';
      let errorTitle = 'Error';
      
      if (error?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error?.status === 400) {
        errorMessage = error?.message || 'Invalid credentials. Please check and try again.';
      } else if (error?.status === 500) {
        errorTitle = 'Server Error';
        errorMessage = 'Server error occurred. Please try again.\n\nIf the issue persists, please contact support.';
      } else if (error?.status === 404) {
        errorMessage = 'Service not found. Please contact support.';
      } else if (error?.type === 'network') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(errorTitle, errorMessage);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (cleanPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Format phone number with country code if not present
    const formattedPhone = cleanPhone.startsWith('+') 
      ? cleanPhone 
      : `+91${cleanPhone}`;

    setLoading(true);
    try {
      

      const response = await postData(ROUTES.SEND_OTP, {
        phone: formattedPhone,
      });
      
      console.log('OTP send response:', response);
      setLoading(false);
      
      if (response) {
        // Navigate to OTP verification screen for login with expiry time
        const expiresIn = response?.expires_in || 600; // Default to 600 seconds if not provided
        navigation.navigate('VerifyOTPLogin', { phone: formattedPhone, expiresIn });
      } else {
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.log('OTP send error:', error);
      
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      let errorTitle = 'Error';
      
      if (error?.status === 500) {
        const errorData = error?.data || {};
        const backendError = errorData?.error || errorData?.message || '';
        
        if (backendError.includes('user_id') || backendError.includes('database') || backendError.includes('SQL')) {
          errorTitle = 'Service Temporarily Unavailable';
          errorMessage = 'We are experiencing a technical issue. Please try again in a few moments.\n\nIf the problem continues, please contact support.';
        } else {
          errorTitle = 'Server Error';
          errorMessage = 'Server error occurred. Please try again.\n\nIf the issue persists, please contact support.';
        }
      } else if (error?.status === 400) {
        errorMessage = error?.message || 'Invalid phone number. Please check and try again.';
      } else if (error?.status === 404) {
        errorMessage = 'Service not found. Please contact support.';
      } else if (error?.type === 'network') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(errorTitle, errorMessage);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.logoContainer}>
        <Image 
          source={ImageData.AOIN_LOGO} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      
      <Text style={[styles.title, { color: textColor }]}>
        Welcome Back!
      </Text>
      
      <Text style={[styles.description, { color: textColor }]}>
        {isMerchant 
          ? 'Enter your business email and password to login'
          : 'Enter your phone number to receive OTP'
        }
      </Text>
      
      {isMerchant ? (
        <>
          <Input
            placeholder="Business Email"
            value={businessEmail}
            onChangeText={setBusinessEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            type="text"
          />
          
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            type="password"
            showPasswordToggle={true}
          />

          <View style={styles.buttonContainer}>
            <ActionButton
              title="Login"
              onPress={handleMerchantLogin}
              loading={loading}
              fontSize={moderateScale(14)}
              fontWeight="700"
              fontFamily={FONTS.WINDSONG.REGULAR}
              color={Colors.WHITE}
              bgColor={Colors.PRIMARY}
              style={styles.button}
            />
          </View>
        </>
      ) : (
        <>
          <Input
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <View style={styles.buttonContainer}>
            <ActionButton
              title="Send OTP"
              onPress={handleSendOTP}
              loading={loading}
              fontSize={moderateScale(14)}
              fontWeight="700"
              fontFamily={FONTS.WINDSONG.REGULAR}
              color={Colors.WHITE}
              bgColor={Colors.PRIMARY}
              style={styles.button}
            />
          </View>
        </>
      )}

      <View style={styles.signupContainer}>
        <Text style={[styles.signupText, { color: textColor }]}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => {
          navigation.navigate('SelectSignUpMethod');
        }}>
          <Text style={styles.signupLink}>
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  logoImage: {
    width: moderateScale(100),
    height: moderateScale(100),
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '400',
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    marginTop: 10,
    textAlign: 'center',
    fontSize: moderateScale(14),
  },
  buttonContainer: {
    marginTop: verticalScale(20),
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  signupText: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '400',
  },
  signupLink: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  button: {
    height: verticalScale(42),

  },
});

export default Login;

