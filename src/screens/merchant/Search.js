import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { moderateScale } from 'react-native-size-matters';

const Search = () => {
  const theme = useAppTheme();
  const { backgroundColor, textColor } = getThemeColors(theme);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>Search Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
  },
});

export default Search;








