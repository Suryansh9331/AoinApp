import React from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const Home = () => {
  const theme = useAppTheme();
  const { backgroundColor, textColor } = getThemeColors(theme);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />
      <View style={styles.headerContainer} pointerEvents="box-none">
        <View style={styles.headerContent}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>Reels</Text>
          <View style={styles.headerRight} />
        </View>
      </View>
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, {color: textColor}]}>
          Reels feature coming soon
        </Text>
        <Text style={[styles.emptySubText, {color: textColor}]}>
          Check back later for exciting content
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 36,
    height: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 12,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: moderateScale(14),
    color: '#FF3040',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  emptySubText: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default Home;





