import React, { useState, useEffect, useRef } from 'react';
import {StatusBar, View, ActivityIndicator} from 'react-native';
import {NavigationContainer, CommonActions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import { getItem, setItem } from '../utils/MMKVStorage';
import useAppTheme from '../theme/useAppTheme';
import { getThemeColors } from '../theme/themeColors';
import { Colors } from '../utils/Colors';
import UserBottomTab from './UserBottomTab';
import MerchantBottomTab from './MerchantBottomTab';
import Login from '../auth/Login/Login';
import SplashScreen from '../components/IntroScreens/SplashScreen';
import OnboardingScreen1 from '../components/IntroScreens/OnboardingScreen1';
import OnboardingScreen2 from '../components/IntroScreens/OnboardingScreen2';
import OnboardingScreen3 from '../components/IntroScreens/OnboardingScreen3';
import SelectRoleScreen from '../components/IntroScreens/SelectRoleScreen';
import Register from '../auth/Register/Register';
import SelectSignUpMethod from '../auth/Register/SelectSignUpMethod';
import VerifyOTP from '../auth/Register/VerifyOTP';
import VerifyOTPLogin from '../auth/Login/VerifyOTPLogin';
import Settings from '../screens/user/Settings';
import HelpCenter from '../screens/user/HelpCenter';
import MyProfile from '../screens/user/MyProfile';
const Stack = createNativeStackNavigator();

const INTRO_COMPLETED_KEY = 'intro_completed';

const AppNavigator = () => {
  const token = useSelector(state => state.auth.token);
  const userData = useSelector(state => state.auth.data);
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const [hasSeenIntro, setHasSeenIntro] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const userRole = userData?.data?.role || userData?.role || 'user';
  const navigationRef = useRef(null);
  const isAuthenticated = Boolean(token);
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    // Check if user has seen intro screens
    const checkIntroStatus = async () => {
      try {
        const introCompleted = getItem(INTRO_COMPLETED_KEY);
        // Safety check: ensure we have a valid string value
        if (introCompleted && typeof introCompleted === 'string') {
          setHasSeenIntro(introCompleted === 'true');
        } else {
          setHasSeenIntro(false);
        }
      } catch (error) {
        console.log('Error checking intro status:', error);
        setHasSeenIntro(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkIntroStatus();
  }, []);

  // Handle navigation when authentication status changes (only on change, not initial load)
  useEffect(() => {
    if (!isLoading && navigationRef.current?.isReady()) {
      // Only navigate if auth status changed from false to true (after login)
      if (isAuthenticated && !prevAuthRef.current) {
        // Navigate to role-based tab after login
        const targetRoute = userRole === 'merchant' ? 'MerchantBottomTab' : 'UserBottomTab';
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: targetRoute }],
          })
        );
      }
      prevAuthRef.current = isAuthenticated;
    }
  }, [isAuthenticated, userRole, isLoading]);

  const markIntroCompleted = () => {
    setItem(INTRO_COMPLETED_KEY, 'true');
    setHasSeenIntro(true);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: backgroundColor }}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  // Always start with Splash screen - let SplashScreen handle navigation logic
  const getInitialRoute = () => {
    return 'Splash';
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <Stack.Navigator 
        screenOptions={{headerShown: false}}
        initialRouteName={getInitialRoute()}
      >
        {/* Always show Splash screen first */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        
        {/* Register all screens so SplashScreen can navigate to any of them */}
        <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
        <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
        <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
        <Stack.Screen 
          name="SelectRole" 
          component={SelectRoleScreen}
          listeners={{
            focus: () => {
              // Mark intro as completed when user reaches SelectRole
              if (!hasSeenIntro) {
                markIntroCompleted();
              }
            },
          }}
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SelectSignUpMethod" component={SelectSignUpMethod} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
        <Stack.Screen name="VerifyOTPLogin" component={VerifyOTPLogin} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="HelpCenter" component={HelpCenter} />
        <Stack.Screen name="MyProfile" component={MyProfile} />
        <Stack.Screen name="MerchantBottomTab" component={MerchantBottomTab} />
        <Stack.Screen name="UserBottomTab" component={UserBottomTab} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
