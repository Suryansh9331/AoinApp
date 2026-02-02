import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const {height} = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const theme = useColorScheme(); // 'light' | 'dark'

  const translateY = useRef(new Animated.Value(-height)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Falling animation
      Animated.spring(translateY, {
        toValue: 0,
        tension: 16,
        friction: 16,
        useNativeDriver: true,
      }),

      // Small zoom after landing
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace('Onboarding1');
    });
  }, []);

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme === 'dark' ? '#000' : '#fff'},
      ]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />

      <Animated.Image
        source={require('../../../assest/images/AppLogo.png')} // <-- YOUR LOGO
        style={[
          styles.logo,
          {
            transform: [{translateY}, {scale}],
          },
        ]}
        resizeMode="contain"
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
