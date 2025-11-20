import React, { useState, useEffect } from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import { getItem, setItem } from '../utils/MMKVStorage';
import useAppTheme from '../theme/useAppTheme';
import { getThemeColors } from '../theme/themeColors';
import BottomTab from './BottomTab';
import Login from '../auth/Login/Login';
import SplashScreen from '../components/IntroScreens/SplashScreen';
import OnboardingScreen1 from '../components/IntroScreens/OnboardingScreen1';
import OnboardingScreen2 from '../components/IntroScreens/OnboardingScreen2';
import OnboardingScreen3 from '../components/IntroScreens/OnboardingScreen3';
import SelectRoleScreen from '../components/IntroScreens/SelectRoleScreen';
import Register from '../auth/Register/Register';
const Stack = createNativeStackNavigator();

const INTRO_COMPLETED_KEY = 'intro_completed';

const AppNavigator = () => {
  const token = useSelector(state => state.auth.token);
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const [hasSeenIntro, setHasSeenIntro] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const markIntroCompleted = () => {
    setItem(INTRO_COMPLETED_KEY, 'true');
    setHasSeenIntro(true);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  const isAuthenticated = Boolean(token);

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!hasSeenIntro ? (
          // Show intro screens for first time users
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
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
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : !isAuthenticated ? (
          // User has seen intro but not authenticated
          <>
            <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : (
          // User is authenticated
          <Stack.Screen name="BottomTab" component={BottomTab} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
