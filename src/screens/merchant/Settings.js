// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Alert,
//   SafeAreaView,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useDispatch } from 'react-redux';
// import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
// import useAppTheme from '../../theme/useAppTheme';
// import { getThemeColors } from '../../theme/themeColors';
// import { Colors } from '../../utils/Colors';
// import { clearCredentials } from '../../redux/slices/authSlice';
// import { clearAuthToken } from '../../utils/APiCall';
// import { removeItem, AUTH_STORAGE_KEY } from '../../utils/MMKVStorage';
// import Header from '../../components/Header/Header';

// const MerchantSettings = () => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const theme = useAppTheme();
//   const { backgroundColor, textColor, borderColor } = getThemeColors(theme);

//   const rows = [
//     {
//       title: 'Edit Account',
//       onPress: () => navigation.navigate('EditProfile'),
//     },
//     {
//       title: 'Change Password',
//       // Placeholder route; enable when screen exists
//       disabled: true,
//     },
//     {
//       title: 'General Settings',
//       onPress: () => navigation.navigate('Settings'), // reuse if exists
//     },
//   ];

//   const supportRows = [
//     {
//       title: '24*7 Support',
//       onPress: () => navigation.navigate('HelpCenter'),
//     },
//   ];

//   const handleLogout = () => {
//     Alert.alert(
//       'Sign Out',
//       'Are you sure you want to sign out?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Sign Out',
//           style: 'destructive',
//           onPress: () => {
//             dispatch(clearCredentials());
//             clearAuthToken();
//             removeItem(AUTH_STORAGE_KEY);
//             navigation.reset({
//               index: 0,
//               routes: [{ name: 'Splash' }],
//             });
//           },
//         },
//       ],
//     );
//   };

//   const renderRow = (item, isLast = false) => (
//     <TouchableOpacity
//       key={item.title}
//       style={[
//         styles.row,
//         { borderBottomColor: isLast ? 'transparent' : borderColor },
//         item.disabled && styles.rowDisabled,
//       ]}
//       activeOpacity={item.disabled ? 1 : 0.7}
//       onPress={!item.disabled ? item.onPress : undefined}>
//       <Text style={[styles.rowText, { color: textColor, opacity: item.disabled ? 0.5 : 1 }]}>
//         {item.title}
//       </Text>
//       {!item.disabled && (
//         <Ionicons name="chevron-forward" size={18} color={textColor} />
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor }]}>
      

//       <Header
//        title="Account Settings"
       
//        onLeftPress={() => navigation.goBack()}
       
//       />

//       <View style={styles.section}>
//         <Text style={[styles.sectionTitle, { color: textColor }]}>Account Information</Text>
//         <View style={[
//           styles.card,
//           {
//             borderColor: borderColor,
//             backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF'
//           }
//         ]}>
//           {rows.map((item, idx) => renderRow(item, idx === rows.length - 1))}
//         </View>
//       </View>

//       <View style={styles.section}>
//         <Text style={[styles.sectionTitle, { color: textColor }]}>Service Support</Text>
//         <View style={[
//           styles.card,
//           {
//             borderColor: borderColor,
//             backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF'
//           }
//         ]}>
//           {supportRows.map((item, idx) => renderRow(item, idx === supportRows.length - 1))}
//         </View>
//       </View>

//       <View style={styles.footer}>
//         <TouchableOpacity style={styles.signOutButton} onPress={handleLogout} activeOpacity={0.8}>
//           <Text style={styles.signOutText}>Sign Out</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: scale(16),
//     paddingVertical: verticalScale(12),
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   headerButton: {
//     padding: scale(6),
//   },
//   headerTitle: {
//     fontSize: moderateScale(18),
//     fontWeight: '700',
//   },
//   headerSpacer: {
//     width: scale(28),
//   },
//   section: {
//     paddingHorizontal: scale(16),
//     paddingTop: verticalScale(18),
//   },
//   sectionTitle: {
//     fontSize: moderateScale(14),
//     fontWeight: '600',
//     marginBottom: verticalScale(8),
//   },
//   card: {
//     borderWidth: StyleSheet.hairlineWidth,
//     borderRadius: moderateScale(10),
//     overflow: 'hidden',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: scale(14),
//     paddingVertical: verticalScale(14),
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   rowText: {
//     fontSize: moderateScale(14),
//     fontWeight: '500',
//   },
//   rowDisabled: {
//     opacity: 0.5,
//   },
//   footer: {
//     marginTop: 'auto',
//     paddingHorizontal: scale(24),
//     paddingVertical: verticalScale(20),
//   },
//   signOutButton: {
//     backgroundColor: Colors.PRIMARY,
//     paddingVertical: verticalScale(14),
//     borderRadius: moderateScale(24),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   signOutText: {
//     color: '#FFFFFF',
//     fontSize: moderateScale(15),
//     fontWeight: '700',
//   },
// });

// export default MerchantSettings;

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { Colors } from '../../utils/Colors';
import { clearCredentials } from '../../redux/slices/authSlice';
import { clearAuthToken } from '../../utils/APiCall';
import { removeItem, AUTH_STORAGE_KEY } from '../../utils/MMKVStorage';
import Header from '../../components/Header/Header';

const MerchantSettings = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);

  /** ---------- Entrance Animation ---------- */
  const sectionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sectionAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  /** ---------- Subtle Row Colors ---------- */
  const ROW_BG =
    theme === 'dark'
      ? 'rgba(255,255,255,0.04)'
      : 'rgba(0,0,0,0.03)';

  const ROW_BG_PRESSED =
    theme === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.06)';

  const rows = [
    { title: 'Edit Account', onPress: () => navigation.navigate('EditProfile') },
    { title: 'Change Password', disabled: true },
    { title: 'General Settings', onPress: () => navigation.navigate('Settings') },
  ];

  const supportRows = [
    { title: '24*7 Support', onPress: () => navigation.navigate('HelpCenter') },
  ];

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          dispatch(clearCredentials());
          clearAuthToken();
          removeItem(AUTH_STORAGE_KEY);
          navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
        },
      },
    ]);
  };

  /** ---------- Animated Row ---------- */
  const AnimatedRow = ({ item, isLast }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const lift = useRef(new Animated.Value(0)).current;
    const arrow = useRef(new Animated.Value(0)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    const pressIn = () => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }),
        Animated.timing(lift, { toValue: -2, duration: 120, useNativeDriver: true }),
        Animated.timing(arrow, { toValue: 4, duration: 120, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
      ]).start();
    };

    const pressOut = () => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(arrow, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 0, duration: 120, useNativeDriver: false }),
      ]).start();
    };

    const rowBgColor = bgAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [ROW_BG, ROW_BG_PRESSED],
    });

    return (
      <Animated.View style={{ transform: [{ scale }, { translateY: lift }] }}>
        <Animated.View style={{ backgroundColor: rowBgColor }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={!item.disabled ? item.onPress : undefined}
            onPressIn={!item.disabled ? pressIn : undefined}
            onPressOut={!item.disabled ? pressOut : undefined}
            style={[
              styles.row,
              { borderBottomColor: isLast ? 'transparent' : borderColor },
              item.disabled && styles.rowDisabled,
            ]}
          >
            <Text
              style={[
                styles.rowText,
                { color: textColor, opacity: item.disabled ? 0.5 : 1 },
              ]}
            >
              {item.title}
            </Text>

            {!item.disabled && (
              <Animated.View style={{ transform: [{ translateX: arrow }] }}>
                <Ionicons name="chevron-forward" size={18} color={textColor} />
              </Animated.View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  /** ---------- Button ---------- */
  const btnScale = useRef(new Animated.Value(1)).current;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Header title="Account Settings" onLeftPress={() => navigation.goBack()} />

      <Animated.View
        style={{
          opacity: sectionAnim,
          transform: [
            {
              translateY: sectionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        }}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Account Information
          </Text>
          <View
            style={[
              styles.card,
              {
                borderColor,
                backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
              },
            ]}
          >
            {rows.map((item, idx) => (
              <AnimatedRow key={item.title} item={item} isLast={idx === rows.length - 1} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Service Support
          </Text>
          <View
            style={[
              styles.card,
              {
                borderColor,
                backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
              },
            ]}
          >
            {supportRows.map((item) => (
              <AnimatedRow key={item.title} item={item} isLast />
            ))}
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  section: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(15),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  rowDisabled: { opacity: 0.5 },

  footer: {
    marginTop: 'auto',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(20),
  },
  signOutButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(28),
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFF',
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
});

export default MerchantSettings;
