import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../utils/Colors';
import { ImageData } from '../../utils/resources';
import FONTS from '../../utils/Font';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import GoogleButton from '../reuseable/GoogleButton';

const SelectRoleScreen = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Navigate to login directly when role is selected
    navigation.navigate('Login', { role: role });
  };

  const handleSignUp = () => {
    navigation.navigate('SelectSignUpMethod');
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google Sign In
    console.log('Google Sign In');
    // You can add Google Sign In logic here
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple Sign In
    console.log('Apple Sign In');
    // You can add Apple Sign In logic here
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={ImageData.AOIN_LOGO} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
       
      </View>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => handleRoleSelect('user')}
          activeOpacity={0.8}>
          <View style={styles.buttonContent}>
          
            <View style={styles.buttonTextContainer}>
              <Text style={styles.roleTitle}>
                Signin as a Merchants 
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => handleRoleSelect('merchant')}
          activeOpacity={0.8}>
          <View style={styles.buttonContent}>
            
            <View style={styles.buttonTextContainer}>
              <Text style={styles.roleTitle}>
                Signin as a User
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Social Login Section */}
        <View style={styles.socialLoginContainer}>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={[styles.dividerText, { color: getThemeColors(theme).textColor }]}>
              Or continue with
            </Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <GoogleButton
              onPress={handleGoogleLogin}
              style={styles.socialButton}
            />
            
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.appleButton, styles.socialButton]}
                onPress={handleAppleLogin}
                activeOpacity={0.7}>
                <Ionicons name="logo-apple" size={moderateScale(18)} color="#FFFFFF" />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sign Up Text */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: getThemeColors(theme).textColor }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupLink}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  header: {
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(40),
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: verticalScale(30),
    alignItems: 'center',
  },
  logoImage: {
    width: moderateScale(120),
    height: moderateScale(120),
  },
  roleContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: verticalScale(20),
    paddingBottom: verticalScale(40),
  },
  roleButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: moderateScale(16),
    padding: moderateScale(10),
    minHeight: verticalScale(50),
    justifyContent: 'center',
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(15),
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(14),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(5),
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: FONTS.WINDSONG.REGULAR,
    textAlign: 'center',
    fontWeight: '400',
  },
  socialLoginContainer: {
    marginTop: verticalScale(30),
    gap: verticalScale(15),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: moderateScale(12),
    fontWeight: '400',
  },
  socialButtonsContainer: {
    gap: verticalScale(12),
  },
  socialButton: {
    width: '100%',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: verticalScale(2)},
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(3),
    elevation: 2,
  },
  appleButtonText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#FFFFFF',
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
});

export default SelectRoleScreen;

