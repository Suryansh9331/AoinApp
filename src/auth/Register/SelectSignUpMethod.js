import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
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

const SelectSignUpMethod = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);

  const handleMethodSelect = (method) => {
    navigation.navigate('Register', { method: method });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
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
          Choose how you want to sign up
        </Text>

        <View style={styles.methodsContainer}>
          <TouchableOpacity
            style={[
              styles.methodCard,
              { borderColor: borderColor }
            ]}
            onPress={() => handleMethodSelect('email')}
            activeOpacity={0.7}>
            <View style={styles.methodIconContainer}>
              <MaterialIcons name="email" size={moderateScale(32)} color={Colors.PRIMARY} />
            </View>
            <Text style={[styles.methodTitle, { color: textColor }]}>
              Sign up with Email
            </Text>
            <Text style={[styles.methodDescription, { color: textColor }]}>
              Use your email address to create an account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              { borderColor: borderColor }
            ]}
            onPress={() => handleMethodSelect('phone')}
            activeOpacity={0.7}>
            <View style={styles.methodIconContainer}>
              <Ionicons name="call" size={moderateScale(32)} color={Colors.PRIMARY} />
            </View>
            <Text style={[styles.methodTitle, { color: textColor }]}>
              Sign up with Phone
            </Text>
            <Text style={[styles.methodDescription, { color: textColor }]}>
              Use your phone number to create an account
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
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  logoImage: {
    width: moderateScale(100),
    height: moderateScale(100),
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
    gap: verticalScale(20),
  },
  methodCard: {
    borderWidth: moderateScale(1.5),
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  methodIconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: `${Colors.PRIMARY}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  methodTitle: {
    fontSize: moderateScale(18),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '600',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  methodDescription: {
    fontSize: moderateScale(13),
    fontFamily: FONTS.WINDSONG.REGULAR,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default SelectSignUpMethod;

