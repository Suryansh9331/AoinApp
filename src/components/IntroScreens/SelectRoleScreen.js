// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
// import { Colors } from '../../utils/Colors';
// import FONTS from '../../utils/Font';
// import useAppTheme from '../../theme/useAppTheme';
// import { getThemeColors } from '../../theme/themeColors';

// const SelectRoleScreen = () => {
//   const navigation = useNavigation();
//   const theme = useAppTheme();
//   const { backgroundColor } = getThemeColors(theme);
//   const [selectedRole, setSelectedRole] = useState(null);

//   const handleRoleSelect = (role) => {
//     setSelectedRole(role);
//     // Navigate to login directly when role is selected
//     navigation.navigate('Login', { role: role });
//   };

//   const handleSignUp = () => {
//     navigation.navigate('SelectSignUpMethod');
//   };

//   return (
//     <View style={[styles.container, { backgroundColor }]}>
//       <View style={styles.header}>
//         <View style={styles.logoContainer}>
//         </View>
       
//       </View>

//       <View style={styles.roleContainer}>
//         <TouchableOpacity
//           style={styles.roleButton}
//           onPress={() => handleRoleSelect('merchant')}
//           activeOpacity={0.8}>
//           <View style={styles.buttonContent}>
          
//             <View style={styles.buttonTextContainer}>
//               <Text style={styles.roleTitle}>
//                 Sign in as a Merchant
//               </Text>
//             </View>
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.roleButton}
//           onPress={() => handleRoleSelect('user')}
//           activeOpacity={0.8}>
//           <View style={styles.buttonContent}>
            
//             <View style={styles.buttonTextContainer}>
//               <Text style={styles.roleTitle}>
//                 Sign in as a User
//               </Text>
//             </View>
//           </View>
//         </TouchableOpacity>

//         {/* Sign Up Text */}
//         <View style={styles.signupContainer}>
         
         
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: scale(20),
//   },
//   header: {
//     paddingTop: verticalScale(60),
//     paddingBottom: verticalScale(40),
//     alignItems: 'center',
//   },
//   logoContainer: {
//     marginBottom: verticalScale(30),
//     alignItems: 'center',
//   },
//   logoImage: {
//     width: moderateScale(120),
//     height: moderateScale(120),
//   },
//   roleContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     gap: verticalScale(20),
//     paddingBottom: verticalScale(40),
//   },
//   roleButton: {
//     backgroundColor: Colors.PRIMARY,
//     borderRadius: moderateScale(16),
//     padding: moderateScale(10),
//     minHeight: verticalScale(50),
//     justifyContent: 'center',
//     shadowColor: Colors.PRIMARY,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   buttonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: scale(15),
//   },
//   iconContainer: {
//     width: moderateScale(40),
//     height: moderateScale(40),
//     borderRadius: moderateScale(14),
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: verticalScale(5),
//   },
//   buttonTextContainer: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   roleTitle: {
//     fontSize: moderateScale(16),
//     color: '#FFFFFF',
//     letterSpacing: 0.5,
//     fontFamily: FONTS.WINDSONG.REGULAR,
//     textAlign: 'center',
//     fontWeight: '400',
//   },
//   signupContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: verticalScale(20),
//   },
//   signupText: {
//     fontSize: moderateScale(14),
//     fontFamily: FONTS.WINDSONG.REGULAR,
//     fontWeight: '400',
//   },
//   signupLink: {
//     fontSize: moderateScale(14),
//     fontFamily: FONTS.WINDSONG.REGULAR,
//     fontWeight: '600',
//     color: Colors.PRIMARY,
//   },
// });

// export default SelectRoleScreen;
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FONTS from '../../utils/Font';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';

const {width} = Dimensions.get('window');
const ORANGE = '#F97316';

// ── Role Card ──────────────────────────────────────────────────────────────────
const RoleCard = ({iconComponent, title, subtitle, onPress}) => (
  <TouchableOpacity style={styles.roleCard} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.cardIconWrap}>{iconComponent}</View>
    <View style={styles.cardTextWrap}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.cardChevronWrap}>
      <Ionicons name="chevron-forward" size={moderateScale(16)} color={ORANGE} />
    </View>
  </TouchableOpacity>
);

// ── Main Screen ────────────────────────────────────────────────────────────────
const SelectRoleScreen = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const {backgroundColor} = getThemeColors(theme);
  const [selectedRole, setSelectedRole] = useState(null);

  // Original logic — untouched
  const handleRoleSelect = role => {
    setSelectedRole(role);
    navigation.navigate('Login', {role});
  };

  const handleSignUp = () => {
    navigation.navigate('SelectSignUpMethod');
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Background image (orange gradient with AOIN logo) ── */}
      <View style={styles.headerImageWrap}>
        <Image
          source={require('../../../assest/images/rolebg.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        {/* Wave vector overlaid at bottom edge of bg image */}
        <Image
          source={require('../../../assest/images/vector.png')}
          style={styles.waveOverlay}
          resizeMode="stretch"
        />
      </View>

      {/* ── White content area ── */}
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Welcome Back 👋</Text>
        <Text style={styles.welcomeSub}>Choose how you'd like to sign in</Text>

        <View style={styles.cardsWrap}>

          {/* Merchant → Seller (role = 'merchant') */}
          <RoleCard
            iconComponent={
              <Feather name="shopping-bag" size={moderateScale(22)} color={ORANGE} />
            }
            title="Sign in as Seller"
            subtitle="List & manage your products"
            onPress={() => handleRoleSelect('merchant')}
          />

          {/* Creator — free, no navigation */}
          <RoleCard
            iconComponent={
              <MaterialCommunityIcons name="star-outline" size={moderateScale(24)} color={ORANGE} />
            }
            title="Sign in as Creator"
            subtitle="Build & share your content"
            onPress={() => {/* free for future use */}}
          />

          {/* User → Buyer (role = 'user') */}
          <RoleCard
            iconComponent={
              <Feather name="shopping-cart" size={moderateScale(22)} color={ORANGE} />
            }
            title="Sign in as Buyer"
            subtitle="Discover & shop with ease"
            onPress={() => handleRoleSelect('user')}
          />

        </View>
      </View>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  headerImageWrap: {
    width: '100%',
    height: verticalScale(280),
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  waveOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width,
    height: verticalScale(30),
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(20),
  },
  welcomeTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: verticalScale(6),
    fontFamily: FONTS.WINDSONG?.BOLD || undefined,
  },
  welcomeSub: {
    fontSize: moderateScale(14),
    color: '#8A8A9A',
    textAlign: 'center',
    marginBottom: verticalScale(28),
    fontFamily: FONTS.WINDSONG?.REGULAR || undefined,
  },

  // Cards
  cardsWrap: {
    gap: verticalScale(14),
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderWidth: 1.5,
    borderColor: '#FFE8D6',
    shadowColor: ORANGE,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    backgroundColor: '#FFF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(14),
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: verticalScale(2),
    fontFamily: FONTS.WINDSONG?.BOLD || undefined,
  },
  cardSubtitle: {
    fontSize: moderateScale(12),
    color: '#8A8A9A',
    fontFamily: FONTS.WINDSONG?.REGULAR || undefined,
  },
  cardChevronWrap: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(10),
    backgroundColor: '#FFF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scale(10),
  },
});

export default SelectRoleScreen;