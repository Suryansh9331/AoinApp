import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import Skeleton from '../../components/Skeleton/Skeleton';
import ProfileSkeleton from '../merchant/components/ProfileSkeleton';
import {fetchPublicReels_Request} from '../../redux/slices/reelSlice';
import {getData, postData, deleteData} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const POST_ITEM_SIZE = (SCREEN_WIDTH - 4) / 3;

const PerticularReelProfile = () => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const merchantId = route.params?.merchantId || route.params?.userId;
  const passedProfileImage = route.params?.profileImage; // Get passed profile image
  const {publicReels, publicReelsLoading, publicReelsError} = useSelector(
    state => state.reels,
  );
  
  // Filter reels for this merchant
  const merchantReels = useMemo(() => {
    if (!merchantId) return [];
    return publicReels.filter(
      reel =>
        (reel.merchant_id || reel.merchantId)?.toString() ===
        merchantId?.toString(),
    );
  }, [publicReels, merchantId]);

  // State for merchant profile data
  const [merchantProfile, setMerchantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // State for merchant stats
  const [merchantStats, setMerchantStats] = useState(null);

  // State for followers count
  const [followersCount, setFollowersCount] = useState(0);

  // State for follow status
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Fetch merchant profile
  const fetchMerchantProfile = useCallback(async () => {
    if (!merchantId) {
      setProfileError('Merchant ID not found');
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    try {
      const endpoint = `${ROUTES.MERCHANT_PUBLIC_PROFILE}${merchantId}/public-profile`;
      const response = await getData(endpoint);
      const profile =
        response?.merchant ||
        response?.data?.merchant ||
        response?.data ||
        response;

      if (profile?.business_name) {
        setMerchantProfile(profile);
      } else {
        setProfileError('Invalid profile data received');
      }
    } catch (error) {
      setProfileError(error?.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  }, [merchantId]);

  // Fetch merchant stats
  const fetchMerchantStats = useCallback(async () => {
    if (!merchantId) {
      return;
    }

    try {
      const endpoint = `${ROUTES.MERCHANT_STATS}${merchantId}/stats`;
      const response = await getData(endpoint);

      if (response && response.status === 'success' && response.data) {
        setMerchantStats(response.data);
      } else if (response?.data) {
        setMerchantStats(response.data);
      }
    } catch (error) {
      // Silently handle errors for stats
    }
  }, [merchantId]);

  // Fetch followers count
  const fetchFollowersCount = useCallback(async () => {
    if (!merchantId) {
      return;
    }

    try {
      const endpoint = `${ROUTES.MERCHANT_FOLLOWERS_COUNT}${merchantId}/followers/count`;
      const response = await getData(endpoint);

      if (response?.follower_count !== undefined) {
        setFollowersCount(response.follower_count);
      } else if (response?.data?.follower_count !== undefined) {
        setFollowersCount(response.data.follower_count);
      }
    } catch (error) {
      // Silently handle errors for followers count
    }
  }, [merchantId]);

  // Fetch merchant reels
  const fetchMerchantReels = useCallback(() => {
    if (merchantId) {
      dispatch(
        fetchPublicReels_Request({
          page: 1,
          per_page: 20,
          merchant_id: merchantId,
        }),
      );
    }
  }, [merchantId, dispatch]);

  useEffect(() => {
    if (merchantId) {
      fetchMerchantProfile();
      fetchMerchantStats();
      fetchFollowersCount();
      fetchMerchantReels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  useEffect(() => {
    // Ensure isFollowing state is updated correctly
    if (merchantProfile && typeof merchantProfile.is_following === 'boolean') {
      setIsFollowing(merchantProfile.is_following);
    }
  }, [merchantProfile]);

  useFocusEffect(
    useCallback(() => {
      if (merchantId && !merchantProfile) {
        fetchMerchantProfile();
        fetchMerchantStats();
        fetchFollowersCount();
        fetchMerchantReels();
      }
    }, [merchantId, merchantProfile])
  );
  // ✅ SINGLE SOURCE OF TRUTH FOR PROFILE IMAGE
  const profileImage = useMemo(() => {
    // First priority: passed profile image from navigation params
    if (passedProfileImage) {
      return passedProfileImage;
    }
    
    // Second priority: merchant profile from API
    if (!merchantProfile) return null;

    return merchantProfile.profile_img ?? merchantProfile.profile_image ?? null;
  }, [passedProfileImage, merchantProfile]);

  const formatViews = useCallback(views => {
    if (!views) return '0';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }, []);

  const handleFollow = useCallback(async () => {
    if (!merchantId) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow merchant
        const endpoint = ROUTES.MERCHANT_UNFOLLOW.replace(
          '{merchant_id}',
          merchantId.toString(),
        );
        await postData(endpoint);
        setIsFollowing(false);
        // Update followers count
        if (followersCount > 0) {
          setFollowersCount(followersCount - 1);
        }
        Alert.alert('Success', 'Unfollowed successfully');
      } else {
        // Follow merchant
        const endpoint = ROUTES.MERCHANT_FOLLOW.replace(
          '{merchant_id}',
          merchantId.toString(),
        );
        await postData(endpoint);
        setIsFollowing(true);
        // Update followers count
        setFollowersCount(followersCount + 1);
        Alert.alert('Success', 'Followed successfully');
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to follow/unfollow');
    } finally {
      setIsFollowLoading(false);
    }
  }, [merchantId, isFollowing, followersCount]);

  const renderReelItem = useCallback(
    ({item}) => {
      const thumbnail = item.thumbnail || item.videoUrl;
      const views = formatViews(item.views || item.views_count || 0);

      return (
        <TouchableOpacity
          style={[styles.postItem, {borderColor: borderColor}]}
          activeOpacity={0.8}
          onPress={() => {
            navigation.navigate('UserBottomTab', {
              navigateToTab: 'Home',
              reelId: item.id || item.reel_id,
            });
          }}>
          <Image
            source={{uri: thumbnail}}
            style={styles.postImage}
            resizeMode="cover"
          />
          <View style={styles.cameraIconContainer}>
            <Ionicons name="videocam" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.viewCountContainer}>
            <Text style={styles.viewCountText}>{views}</Text>
          </View>
          <View style={styles.postOverlay} pointerEvents="none">
            <View style={styles.postStats}>
              <Ionicons name="heart" size={16} color="#FFFFFF" />
              <Text style={styles.postStatText}>
                {formatViews(item.likes || 0)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [borderColor, navigation, formatViews],
  );

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <View
        style={[
          styles.header,
          {borderBottomColor: borderColor},
          Platform.OS === 'ios' && {paddingTop: insets.top + verticalScale(10)},
        ]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: textColor}]}>Profile</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Profile Section */}
        {profileLoading && !merchantProfile ? (
          <ProfileSkeleton />
        ) : profileError && !merchantProfile ? (
          <View style={styles.profileErrorContainer}>
            <Text style={[styles.errorText, {color: Colors.PRIMARY}]}>
              {profileError}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, {borderColor: borderColor}]}
              onPress={fetchMerchantProfile}>
              <Text style={[styles.retryButtonText, {color: Colors.PRIMARY}]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : merchantProfile ? (
          <View style={styles.profileSection}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                key={profileImage}
                source={
                  profileImage
                    ? {uri: profileImage}
                    : require('../../../assest/images/AppLogo.png')
                }
                style={styles.avatar}
              />
            </View>

            {/* Merchant Name */}
            <Text style={[styles.username, {color: textColor}]}>
              {merchantProfile?.business_name || 'Merchant Store'}
            </Text>
            {/* Username below name */}
            <Text style={[styles.userHandle, {color: textColor}]}>
              {merchantProfile?.business_name
                ? `@${merchantProfile.business_name
                    .toLowerCase()
                    .replace(/\s+/g, '_')}`
                : '@merchant'}
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: textColor}]}>
                  {merchantStats?.total_reels || merchantReels?.length || 0}
                </Text>
                <Text style={[styles.statLabel, {color: textColor}]}>
                  Reels
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: textColor}]}>
                  {followersCount}
                </Text>
                <Text style={[styles.statLabel, {color: textColor}]}>
                  Followers
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: textColor}]}>
                  {merchantStats?.total_likes ||
                    merchantReels?.reduce(
                      (sum, reel) => sum + (reel.likes || 0),
                      0,
                    ) ||
                    0}
                </Text>
                <Text style={[styles.statLabel, {color: textColor}]}>
                  Likes
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  {
                    borderColor: borderColor,
                    backgroundColor:
                      isFollowing || theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  },
                  isFollowing && styles.followingButton,
                ]}
                activeOpacity={0.7}
                onPress={handleFollow}
                disabled={isFollowLoading}>
                {isFollowLoading ? (
                  <ActivityIndicator size="small" color={Colors.PRIMARY} />
                ) : (
                  <Text
                    style={[
                      styles.followButtonText,
                      {color: isFollowing ? textColor : Colors.PRIMARY},
                    ]}>
                    {isFollowing ? 'UnFollow' : 'Follow'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Reels Grid */}
            <View style={styles.postsGridContainer}>
              {merchantReels.length > 0 ? (
                <FlatList
                  data={merchantReels}
                  renderItem={renderReelItem}
                  keyExtractor={item => item.id || item.reel_id?.toString()}
                  numColumns={3}
                  scrollEnabled={false}
                  contentContainerStyle={styles.postsGrid}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                />
              ) : publicReelsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.PRIMARY} />
                  <Text style={[styles.loadingText, {color: textColor}]}>
                    Loading reels...
                  </Text>
                </View>
              ) : publicReelsError ? (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, {color: Colors.PRIMARY}]}>
                    {publicReelsError}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="videocam-outline"
                    size={48}
                    color={textColor}
                  />
                  <Text style={[styles.emptyText, {color: textColor}]}>
                    No reels yet
                  </Text>
                  <Text style={[styles.emptySubText, {color: textColor}]}>
                    This merchant hasn't uploaded any reels
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerButton: {
    padding: scale(8),
    marginRight: scale(8),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    paddingTop: verticalScale(20),
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  avatar: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
  },
  username: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(4),
  },
  userHandle: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: verticalScale(16),
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(20),
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  statLabel: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },

  actionButtons: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(12),
    width: '100%',
    paddingHorizontal: scale(20),
  },
  followButton: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: '#E1E1E1',
  },
  followButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  messageButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  postsGridContainer: {
    position: 'relative',
    paddingBottom: verticalScale(100),
  },
  postsGrid: {
    paddingTop: verticalScale(2),
  },
  postItem: {
    width: POST_ITEM_SIZE,
    height: POST_ITEM_SIZE,
    margin: 0.5,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    top: scale(6),
    right: scale(6),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: moderateScale(4),
    padding: scale(4),
  },
  viewCountContainer: {
    position: 'absolute',
    bottom: scale(6),
    left: scale(6),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: moderateScale(4),
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
  },
  viewCountText: {
    color: '#FFFFFF',
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    opacity: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(20),
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  postStatText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
  },
  errorContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  errorText: {
    fontSize: moderateScale(14),
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: verticalScale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(13),
    opacity: 0.6,
  },
  profileErrorContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  retryButton: {
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(8),
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  skeletonName: {
    alignSelf: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(4),
  },
  skeletonUsername: {
    alignSelf: 'center',
    marginBottom: verticalScale(16),
  },
  skeletonBioContainer: {
    alignItems: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(20),
  },
  skeletonReelItem: {
    marginRight: scale(4),
  },
  skeletonReelsRow: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
  },
});

export default PerticularReelProfile;
