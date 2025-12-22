import React, {useEffect, useMemo, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useRoute} from '@react-navigation/native';
import VideoReel from '../../components/VideoReel/VideoReel';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {fetchPublicReels_Request} from '../../redux/slices/reelSlice';
import Header from '../../components/Header/Header';

const Home = ({routeParams, initialReels}) => {
  const theme = useAppTheme();
  const {backgroundColor} = getThemeColors(theme);
  const dispatch = useDispatch();
  const route = useRoute();
  const [hasFetched, setHasFetched] = React.useState(false);

  const {publicReels, publicReelsLoading, publicReelsError} = useSelector(
    state => state.reels,
  );

  const [currentReelId, setCurrentReelId] = React.useState(
    routeParams?.reelId || route.params?.reelId,
  );
  const [preloadedReels, setPreloadedReels] = React.useState(
    initialReels ||
      routeParams?.preloadedReels ||
      route.params?.preloadedReels ||
      [],
  );

  const previousReelsRef = useRef([]);
  const previousPreloadedRef = useRef([]);

  React.useEffect(() => {
    const newReelId = routeParams?.reelId || route.params?.reelId;
    const newPreloadedReels =
      initialReels ||
      routeParams?.preloadedReels ||
      route.params?.preloadedReels ||
      [];

    if (newReelId !== currentReelId) {
      setCurrentReelId(newReelId);
    }

    const currentIds = previousPreloadedRef.current
      .map(r => r.id || r.reel_id)
      .sort()
      .join(',');
    const newIds = newPreloadedReels
      .map(r => r.id || r.reel_id)
      .sort()
      .join(',');
    const preloadedChanged = currentIds !== newIds;

    if (preloadedChanged) {
      setPreloadedReels(newPreloadedReels);
      previousPreloadedRef.current = newPreloadedReels;
    }
  }, [routeParams, route.params, initialReels, currentReelId]);

  const displayData = useMemo(() => {
    if (preloadedReels.length > 0) {
      const preloadedIds = new Set(
        preloadedReels
          .map(r => (r.id || r.reel_id)?.toString())
          .filter(Boolean),
      );

      const additionalReels = publicReels.filter(r => {
        const reelId = (r.id || r.reel_id)?.toString();
        return reelId && !preloadedIds.has(reelId);
      });

      return [...preloadedReels, ...additionalReels];
    }
    return publicReels;
  }, [preloadedReels, publicReels]);

  const fetchReels = useCallback(() => {
    if (!publicReelsLoading && !hasFetched) {
      setHasFetched(true);
      dispatch(fetchPublicReels_Request({page: 1, per_page: 20}));
    }
  }, [dispatch, publicReelsLoading, hasFetched]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const showLoading = useMemo(
    () => displayData.length === 0 && (publicReelsLoading || !hasFetched),
    [displayData.length, publicReelsLoading, hasFetched],
  );

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />
      <SafeAreaView style={{backgroundColor: '#000000'}}>
        <Header
          title="Reels"
          leftType="none"
          rightType="none"
          containerStyle={{
            backgroundColor: '#000000',
            borderBottomWidth: 0,
          }}
          titleStyle={{color: '#FFFFFF'}}
        />
      </SafeAreaView>
      {showLoading && displayData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F2631F" />
          <Text style={styles.loadingText}>Loading reels...</Text>
        </View>
      ) : publicReelsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{publicReelsError}</Text>
        </View>
      ) : displayData.length > 0 ? (
        <VideoReel
          data={displayData}
          initialReelId={currentReelId}
          key={`video-reel-${currentReelId || 'default'}`}
        />
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





