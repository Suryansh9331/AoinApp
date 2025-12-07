import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import VideoReel from '../../components/VideoReel/VideoReel';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { moderateScale } from 'react-native-size-matters';
import { fetchMerchantReels_Request } from '../../redux/slices/reelSlice';

const Home = ({ routeParams }) => {
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const dispatch = useDispatch();
  const route = useRoute();
  
  // Get reels from Redux store
  const { reels, loading, error } = useSelector(state => state.reels);
  
  // Get reelId from route params (passed from Profile screen)
  const reelId = routeParams?.reelId || route.params?.reelId;

  useEffect(() => {
    // Only fetch reels if they're not already loaded
    // Don't fetch if we have a reelId (coming from navigation) and reels exist
    if (reels.length === 0 && !loading) {
      dispatch(fetchMerchantReels_Request({ page: 1, per_page: 20 }));
    }
  }, [dispatch]);

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
      {reels.length > 0 ? (
        <VideoReel data={reels} initialReelId={reelId} />
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F2631F" />
          <Text style={styles.loadingText}>Loading reels...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No reels available</Text>
        </View>
      )}
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
});

export default Home;





