import React, { useState } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../../components/reuseable/Input';
import ActionButton from '../../components/reuseable/ActionButton';
import { ImageData } from '../../utils/resources';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import FONTS from '../../utils/Font';
import { Colors } from '../../utils/Colors';
import { useNavigation } from '@react-navigation/native';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { ROUTES } from '../../utils/Routes';
import { postData } from '../../utils/APiCall';

const Register = ({ route }) => {
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const { backgroundColor, textColor } = getThemeColors(theme);

  const navigation = useNavigation();
  const signUpMethod = route?.params?.method || 'email'; // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (signUpMethod === 'email') {
      if (!email || !password || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }

      // TODO: Implement email registration API call
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Success', 'Registration successful!');
        navigation.navigate('Login');
      }, 2000);
    } else {
      // Phone signup - only phone number required
      if (!mobileNumber) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }
      
      if (mobileNumber.length < 10) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }

      
    
      const formattedPhone = mobileNumber.startsWith('+') 
        ? mobileNumber 
        : `+91${mobileNumber}`; 

      setLoading(true);
      try {
        console.log('Sending OTP request:', {
          phone: formattedPhone,
          route: ROUTES.SEND_OTP,
        });

        const response = await postData(ROUTES.SEND_OTP, {
          phone: formattedPhone,
        });
        
        console.log('OTP send response:', response);
        setLoading(false);
        
        if (response) {
          // Navigate to OTP verification screen with formatted phone number and expiry time
          const expiresIn = response?.expires_in || 600; // Default to 600 seconds if not provided
          navigation.navigate('VerifyOTP', { phone: formattedPhone, expiresIn });
        } else {
          Alert.alert('Error', 'Failed to send OTP. Please try again.');
        }
      } catch (error) {
        setLoading(false);
        console.log('OTP send error:', error);
        console.log('Error details:', JSON.stringify(error, null, 2));
        
        // Better error messages based on error type
        let errorMessage = 'Failed to send OTP. Please try again.';
        let errorTitle = 'Error';
        
        if (error?.status === 500) {
          // Check if it's a database/backend error
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
        Create Account
      </Text>
      
      <Text style={[styles.description, { color: textColor }]}>
        {signUpMethod === 'email' 
          ? 'Enter your email to register' 
          : 'Enter your phone number to receive OTP'}
      </Text>
      
      {signUpMethod === 'email' ? (
        <>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            type="password"
            showPasswordToggle={true}
          />

          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            type="password"
            showPasswordToggle={true}
          />
        </>
      ) : (
        <Input
          placeholder="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
          maxLength={10}
        />
      )}

      <View style={styles.buttonContainer}>
        <ActionButton
          title={signUpMethod === 'email' ? 'Register' : 'Send OTP'}
          onPress={handleRegister}
          loading={loading}
          fontSize={moderateScale(14)}
          fontWeight="700"
          fontFamily={FONTS.WINDSONG.REGULAR}
          color={Colors.WHITE}
          bgColor={Colors.PRIMARY}
          style={styles.button}
        />
      </View>

      <View style={styles.loginContainer}>
        <Text style={[styles.loginText, { color: textColor }]}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => {
          navigation.navigate('Login');
        }}>
          <Text style={styles.loginLink}>
            Login
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
  buttonContainer: {
    marginTop: verticalScale(20),
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  loginText: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '400',
  },
  loginLink: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  button: {
    height: verticalScale(42),
  },
});

export default Register;