import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../../components/reuseable/Input';
import ActionButton from '../../components/reuseable/ActionButton';
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate common fields
    if (!firstName || !lastName) {
      Alert.alert('Error', 'Please fill in your first name and last name');
      return;
    }

    if (signUpMethod === 'email') {
      if (!email) {
        Alert.alert('Error', 'Please enter your email');
        return;
      }

      // TODO: Implement email registration API call
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Success', 'Registration successful!');
        navigation.navigate('MerchantBottomTab', {
          screen: 'Home',
        });
      }, 2000);
    } else {
      // Phone signup
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
        

        const response = await postData(ROUTES.SEND_OTP, {
          phone: formattedPhone,
        });
        
      
        setLoading(false);
        
        if (response) {
          // Navigate to OTP verification screen with all user data
          const expiresIn = response?.expires_in || 600; // Default to 600 seconds if not provided
          navigation.navigate('VerifyOTP', { 
            phone: formattedPhone, 
            expiresIn,
            firstName: firstName,
            lastName: lastName,
          });
        } else {
          Alert.alert('Error', 'Failed to send OTP. Please try again.');
        }
      } catch (error) {
        setLoading(false);
       
        
        // Better error messages based on error type
        let errorMessage = 'Failed to send OTP. Please try again.';
        let errorTitle = 'Error';
        
        if (error?.status === 500) {
          // Check if it's a database/backend error
          const errorData = error?.data || {};
          const backendError = errorData?.error || errorData?.message || '';
          
          if (backendError.includes('unverified') && backendError.includes('Trial accounts')) {
            errorTitle = 'Phone Number Not Verified';
            errorMessage = 'This phone number is not verified for trial accounts. Please use a verified number or contact support.';
          } else if (backendError.includes('twilio.com/user/account/phone-numbers/verified')) {
            errorTitle = 'Phone Number Verification Required';
            errorMessage = 'Please verify your phone number at twilio.com/user/account/phone-numbers/verified or purchase a Twilio number to send messages.';
          } else if (backendError.includes('user_id') || backendError.includes('database') || backendError.includes('SQL')) {
            errorTitle = 'Service Temporarily Unavailable';
            errorMessage = 'We are experiencing a technical issue. Please try again in a few moments.\n\nIf the problem continues, please contact support.';
          } else {
            errorTitle = 'Server Error';
            errorMessage = 'Server error occurred. Please try again.\n\nIf issue persists, please contact support.';
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
      <Text style={[styles.title, { color: textColor }]}>
        Create Account
      </Text>
      
      <Text style={[styles.description, { color: textColor }]}>
        {signUpMethod === 'email' 
          ? 'Enter your details to register' 
          : 'Enter your details to receive OTP'}
      </Text>
      
      <Input
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />

      <Input
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />

      {signUpMethod === 'email' ? (
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
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