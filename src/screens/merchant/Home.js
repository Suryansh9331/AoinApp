// import React, {useState, useCallback, useMemo} from 'react';
// import {
//   View,
//   StyleSheet,
//   StatusBar,
//   Text,
//   ActivityIndicator,
//   SafeAreaView,
//   TouchableOpacity,
// } from 'react-native';
// import {useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import VideoReel from '../../components/VideoReel/VideoReel';
// import useAppTheme from '../../theme/useAppTheme';
// import {getThemeColors} from '../../theme/themeColors';
// import {moderateScale} from 'react-native-size-matters';
// import Header from '../../components/Header/Header';
// import {getData} from '../../utils/APiCall';
// import {ROUTES} from '../../utils/Routes';
// import {Colors} from '../../utils/Colors';

// const Home = ({routeParams, initialReels}) => {
//   const theme = useAppTheme();
//   const {backgroundColor} = getThemeColors(theme);
//   const route = useRoute();
//   const navigation = useNavigation();
  
//   // State
//   const [publicReels, setPublicReels] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [currentReelId, setCurrentReelId] = useState(
//     routeParams?.reelId || route.params?.reelId,
//   );
//   const [preloadedReels, setPreloadedReels] = useState(
//     initialReels ||
//       routeParams?.preloadedReels ||
//       route.params?.preloadedReels ||
//       [],
//   );

//   // API call to fetch public reels
//   const fetchPublicReels = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await getData(`${ROUTES.PUBLIC_REELS}?page=1&per_page=20`);
      
//       if (response?.data) {
//         const mappedReels = response.data.map((apiReel, index) => ({
//           id: apiReel.reel_id?.toString() || apiReel.id?.toString() || `public-${index}`,
//           reel_id: apiReel.reel_id,
//           videoUrl: apiReel.video_url,
//           thumbnail: apiReel.thumbnail_url,
//           username: apiReel.merchant?.username || apiReel.merchant?.user_name || `merchant_${apiReel.merchant_id}` || 'User',
//           userAvatar: apiReel.merchant?.avatar || apiReel.merchant?.avatar_url || apiReel.product?.thumbnail_url || 'https://i.pravatar.cc/150?img=1',
//           merchant: apiReel.merchant || null,

//           caption: apiReel.description || '',
//           likes: apiReel.likes_count || 0,
//           comments: apiReel.comments_count || 0,
//           shares: apiReel.shares_count || 0,
//           views: apiReel.views_count || 0,
//           isLiked: apiReel.is_liked || false,
//           duration: apiReel.duration_seconds || 0,
//           product: apiReel.product || null,
//           product_id: apiReel.product_id,
//           merchant_id: apiReel.merchant_id,
//           approval_status: apiReel.approval_status,
//           is_active: apiReel.is_active,
//           created_at: apiReel.created_at,
//           updated_at: apiReel.updated_at,
//           video_format: apiReel.video_format,
//           file_size_bytes: apiReel.file_size_bytes,
//           resolution: apiReel.resolution,
//         }));
//         setPublicReels(mappedReels);
//       } else if (Array.isArray(response)) {
//         setPublicReels(response);
//       } else {
//         setPublicReels([]);
//       }
//     } catch (error) {
//       console.error('Error fetching public reels:', error);
//       setError(error?.message || 'Failed to fetch reels');
//       setPublicReels([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // API call to fetch unread notification count
//   const fetchUnreadCount = useCallback(async () => {
//     try {
//       const response = await getData(ROUTES.NOTIFICATIONS_UNREAD_COUNT);
      
//       if (response?.status === 'success' && response?.data) {
//         const count = typeof response.data === 'number' 
//           ? response.data 
//           : response.data.count || response.data.unread_count || 0;
//         setUnreadCount(count);
//       } else if (typeof response === 'number') {
//         setUnreadCount(response);
//       } else if (response?.count !== undefined) {
//         setUnreadCount(response.count);
//       } else if (response?.unread_count !== undefined) {
//         setUnreadCount(response.unread_count);
//       }
//     } catch (error) {
//       if (error?.status === 401) {
//         setUnreadCount(0);
//         return;
//       }
//       if (error?.status !== 401) {
//         console.error('Error fetching unread count:', error);
//       }
//       setUnreadCount(0);
//     }
//   }, []);

//   // Combine preloaded reels with public reels
//   const displayData = React.useMemo(() => {
//     if (preloadedReels.length > 0) {
//       const preloadedIds = new Set(
//         preloadedReels
//           .map(r => (r.id || r.reel_id)?.toString())
//           .filter(Boolean),
//       );

//       const additionalReels = publicReels.filter(r => {
//         const reelId = (r.id || r.reel_id)?.toString();
//         return reelId && !preloadedIds.has(reelId);
//       });

//       return [...preloadedReels, ...additionalReels];
//     }
//     return publicReels;
//   }, [preloadedReels, publicReels]);

//   // Initial data fetch
//   React.useLayoutEffect(() => {
//     fetchPublicReels();
//     fetchUnreadCount();
//   }, []);

//   // Refresh notification count when screen comes into focus
//   useFocusEffect(
//     useCallback(() => {
//       fetchUnreadCount();
//     }, []),
//   );

//   // Memoize the navigation handler
//   const handleNotificationPress = useCallback(() => {
//     navigation.navigate('Massages');
//   }, [navigation]);

//   // Memoize the header right content
//   const headerRightContent = useMemo(() => (
//     <TouchableOpacity
//       onPress={handleNotificationPress}
//       style={styles.notificationButton}
//       activeOpacity={0.7}>
//       <View style={styles.notificationIconContainer}>
//         <Ionicons
//           name="notifications-outline"
//           size={moderateScale(20)}
//           color="#FFFFFF"
//         />
//         {unreadCount > 0 && (
//           <View style={styles.badge}>
//             <Text style={styles.badgeText}>
//               {unreadCount > 99 ? '99+' : unreadCount}
//             </Text>
//           </View>
//         )}
//       </View>
//     </TouchableOpacity>
//   ), [handleNotificationPress, unreadCount]);

//   // Memoize header props
//   const headerProps = useMemo(() => ({
//     title: "Reels",
//     leftType: "none",
//     rightType: "none",
//     rightContent: headerRightContent,
//     containerStyle: {
//       backgroundColor: '#000000',
//       borderBottomWidth: 0,
//     },
//     titleStyle: {color: '#FFFFFF'}
//   }), [headerRightContent]);

//   // Memoize loading component
//   const LoadingComponent = useMemo(() => (
//     <View style={styles.loadingContainer}>
//       <ActivityIndicator size="large" color="#F2631F" />
//       <Text style={styles.loadingText}>Loading reels...</Text>
//     </View>
//   ), []);

//   // Memoize error component
//   const ErrorComponent = useMemo(() => error ? (
//     <View style={styles.errorContainer}>
//       <Text style={styles.errorText}>{error}</Text>
//     </View>
//   ) : null, [error]);

//   // Memoize no reels component
//   const NoReelsComponent = useMemo(() => (
//     <View style={styles.loadingContainer}>
//       <Text style={styles.loadingText}>No reels available</Text>
//     </View>
//   ), []);

//   // Memoize VideoReel component
//   const VideoReelComponent = useMemo(() => displayData.length > 0 ? (
//     <VideoReel
//       data={displayData}
//       initialReelId={currentReelId}
//       key={`video-reel-${currentReelId || 'default'}`}
//     />
//   ) : null, [displayData, currentReelId]);

//   return (
//     <View style={[styles.container, {backgroundColor}]}>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor="#000000"
//         translucent={false}
//       />
//       <SafeAreaView style={{backgroundColor: '#000000'}}>
//         <Header {...headerProps} />
//       </SafeAreaView>
//       {loading && displayData.length === 0 ? (
//         LoadingComponent
//       ) : ErrorComponent ? (
//         ErrorComponent
//       ) : VideoReelComponent ? (
//         VideoReelComponent
//       ) : (
//         NoReelsComponent
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   headerContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     backgroundColor: 'transparent',
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     paddingTop: 8,
//     paddingBottom: 8,
//     backgroundColor: 'transparent',
//   },
//   headerLeft: {
//     width: 44,
//     height: 44,
//   },
//   headerTitle: {
//     flex: 1,
//     textAlign: 'center',
//     fontSize: moderateScale(18),
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
//   headerRight: {
//     width: 36,
//     height: 36,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000000',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: moderateScale(14),
//     color: '#FFFFFF',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000000',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: moderateScale(14),
//     color: '#FF3040',
//     textAlign: 'center',
//   },
//   notificationButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   notificationIconContainer: {
//     position: 'relative',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   badge: {
//     position: 'absolute',
//     top: -4,
//     right: -6,
//     backgroundColor: Colors.PRIMARY || '#F2631F',
//     borderRadius: moderateScale(10),
//     minWidth: moderateScale(18),
//     height: moderateScale(18),
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: moderateScale(4),
//     borderWidth: 2,
//     borderColor: '#000000',
//   },
//   badgeText: {
//     color: '#FFFFFF',
//     fontSize: moderateScale(10),
//     fontWeight: '700',
//     lineHeight: moderateScale(12),
//   },
// });

// export default Home;




import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VideoReel from '../../components/VideoReel/VideoReel';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {moderateScale} from 'react-native-size-matters';
import {getData} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';
import {Colors} from '../../utils/Colors';

const Home = ({routeParams, initialReels}) => {
  const theme = useAppTheme();
  const {backgroundColor} = getThemeColors(theme);
  const route = useRoute();
  const navigation = useNavigation();

  // -------------------- STATE (UNCHANGED) --------------------
  const [publicReels, setPublicReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [videoReelKey, setVideoReelKey] = useState(`video-reel-merchant-${Date.now()}`);
  const [currentReelId, setCurrentReelId] = useState(
    routeParams?.reelId || route.params?.reelId,
  );
  const [preloadedReels, setPreloadedReels] = useState(
    initialReels ||
      routeParams?.preloadedReels ||
      route.params?.preloadedReels ||
      [],
  );

  // -------------------- ANIMATION (UI ONLY) --------------------
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: unreadCount > 0 ? 1.08 : 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [unreadCount]);

  // -------------------- API LOGIC (UNCHANGED) --------------------
  const fetchPublicReels = useCallback(async (page = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getData(`${ROUTES.PUBLIC_REELS}?page=${page}&per_page=20`);

      if (response?.data) {
        const mappedReels = response.data.map((apiReel, index) => ({
          id:
            apiReel.reel_id?.toString() ||
            apiReel.id?.toString() ||
            `public-${index}`,
          reel_id: apiReel.reel_id,
          videoUrl: apiReel.video_url,
          thumbnail: apiReel.thumbnail_url,
          username:
            apiReel.merchant?.username ||
            apiReel.merchant?.user_name ||
            `merchant_${apiReel.merchant_id}` ||
            'User',
          userAvatar:
            apiReel.merchant?.avatar ||
            apiReel.merchant?.avatar_url ||
            apiReel.product?.thumbnail_url ||
            'https://i.pravatar.cc/150?img=1',
          merchant: apiReel.merchant || null,
          caption: apiReel.description || '',
          likes: apiReel.likes_count || 0,
          comments: apiReel.comments_count || 0,
          shares: apiReel.shares_count || 0,
          views: apiReel.views_count || 0,
          isLiked: apiReel.is_liked || false,
          duration: apiReel.duration_seconds || 0,
          product: apiReel.product || null,
          product_id: apiReel.product_id,
          merchant_id: apiReel.merchant_id,
          approval_status: apiReel.approval_status,
          is_active: apiReel.is_active,
          created_at: apiReel.created_at,
          updated_at: apiReel.updated_at,
          video_format: apiReel.video_format,
          file_size_bytes: apiReel.file_size_bytes,
          resolution: apiReel.resolution,
        }));
        
        if (append) {
          // Avoid duplicates when appending
          const existingIds = new Set(publicReels.map(r => r.id || r.reel_id));
          const newReels = mappedReels.filter(r => !existingIds.has(r.id || r.reel_id));
          setPublicReels([...publicReels, ...newReels]);
        } else {
          setPublicReels(mappedReels);
        }
        
        // Update pagination state
        setCurrentPage(page);
        setHasMore(response.pagination ? page < response.pagination.pages : false);
      } else {
        setPublicReels(append ? publicReels : []);
        setHasMore(false);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch reels');
      if (!append) {
        setPublicReels([]);
      }
    } finally {
      setLoading(false);
    }
  }, [publicReels]);

  const fetchMoreReels = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      fetchPublicReels(nextPage, true);
    }
  }, [hasMore, loading, currentPage, fetchPublicReels]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getData(ROUTES.NOTIFICATIONS_UNREAD_COUNT);
      const count =
        typeof response?.data === 'number'
          ? response.data
          : response?.data?.count ||
            response?.data?.unread_count ||
            response?.count ||
            response?.unread_count ||
            0;
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const displayData = useMemo(() => {
    if (preloadedReels.length) {
      const ids = new Set(
        preloadedReels.map(r => (r.id || r.reel_id)?.toString()),
      );
      return [
        ...preloadedReels,
        ...publicReels.filter(
          r => !ids.has((r.id || r.reel_id)?.toString()),
        ),
      ];
    }
    return publicReels;
  }, [preloadedReels, publicReels]);

  React.useLayoutEffect(() => {
    fetchPublicReels();
    fetchUnreadCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, []),
  );

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('Massages');
  }, [navigation]);

  // -------------------- NOTIFICATION UI --------------------
  const NotificationButton = useMemo(
    () => (
      <Animated.View
        style={[
          styles.floatingNotification,
          {
            transform: [{scale: scaleAnim}],
            opacity: opacityAnim,
          },
        ]}>
        <TouchableOpacity
          onPress={handleNotificationPress}
          activeOpacity={0.75}
          style={styles.notificationButton}>
          <Ionicons
            name="notifications-outline"
            size={moderateScale(22)}
            color="#FFFFFF"
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    ),
    [handleNotificationPress, unreadCount],
  );

  // -------------------- RENDER --------------------
  return (
    <View style={[styles.container, {backgroundColor}]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {NotificationButton}

      {loading && displayData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F2631F" />
          <Text style={styles.loadingText}>Loading reels...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : displayData.length > 0 ? (
        <VideoReel
          data={displayData}
          initialReelId={currentReelId}
          key={videoReelKey}
          onEndReached={fetchMoreReels}
          hasMore={hasMore}
          isLoading={loading}
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
  container: {flex: 1, backgroundColor: '#000000'},

  floatingNotification: {
    position: 'absolute',
    top: moderateScale(52), // safely below status bar
    right: moderateScale(14),
    zIndex: 999,
    backgroundColor: 'rgba(20,20,20,0.65)',
    borderRadius: moderateScale(22),
    padding: moderateScale(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },

  notificationButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(23),
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.PRIMARY || '#F2631F',
    borderRadius: moderateScale(12),
    minWidth: moderateScale(20),
    height: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(6),
    borderWidth: 2,
    borderColor: '#000000',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },

  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 12, color: '#FFFFFF'},
  errorContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  errorText: {color: '#FF3040'},
});

export default Home;
