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
// const OnboardingScreen3 = () => {
//   const navigation = useNavigation();
//   const theme = useAppTheme();
//   const {backgroundColor, textColor} = getThemeColors(theme);

//   const handleNext = () => {
//     navigation.navigate('SelectRole');
//   };

//   return (
//     <View style={[styles.container, {backgroundColor}]}>
//       <View style={styles.iconContainer}>
//         <Image
//           source={require('../../../assest/images/image2.png')}
//           style={styles.image}
//           resizeMode="contain"
//         />
//       </View>

//       <View style={styles.contentContainer}>
//         <Text style={[styles.title, {color: textColor}]}>
//           Easy and Happy Shopping
//         </Text>
//         <Text style={[styles.description, {color: textColor, opacity: 0.7}]}>
//           Start shopping now and enjoy a world of convenience .
//         </Text>
//       </View>

//       <View style={styles.buttonContainer}>
//         <ActionButton
//           title="Get Started"
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
//     fontSize: moderateScale(22),
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
//     width: moderateScale(300),
//     height: moderateScale(300),
//   },
// });

// export default OnboardingScreen3;

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

const {width} = Dimensions.get('window');

const ORANGE = '#F2631F';
const CARD_BG = '#FFDFD0';
const WHITE = '#FFFFFF';

const OnboardingScreen3 = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── IMAGE SECTION ── */}
      <View style={styles.imageSection}>
        <View style={styles.heroImageWrapper}>
          <Image
            source={require('../../../assest/images/image3.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Pagination dots — 3rd active */}
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
      </View>

      {/* ── BOTTOM CARD ── */}
      <View style={styles.card}>
        {/* Heading: "Shop Through " + orange "Creator\nReels" */}
        <Text style={styles.heading}>
          Shop Through{' '}
          <Text style={styles.headingOrange}>Creator{'\n'}Reels</Text>
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Watch short product videos from creators.{'\n'}
          See real reviews before you buy.
        </Text>

        {/* Chips row 1 */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>🎬 Reel product demos</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>⭐ Real creator reviews</Text>
          </View>
        </View>

        {/* Chips row 2 */}
        <View style={styles.chipsRowSingle}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Instant buy from video 🛍️</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
         onPress={() => navigation.navigate('SelectRole')}
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

export default OnboardingScreen3;

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
    aspectRatio: 1.1,
  },

  /* DOTS */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 22,
    paddingBottom: 28,
  },

  /* Heading */
  heading: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontSize: 26,
    color: '#1A1A1A',
    lineHeight: 36,
    marginBottom: 12,
  },
  headingOrange: {
    color: ORANGE,
  },

  /* Description */
  description: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    fontSize: 14,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 16,
  },

  /* CHIPS */
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  chipsRowSingle: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chipText: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    fontSize: 13,
    color: '#333333',
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
