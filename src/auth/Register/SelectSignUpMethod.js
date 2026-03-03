import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../utils/Colors';
import FONTS from '../../utils/Font';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import GoogleButton from '../../components/reuseable/GoogleButton';
import {handleGoogleSignIn, configureGoogleSignIn} from '../../utils/GoogleSignIn';
import {setAuthToken} from '../../utils/APiCall';
import {login_Success} from '../../redux/slices/authSlice';

const SelectSignUpMethod = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Configure Google Sign In on component mount
    configureGoogleSignIn();
  }, []);

  const handleMethodSelect = (method) => {
    navigation.navigate('Register', { method: method });
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      
      const result = await handleGoogleSignIn();
      
      if (result.success && result.data) {
        // Extract tokens and user data from response
        const accessToken = result.data?.access_token || result.data?.data?.access_token;
        const refreshToken = result.data?.refresh_token || result.data?.data?.refresh_token;
        const userData = result.data?.user || result.data?.data?.user || result.data?.data;

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

          // Navigation will be handled by AppNavigator based on token
          Alert.alert('Success', 'Signed up with Google successfully!');
        } else {
          Alert.alert('Error', 'Failed to sign up with Google. Please try again.');
        }
      }
    } catch (error) {
      console.log('Google Sign Up error:', error);
      
      let errorMessage = 'Failed to sign up with Google. Please try again.';
      let errorTitle = 'Error';
      
      if (error?.code === 'DEVELOPER_ERROR' || error?.message?.includes('DEVELOPER_ERROR')) {
        errorTitle = 'Configuration Error';
        errorMessage = error?.help || error?.message || 'DEVELOPER_ERROR: Please configure Google Sign In properly.\n\n1. Get SHA-1 fingerprint: cd android && .\\get-sha1.ps1\n2. Add SHA-1 to Google Cloud Console\n3. Rebuild the app';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.type === 'network') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error?.status === 400 || error?.status === 401) {
        errorMessage = error?.message || 'Invalid Google credentials. Please try again.';
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>
          Create Account
        </Text>
        
        <Text style={[styles.description, { color: textColor }]}>
          Choose how you want to sign up
        </Text>

        <View style={styles.methodsContainer}>
         

          <TouchableOpacity
            style={styles.methodButton}
            onPress={() => handleMethodSelect('phone')}
            activeOpacity={0.8}>
            <Ionicons name="call" size={moderateScale(20)} color={Colors.WHITE} />
            <Text style={styles.methodButtonText}>
              Sign up with Phone
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          {/* <Text style={[styles.dividerText, { color: textColor }]}>
            Or continue with
          </Text> */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
        </View>

        {/* Google Sign Up Button */}
        {/* <View style={styles.googleButtonContainer}>
          <GoogleButton
            onPress={handleGoogleSignUp}
            style={styles.googleButton}
            disabled={loading}
          />
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: 'center',
  },
  title: {
    fontSize: moderateScale(28),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '600',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  description: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '400',
    marginBottom: verticalScale(40),
    textAlign: 'center',
  },
  methodsContainer: {
    gap: verticalScale(15),
  },
  methodButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  methodButtonText: {
    fontSize: moderateScale(16),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '600',
    color: Colors.WHITE,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(30),
    gap: scale(10),
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: moderateScale(12),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '400',
    opacity: 0.7,
  },
  googleButtonContainer: {
    marginTop: verticalScale(10),
  },
  googleButton: {
    width: '100%',
  },
});

export default SelectSignUpMethod;

