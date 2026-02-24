import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getData } from '../../utils/APiCall';
import { ROUTES } from '../../utils/Routes';
import VideoReel from '../../components/VideoReel/VideoReel';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../../components/Header/Header';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../utils/Colors';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { setReelsData } from '../../redux/slices/reelsSlice';

const UserReelsView = () => {
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userData = useSelector(state => state.auth.data);
  const reelsDataFromRedux = useSelector(state => state.reels?.reels || []);

  // Get params from navigation
  const {
    initialReelId = null,
    reels: passedReels = null,
    reelsData: passedReelsData = null,
  } = route.params || {};

  const fetchMerchantReelsDirect = async (pageNum = 1, perPage = 20) => {
    try {
      const response = await getData(
        `${ROUTES.MERCHANT_MY_REELS}?page=${pageNum}&per_page=${perPage}`,
      );
      return response;
    } catch (error) {
      console.error('Error fetching merchant reels:', error);
      throw error;
    }
  };

  const loadReels = useCallback(async () => {
    if (loading || hasFetched) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetchMerchantReelsDirect(1, 20);

      if (response?.status === 'success' && response?.data) {
        const formattedReels = response.data.map(reel => ({
          id: reel.reel_id,
          reel_id: reel.reel_id,
          videoUrl: reel.video_url,
          thumbnailUrl: reel.thumbnail_url,
          caption: reel.description || '',
          username: userData?.username || 'merchant',
          userAvatar:
            userData?.profile_image || 'https://via.placeholder.com/100',

          likes: reel.likes_count || 0,
          shares: reel.shares_count || 0,
          views: reel.views_count || 0,
          isLiked: reel.is_liked || false,
          merchant_id: reel.merchant_id,
          product: reel.product,
          duration: reel.duration_seconds,
          createdAt: reel.created_at,
          updatedAt: reel.updated_at,
          approval_status: reel.approval_status,
          is_active: reel.is_active,
          is_visible: reel.is_visible,
        }));

        setReels(formattedReels);
        setHasFetched(true);
      } else {
        setError('Failed to load reels');
      }
    } catch (error) {
      console.error('Error loading reels:', error);
      setError('Failed to load reels');
    } finally {
      setLoading(false);
    }
  }, [loading, hasFetched, userData]);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!userData?.token || !userData?.data) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await getData(ROUTES.NOTIFICATIONS_UNREAD_COUNT);
      if (response && response.status === 'success' && response.data) {
        const count =
          typeof response.data === 'number'
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
      if (
        error?.status === 401 ||
        error?.status === 403 ||
        (error?.type === 'response' &&
          (error?.status === 401 || error?.status === 403))
      ) {
        setUnreadCount(0);
        return;
      }
      if (error?.status !== 401 && error?.status !== 403) {
        console.error('Error fetching unread count:', error);
      }
      setUnreadCount(0);
    }
  }, [userData]);

  useEffect(() => {
    // Use reelsData from Search.js if available, otherwise use Redux or passed reels
    const reelsToUse =
      passedReelsData ||
      (reelsDataFromRedux.length > 0 ? reelsDataFromRedux : passedReels || []);



    if (reelsToUse.length > 0) {
      const formattedReels = reelsToUse.map(reel => {
        const formattedReel = {
          id: reel.reel_id || reel.id,
          reel_id: reel.reel_id || reel.id,
          videoUrl:
            reel.video_url ||
            reel.videoUrl ||
            reel.url ||
            reel.video ||
            reel.file_url,
          thumbnailUrl:
            reel.thumbnail_url ||
            reel.thumbnail ||
            'https://i.pravatar.cc/150?img=1',
          caption: reel.description || reel.caption || '',
          product_id: reel.product?.id || reel.product_id || null,
          username: reel.username || userData?.username || 'merchant',
          merchant: reel.merchant || null,

          likes: reel.likes_count || reel.likes || 0,
          shares: reel.shares_count || reel.shares || 0,
          views: reel.views_count || reel.views || 0,
          isLiked: reel.is_liked || reel.isLiked || false,
          merchant_id: reel.merchant_id,
          product: reel.product,
          duration: reel.duration_seconds || reel.duration,
          createdAt: reel.created_at,
          updatedAt: reel.updated_at,
          approval_status: reel.approval_status,
          is_active: reel.is_active,
          is_visible: reel.is_visible,
        };
        return formattedReel;
      });
      setReels(formattedReels);
      setHasFetched(true);
    } else {
      // Otherwise fetch reels from API
      loadReels();
    }
    fetchUnreadCount();
  }, [reelsDataFromRedux, passedReels, passedReelsData, userData]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, []),
  );

  const showLoading = loading && reels.length === 0 && !hasFetched;

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />
      <SafeAreaView style={{ backgroundColor: '#000000' }}>
        <Header
          title=""
          // leftContent={
          //      <TouchableOpacity
          //           onPress={() => navigation.goBack()}
          //           style={{
          //                width: 44,
          //                height: 44,
          //                justifyContent: 'center',
          //                alignItems: 'center',
          //           }}
          //      >
          //           <Ionicons
          //                name="arrow-back"
          //                size={24}
          //                color="#FFFFFF"
          //           />
          //      </TouchableOpacity>
          //  }

          rightType="none"
          containerStyle={{
            backgroundColor: '#000000',
            borderBottomWidth: 0,
          }}
          titleStyle={{ color: '#FFFFFF' }}
        />
      </SafeAreaView>

      {showLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F2631F" />
          <Text style={styles.loadingText}>Loading reels...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : reels.length > 0 ? (
        <VideoReel
          data={reels}
          key={`user-reels-${reels.length}`}
          initialReelId={initialReelId}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            No reels found. Start creating your first reel!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
};

export default UserReelsView;
