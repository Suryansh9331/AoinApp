import React, { useState } from 'react';
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
                Sigin as a Merchants 
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
});

export default SelectRoleScreen;

