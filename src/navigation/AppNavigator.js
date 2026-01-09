import React, { useState, useEffect, useRef } from 'react';
import {StatusBar, View, ActivityIndicator} from 'react-native';
import {NavigationContainer, CommonActions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector, useDispatch} from 'react-redux';
import { getItem, setItem, getValidAuthData, AUTH_STORAGE_KEY, removeItem } from '../utils/MMKVStorage';
import { login_Success } from '../redux/slices/authSlice';
import { setAuthToken, clearAuthToken } from '../utils/APiCall';
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
import MerchantSettings from '../screens/merchant/Settings';
import HelpCenter from '../screens/user/HelpCenter';
import MyProfile from '../screens/user/MyProfile';
import EditProfile from '../screens/merchant/EditProfile';
import MyProfileEdit from '../screens/user/MyProfileEdit';
import PerticularReelProfile from '../screens/user/PerticularReelProfile';
import Post from '../screens/merchant/Post';
import Massages from '../screens/merchant/Massages';
import UserReelsView from '../screens/merchant/UserReelsView.js';
const Stack = createNativeStackNavigator();

const INTRO_COMPLETED_KEY = 'intro_completed';

const AppNavigator = () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const userData = useSelector(state => state.auth.data);
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const [hasSeenIntro, setHasSeenIntro] = useState(null);
  const [isNavReady, setIsNavReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userRole = userData?.data?.role || userData?.role || 'user';
  const navigationRef = useRef(null);
  const isAuthenticated = Boolean(token);
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    // Check if user has seen intro screens and restore auth token
    const initializeApp = async () => {
      try {
        // Check intro status
        const introCompleted = getItem(INTRO_COMPLETED_KEY);
        if (introCompleted && typeof introCompleted === 'string') {
          setHasSeenIntro(introCompleted === 'true');
        } else {
          setHasSeenIntro(false);
        }

        // Restore auth token from MMKV storage if not in Redux
        // Only restore if token is not expired
        if (!token) {
          const storedAuthData = getValidAuthData(); // This checks expiration automatically
          if (storedAuthData && storedAuthData.token) {
            console.log('Restoring auth token from MMKV storage');
            const { token: storedToken, userData: storedUserData, refreshToken, expiresAt } = storedAuthData;
            
            // Log expiration info
            if (expiresAt) {
              const expiresDate = new Date(expiresAt);
              const timeRemaining = expiresAt - Date.now();
              const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
              console.log(`Token expires on: ${expiresDate.toLocaleString()}, ${daysRemaining} days remaining`);
            }
            
            // Set token in APiCall module
            setAuthToken(storedToken);
            
            // Restore Redux state
            dispatch(
              login_Success({
                data: storedUserData,
                token: storedToken,
                refreshToken: refreshToken,
              })
            );
            console.log('Auth token restored successfully - user will remain logged in');
          } else {
            console.log('No valid auth token found in storage (expired or missing)');
          }
        } else {
          // If token exists in Redux, ensure it's also in APiCall module
          setAuthToken(token);
        }
      } catch (error) {
        console.log('Error initializing app:', error);
        setHasSeenIntro(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch, token]);

  // Handle navigation when authentication status changes (only on change, not initial load)
  useEffect(() => {
    if (isLoading || !isNavReady || !navigationRef.current) {
      return;
    }

    // Keep axios interceptor token in sync with Redux token
    if (isAuthenticated && token) {
      setAuthToken(token);
    } else if (!isAuthenticated) {
      clearAuthToken();
      removeItem(AUTH_STORAGE_KEY);
    }

      // Navigate if auth status changed from false to true (after login)
      if (isAuthenticated && !prevAuthRef.current) {
        const targetRoute = userRole === 'merchant' ? 'MerchantBottomTab' : 'UserBottomTab';
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: targetRoute }],
          })
        );
    } else if (!isAuthenticated && prevAuthRef.current) {
        setTimeout(() => {
        if (navigationRef.current) {
            navigationRef.current.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              })
            );
          }
        }, 100);
      }

      prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, userRole, isLoading, isNavReady, token]);

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
    <NavigationContainer ref={navigationRef} onReady={() => setIsNavReady(true)}>
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
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="MerchantSettings" component={MerchantSettings} />
        <Stack.Screen name="PerticularReelProfile" component={PerticularReelProfile} />
        <Stack.Screen 
          name="UserReelsView" 
          component={UserReelsView}
          options={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen name="MyProfileEdit" component={MyProfileEdit} />
        <Stack.Screen 
          name="Post" 
          component={Post}
          options={{
            headerShown: true,
            title: 'Create Post',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen name="Massages" component={Massages} />
        <Stack.Screen name="MerchantBottomTab" component={MerchantBottomTab} />
        <Stack.Screen name="UserBottomTab" component={UserBottomTab} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
