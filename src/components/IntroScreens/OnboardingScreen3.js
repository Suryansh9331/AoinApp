import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import ActionButton from '../reuseable/ActionButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../utils/Colors';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';

const OnboardingScreen3 = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const { backgroundColor, textColor } = getThemeColors(theme);

  const handleNext = () => {
    navigation.navigate('SelectRole');
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="rocket-outline" size={moderateScale(100)} color={Colors.PRIMARY} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: textColor }]}>Start Your Journey</Text>
        <Text style={[styles.description, { color: textColor, opacity: 0.7 }]}>
          Join our community and start building your creative career. Share your work and get discovered.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <ActionButton
          title="Get Started"
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
    fontSize: moderateScale(28),
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
});

export default OnboardingScreen3;

