// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   Dimensions,
//   StatusBar,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { moderateScale, verticalScale } from 'react-native-size-matters';
// import { Colors } from '../../utils/Colors';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const { width, height } = Dimensions.get('window');

// const SplashScreen = () => {
//   const navigation = useNavigation();
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.5)).current;

//   useEffect(() => {
//     // Logo animation
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1500,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         tension: 50,
//         friction: 7,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Navigate to Onboarding1 after 3 seconds
//     const timer = setTimeout(() => {
//       try {
//         navigation.replace('Onboarding1');
//       } catch (error) {
   
//         navigation.navigate('Onboarding1');
//       }
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <View style={styles.container}>
//       <StatusBar 
//         barStyle="light-content" 
//         backgroundColor={Colors.PRIMARY} 
//         translucent={false}
//       />
//       <Animated.View
//         style={[
//           styles.logoContainer,
//           {
//             opacity: fadeAnim,
//             transform: [{ scale: scaleAnim }],
//           },
//         ]}>
//         <View style={styles.logoCircle}>
//           <Ionicons name="rocket" size={moderateScale(60)} color={Colors.PRIMARY} />
//         </View>
//         <Text style={styles.appName}>AoinApp</Text>
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.PRIMARY,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoCircle: {
//     width: moderateScale(120),
//     height: moderateScale(120),
//     borderRadius: moderateScale(60),
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: verticalScale(20),
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   logoImage: {
//     width: moderateScale(80),
//     height: moderateScale(80),
//   },
//   appName: {
//     fontSize: moderateScale(28),
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     letterSpacing: 2,
//   },
// });

// export default SplashScreen;




import React, { useEffect, useRef } from 'react';
import logo from '../../../assest/images/AppLogo.png';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  useColorScheme,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const theme = useColorScheme(); // 'light' | 'dark'

  // CORE VALUES (kept conceptually same)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // NEW: falling animation
  const translateYAnim = useRef(new Animated.Value(-height)).current;

  useEffect(() => {
    // 🔹 Animation only — no logic change
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),

      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 1600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.08,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 🔒 CORE LOGIC — UNTOUCHED
    const timer = setTimeout(() => {
      try {
        navigation.replace('Onboarding1');
      } catch {
        navigation.navigate('Onboarding1');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF' },
      ]}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#000000' : '#FFFFFF'}
      />

      <Animated.Image
        source={logo}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: translateYAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
});

export default SplashScreen;
