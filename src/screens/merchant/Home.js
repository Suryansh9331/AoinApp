import React, {useEffect, useMemo, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VideoReel from '../../components/VideoReel/VideoReel';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {moderateScale} from 'react-native-size-matters';
import {fetchPublicReels_Request} from '../../redux/slices/reelSlice';
import Header from '../../components/Header/Header';
import {getData} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';
import {Colors} from '../../utils/Colors';

const Home = ({routeParams, initialReels}) => {
  const theme = useAppTheme();
  const {backgroundColor} = getThemeColors(theme);
  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const [hasFetched, setHasFetched] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const {publicReels, publicReelsLoading, publicReelsError} = useSelector(
    state => state.reels,
  );
  const authData = useSelector(state => state.auth);
 console.log('publicReels', publicReels);
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
  }, []); // Remove fetchReels dependency to prevent repeated calls

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    // Check if user is logged in before making API call
    if (!authData?.token || !authData?.data) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await getData(ROUTES.NOTIFICATIONS_UNREAD_COUNT);
      if (response && response.status === 'success' && response.data) {
        const count = typeof response.data === 'number' 
          ? response.data 
          : response.data.count || response.data.unread_count || 0;
        setUnreadCount(count);
      } else if (response && typeof response === 'number') {
        setUnreadCount(response);
      } else if (response && response.count !== undefined) {
        setUnreadCount(response.count);
      } else if (response && response.unread_count !== undefined) {
        setUnreadCount(response.unread_count);
      }
    } catch (error) {
      // Silently handle 401 errors (user logged out)
      if (error?.status === 401 || (error?.type === 'response' && error?.status === 401)) {
        setUnreadCount(0);
        return;
      }
      // Only log non-401 errors
      if (error?.status !== 401) {
        console.error('Error fetching unread count:', error);
      }
      setUnreadCount(0);
    }
  }, [authData]);

  useEffect(() => {
    fetchUnreadCount();
  }, []); // Remove fetchUnreadCount dependency

  // Refresh count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, []),
  );

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
          rightContent={
            <TouchableOpacity
              onPress={() => navigation.navigate('Massages')}
              style={styles.notificationButton}
              activeOpacity={0.7}>
              <View style={styles.notificationIconContainer}>
                <Ionicons
                  name="notifications-outline"
                  size={moderateScale(20)}
                  color="#FFFFFF"
                />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          }
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
          key={`video-reel-${currentReelId || 'default'}`} // Stable key - only changes when navigating to new reel
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
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.PRIMARY || '#F2631F',
    borderRadius: moderateScale(10),
    minWidth: moderateScale(18),
    height: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(4),
    borderWidth: 2,
    borderColor: '#000000',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    fontWeight: '700',
    lineHeight: moderateScale(12),
  },
});

export default Home;
