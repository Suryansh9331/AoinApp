import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/Header/Header';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { moderateScale } from 'react-native-size-matters';

const Home = () => {
  const theme = useAppTheme();
  const { backgroundColor, textColor } = getThemeColors(theme);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header 
        title="Home" 
        showThemeToggle={true}
        leftType="none"
      />
      <View style={styles.content}>
        <Text style={[styles.text, { color: textColor }]}>Home Screen</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
  },
});

export default Home;

