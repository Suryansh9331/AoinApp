import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
import ActionButton from '../reuseable/ActionButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../utils/Colors';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import { Image } from 'react-native';
const {width} = Dimensions.get('window');

const OnboardingScreen1 = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const {backgroundColor, textColor} = getThemeColors(theme);

  const handleNext = () => {
    navigation.navigate('Onboarding2');
  };

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <View style={styles.iconContainer}>
        <Image
          source={require('../../../assest/images/Onboarding1.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, {color: textColor}]}>
          One Place, All You Need
        </Text>
        <Text style={[styles.description, {color: textColor, opacity: 0.7}]}>
          Discover thousands of products with seamless browsing.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <ActionButton
          title="Next"
          onPress={handleNext}
          bgColor={Colors.PRIMARY}
          width="90%"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(80),
  },
  contentContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  description: {
    fontSize: moderateScale(16),
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
  buttonContainer: {
    paddingBottom: verticalScale(40),
    alignItems: 'center',
  },

  image: {
  width: moderateScale(290),
  height: moderateScale(290),
},

});

export default OnboardingScreen1;
