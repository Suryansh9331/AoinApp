import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import Input from '../../components/reuseable/Input';
import ActionButton from '../../components/reuseable/ActionButton';
import { ImageData } from '../../utils/resources';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import FONTS from '../../utils/Font';
import { Colors } from '../../utils/Colors';
import { useNavigation } from '@react-navigation/native';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { ROUTES } from '../../utils/Routes';
import { postData, setAuthToken } from '../../utils/APiCall';
import { login_Success } from '../../redux/slices/authSlice';

const VerifyOTPLogin = ({ route }) => {
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const { backgroundColor, textColor } = getThemeColors(theme);
  const navigation = useNavigation();

  const phoneNumber = route?.params?.phone || '';
  const expiresIn = route?.params?.expiresIn || 600; // Default 600 seconds
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(expiresIn);
  const intervalRef = useRef(null);

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    if (otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying login OTP:', {
        phone: phoneNumber,
        route: ROUTES.USER_LOGIN,
      });

      const response = await postData(ROUTES.USER_LOGIN, {
        phone: phoneNumber,
        otp: otp,
      });

      console.log('Login OTP response:', response);
      setLoading(false);

      if (response) {
        // Extract tokens and user data from response
        // Response structure: { access_token, refresh_token, user, message }
        const accessToken = response?.access_token || response?.data?.access_token;
        const refreshToken = response?.refresh_token || response?.data?.refresh_token;
        const userData = response?.user || response?.data?.user || response?.data;
        
        console.log('Extracted tokens:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasUserData: !!userData,
        });

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
          // No need to manually navigate - just show success message
          Alert.alert('Success', response?.message || 'Login successful!', [
            {
              text: 'OK',
              onPress: () => {
                // AppNavigator will automatically show BottomTab when token is set
              },
            },
          ]);
        } else {
          Alert.alert('Error', 'Failed to login. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.log('Login OTP verification error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to verify OTP. Please try again.';
      
      if (error?.status === 400) {
        errorMessage = error?.message || 'Invalid OTP. Please check and try again.';
      } else if (error?.status === 401) {
        errorMessage = 'Invalid OTP or phone number. Please try again.';
      } else if (error?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
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
        Verify OTP
      </Text>
      
      <Text style={[styles.description, { color: textColor }]}>
        Enter the OTP sent to {phoneNumber}
      </Text>

      {timeRemaining > 0 && (
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: textColor }]}>
            OTP expires in: <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
          </Text>
        </View>
      )}

      {timeRemaining === 0 && (
        <View style={styles.timerContainer}>
          <Text style={[styles.timerExpiredText, { color: Colors.ERROR }]}>
            OTP has expired. Please request a new one.
          </Text>
        </View>
      )}

      <Input
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />

      <View style={styles.buttonContainer}>
        <ActionButton
          title="Verify & Login"
          onPress={handleVerifyOTP}
          loading={loading}
          fontSize={moderateScale(14)}
          fontWeight="700"
          fontFamily={FONTS.WINDSONG.REGULAR}
          color={Colors.WHITE}
          bgColor={Colors.PRIMARY}
          style={styles.button}
        />
      </View>

      <View style={styles.resendContainer}>
        <Text style={[styles.resendText, { color: textColor }]}>
          Didn't receive OTP?{' '}
        </Text>
        <TouchableOpacity onPress={() => {
          // Navigate back to login to resend OTP
          navigation.goBack();
        }}>
          <Text style={styles.resendLink}>
            Resend
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
  disabledInput: {
    opacity: 0.6,
  },
  buttonContainer: {
    marginTop: verticalScale(20),
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  resendText: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '400',
  },
  resendLink: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  button: {
    height: verticalScale(42),
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  timerText: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '400',
    textAlign: 'center',
  },
  timerValue: {
    fontWeight: '700',
    color: Colors.PRIMARY,
  },
  timerExpiredText: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VerifyOTPLogin;

