import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import VideoReel from '../../components/VideoReel/VideoReel';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import reelsData from '../../data/reels';
import { moderateScale } from 'react-native-size-matters';

const Home = () => {
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const [reels, setReels] = useState([]);

  useEffect(() => {
    // Load reels data from JSON
    setReels(reelsData);
  }, []);

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
      <VideoReel data={reels} />
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
});

export default Home;




