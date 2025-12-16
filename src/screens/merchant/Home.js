import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import VideoReel from '../../components/VideoReel/VideoReel';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { moderateScale } from 'react-native-size-matters';
import { fetchPublicReels_Request } from '../../redux/slices/reelSlice';
import Header from '../../components/Header/Header';

const Home = ({ routeParams, initialReels }) => {
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const dispatch = useDispatch();
  const route = useRoute();
  const [hasFetched, setHasFetched] = React.useState(false);

  // Get public reels from Redux store
  const { publicReels, publicReelsLoading, publicReelsError } = useSelector(state => state.reels);

  
  const reelId = routeParams?.reelId || route.params?.reelId;

  
  const preloadedReels = initialReels || routeParams?.preloadedReels || route.params?.preloadedReels;
  const initialData = (preloadedReels && preloadedReels.length > 0) ? preloadedReels : publicReels;

  
  useEffect(() => {
    // Only fetch public reels when no preloaded data is provided, no existing error, and we haven't fetched yet
    if ((!preloadedReels || preloadedReels.length === 0) && 
        publicReels.length === 0 && 
        !publicReelsLoading && 
        !publicReelsError &&
        !hasFetched) {
      setHasFetched(true);
      dispatch(fetchPublicReels_Request({ page: 1, per_page: 20 }));
    }
  }, [dispatch, preloadedReels, publicReels.length, publicReelsLoading, publicReelsError, hasFetched]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />
      <SafeAreaView style={{ backgroundColor: '#000000' }}>
        <Header 
          title="Reels" 
          leftType="none" 
          rightType="none" 
          containerStyle={{ 
            backgroundColor: '#000000',
            borderBottomWidth: 0
          }}
          titleStyle={{ color: '#FFFFFF' }}
        />
      </SafeAreaView>
      {initialData.length > 0 ? (
        <VideoReel data={initialData} initialReelId={reelId} />
      ) : publicReelsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F2631F" />
          <Text style={styles.loadingText}>Loading reels...</Text>
        </View>
      ) : publicReelsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{publicReelsError}</Text>
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





