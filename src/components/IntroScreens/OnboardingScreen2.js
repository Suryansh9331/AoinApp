// import React from 'react';
// import {View, Text, StyleSheet} from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
// import ActionButton from '../reuseable/ActionButton';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import {Colors} from '../../utils/Colors';
// import useAppTheme from '../../theme/useAppTheme';
// import {getThemeColors} from '../../theme/themeColors';
// import {Image} from 'react-native';
// const OnboardingScreen2 = () => {
//   const navigation = useNavigation();
//   const theme = useAppTheme();
//   const {backgroundColor, textColor} = getThemeColors(theme);

//   const handleNext = () => {
//     navigation.navigate('Onboarding3');
//   };

//   return (
//     <View style={[styles.container, {backgroundColor}]}>
//       <View style={styles.iconContainer}>
//         <Image
//           source={require('../../../assest/images/Onboarding2.png')}
//           style={styles.image}
//           resizeMode="contain"
//         />
//       </View>

//       <View style={styles.contentContainer}>
//         <Text style={[styles.title, {color: textColor}]}>
//           Fast, Easy & Secure
//         </Text>
//         <Text style={[styles.description, {color: textColor, opacity: 0.7}]}>
//           From personalized storefronts to secure checkout
//         </Text>
//       </View>

//       <View style={styles.buttonContainer}>
//         <ActionButton
//           title="Next"
//           onPress={handleNext}
//           bgColor={Colors.PRIMARY}
//           width="90%"
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: scale(20),
//   },
//   iconContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: verticalScale(80),
//   },
//   contentContainer: {
//     flex: 0.5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: scale(20),
//   },
//   title: {
//     fontSize: moderateScale(28),
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: verticalScale(16),
//   },
//   description: {
//     fontSize: moderateScale(16),
//     textAlign: 'center',
//     lineHeight: moderateScale(24),
//   },
//   buttonContainer: {
//     paddingBottom: verticalScale(40),
//     alignItems: 'center',
//   },
//   image: {
//   width: moderateScale(290),
//   height: moderateScale(290),
// },

// });

// export default OnboardingScreen2;


// import React from 'react';
// import {View, Text, StyleSheet, Dimensions} from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
// import ActionButton from '../reuseable/ActionButton';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import {Colors} from '../../utils/Colors';
// import useAppTheme from '../../theme/useAppTheme';
// import {getThemeColors} from '../../theme/themeColors';
// import { Image } from 'react-native';
// const {width} = Dimensions.get('window');

// const OnboardingScreen1 = () => {
//   const navigation = useNavigation();
//   const theme = useAppTheme();
//   const {backgroundColor, textColor} = getThemeColors(theme);

//   const handleNext = () => {
//     navigation.navigate('Onboarding2');
//   };

//   return (
//     <View style={[styles.container, {backgroundColor}]}>
//       <View style={styles.iconContainer}>
//         <Image
//           source={require('../../../assest/images/Onboarding1.png')}
//           style={styles.image}
//           resizeMode="contain"
//         />
//       </View>

//       <View style={styles.contentContainer}>
//         <Text style={[styles.title, {color: textColor}]}>
//           One Place, All You Need
//         </Text>
//         <Text style={[styles.description, {color: textColor, opacity: 0.7}]}>
//           Discover thousands of products with seamless browsing.
//         </Text>
//       </View>

//       <View style={styles.buttonContainer}>
//         <ActionButton
//           title="Next"
//           onPress={handleNext}
//           bgColor={Colors.PRIMARY}
//           width="90%"
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: scale(20),
//   },
//   iconContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: verticalScale(80),
//   },
//   contentContainer: {
//     flex: 0.5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: scale(20),
//   },
//   title: {
//     fontSize: moderateScale(24),
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: verticalScale(16),
//   },
//   description: {
//     fontSize: moderateScale(16),
//     textAlign: 'center',
//     lineHeight: moderateScale(24),
//   },
//   buttonContainer: {
//     paddingBottom: verticalScale(40),
//     alignItems: 'center',
//   },

//   image: {
//   width: moderateScale(290),
//   height: moderateScale(290),
// },

// });

// export default OnboardingScreen1;


import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const ORANGE = '#F2631F';
const CARD_BG = '#FFDFD0';
const WHITE = '#FFFFFF';

const OnboardingScreen2 = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── IMAGE SECTION ── */}
      <View style={styles.imageSection}>
        <View style={styles.heroImageWrapper}>
          <Image
            source={require('../../../assest/images/image2.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Pagination dots — 2nd active */}
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* ── BOTTOM CARD ── */}
      <View style={styles.card}>

        {/* "India's First" pill badge */}
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>🇮🇳  India's First</Text>
        </View>

        {/* Heading with inline orange */}
        <Text style={styles.heading}>
          India's First{' '}
          <Text style={styles.headingOrange}>Age-Based</Text>
          {'\n'}Reel Shopping App
        </Text>

        {/* Two description lines */}
        <Text style={styles.description}>
          Discover products through reels created by real creators.
        </Text>
        <Text style={styles.description}>
          Shop smarter with products curated for your age and lifestyle
        </Text>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate('Onboarding3')}
        >
          <Text style={styles.ctaText}>Next</Text>
          <View style={styles.ctaIconWrapper}>
            <Ionicons name="arrow-forward" size={20} color={ORANGE} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },

  /* IMAGE SECTION */
  imageSection: {
    flex: 1,
    backgroundColor: WHITE,
  },
  heroImageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: width,
    height: undefined,
    aspectRatio: 1.3,
  },

  /* DOTS */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
  },
  dotActive: {
    backgroundColor: ORANGE,
    width: 20,
    borderRadius: 4,
  },

  /* BOTTOM CARD */
  card: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },

  /* India's First pill */
  pillBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 14,
  },
  pillText: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    fontSize: 13,
    color: ORANGE,
  },

  /* Heading */
  heading: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontSize: 26,
    color: '#1A1A1A',
    lineHeight: 36,
    marginBottom: 14,
  },
  headingOrange: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontSize: 26,
    color: ORANGE,
  },

  /* Description */
  description: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    fontSize: 14,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 10,
  },

  /* CTA BUTTON */
  ctaButton: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
  },
  ctaText: {
    color: WHITE,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  ctaIconWrapper: {
    backgroundColor: WHITE,
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});