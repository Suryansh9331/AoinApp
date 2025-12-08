import React, {useState, useEffect} from 'react';
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
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import {postData, setAuthToken, getAuthToken} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';
import {getValidAuthData, AUTH_STORAGE_KEY} from '../../utils/MMKVStorage';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const POST_ITEM_SIZE = (SCREEN_WIDTH - 4) / 3;

const PerticularReelProfile = ({routeParams}) => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const route = useRoute();
  const navigation = useNavigation();
  const userId = routeParams?.userId || route.params?.userId;
  const merchantId = routeParams?.merchantId || route.params?.merchantId || userId;
  

  // PUBLIC_REELS is only available for MERCHANT role, so empty for user
  const filteredReels = [];
  
  // Get auth token from Redux store - check multiple possible locations
  // Also check APiCall module and MMKV storage in case Redux state is not synced
  // Only use valid (non-expired) tokens from MMKV
  const authState = useSelector(state => state.auth);
  const reduxToken = authState?.token || authState?.data?.token || null;
  const apiCallToken = getAuthToken();
  // Check MMKV storage as fallback (only valid/not expired tokens)
  const storedAuthData = getValidAuthData();
  const mmkvToken = storedAuthData?.token || null;
  const authToken = reduxToken || apiCallToken || mmkvToken;


  // Set auth token in APiCall module when component mounts or token changes
  // This ensures API calls have the token even if Redux state is not synced
  useEffect(() => {
    if (authToken && !apiCallToken) {
      // If we have token from Redux or MMKV but not in APiCall, set it
      setAuthToken(authToken);
      console.log('PerticularReelProfile - Auth token synced to APiCall module');
    } else if (apiCallToken && !reduxToken) {
      // If token exists in APiCall but not Redux, log for debugging
      console.log('PerticularReelProfile - Token exists in APiCall but not in Redux');
    }
    
    // If token found in MMKV but not in Redux or APiCall, restore it
    if (mmkvToken && !reduxToken && !apiCallToken) {
      setAuthToken(mmkvToken);
      console.log('PerticularReelProfile - Token restored from MMKV storage');
    }
  }, [authToken, reduxToken, apiCallToken, mmkvToken]);



  const [pressedReels, setPressedReels] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

 
  const profileData = {
    username: merchantId ? `merchant_${merchantId}` : '@merchant',
    fullName: 'Merchant Store',
    bio: '',
    avatar: 'https://i.pravatar.cc/150?img=1',
    posts: filteredReels?.length || 0,
    followers: 38,
    following: 14,
    likes: filteredReels?.reduce((sum, reel) => sum + (reel.likes || 0), 0) || 0,
    isFollowing: isFollowing,
    isOwnProfile: false,
    merchantId: merchantId,
  };

  // Format views count
  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  // Handle follow/unfollow merchant
  const handleFollow = async () => {
    if (!merchantId || isFollowLoading) return;

    // Check for token in Redux, APiCall module, and MMKV storage (get fresh values)
    // Only use valid (non-expired) tokens from MMKV
    const apiCallTokenValue = getAuthToken();
    const storedAuthData = getValidAuthData();
    const mmkvTokenValue = storedAuthData?.token || null;
    const currentToken = apiCallTokenValue || reduxToken || mmkvTokenValue;
    
    // If no token found, show alert and navigate to login
    if (!currentToken) {
      console.error('No auth token available. Auth state:', {
        hasReduxToken: !!reduxToken,
        hasApiCallToken: !!apiCallTokenValue,
        hasMmkvToken: !!mmkvTokenValue,
        hasToken: !!authState?.token,
        hasDataToken: !!authState?.data?.token,
        authState: authState,
      });
      
      // Show user-friendly error with option to login
      Alert.alert(
        'Authentication Required',
        'Please log in to follow merchants.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Login',
            onPress: () => {
              navigation.navigate('Login');
            },
          },
        ]
      );
      return;
    }
    
    // Ensure token is set in APiCall module for API calls
    // Use token from any source (Redux, APiCall, or MMKV)
    if (!apiCallTokenValue && currentToken) {
      setAuthToken(currentToken);
      console.log('PerticularReelProfile - Token set in APiCall module for follow action');
    }

    const currentFollowState = isFollowing;
    const action = currentFollowState ? 'Unfollow' : 'Follow';

    try {
      setIsFollowLoading(true);
      const endpoint = currentFollowState 
        ? `${ROUTES.UNFOLLOW_MERCHANT}/${merchantId}/unfollow`
        : `${ROUTES.FOLLOW_MERCHANT}/${merchantId}/follow`;
      const response = await postData(endpoint, {});
      
      // Toggle follow state based on response or current state
      setIsFollowing(prev => !prev);
      console.log(`${action} action successful:`, response);
    } catch (error) {
      console.error(`${action} action failed:`, error);
      
      // Handle 401 Unauthorized - token might be invalid
      if (error?.status === 401) {
        Alert.alert(
          'Authentication Failed',
          'Your session has expired. Please log in again.',
          [
            {text: 'OK', onPress: () => navigation.navigate('Login')},
          ]
        );
      } else {
        // Show error message for other failures
        Alert.alert(
          'Error',
          error?.message || `Failed to ${action.toLowerCase()} merchant. Please try again.`,
          [{text: 'OK'}]
        );
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  const renderReelItem = ({item}) => {
    const isPressed = pressedReels[item.id] || false;
    const thumbnail = item.thumbnail || item.videoUrl;
    const views = formatViews(item.views || item.views_count || 0);

    return (
      <TouchableOpacity
        style={[styles.postItem, {borderColor: borderColor}]}
        activeOpacity={1}
        onPressIn={() => setPressedReels(prev => ({...prev, [item.id]: true}))}
        onPressOut={() =>
          setPressedReels(prev => ({...prev, [item.id]: false}))
        }
        onPress={() => {
          // Navigate to reels view or play video
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
        {/* Video icon in top right */}
        <View style={styles.cameraIconContainer}>
          <Ionicons name="videocam" size={14} color="#FFFFFF" />
        </View>
        {/* View count in bottom left */}
        <View style={styles.viewCountContainer}>
          <Text style={styles.viewCountText}>{views}</Text>
        </View>
        <View
          style={[styles.postOverlay, isPressed && styles.postOverlayVisible]}
          pointerEvents="none">
          <View style={styles.postStats}>
            <Ionicons name="heart" size={16} color="#FFFFFF" />
            <Text style={styles.postStatText}>{formatViews(item.likes || 0)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor}]}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, {color: textColor}]}>
            Profile
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image source={{uri: profileData.avatar}} style={styles.avatar} />
          </View>

          {/* Merchant Name */}
          <Text style={[styles.username, {color: textColor}]}>
            {profileData.fullName}
          </Text>
          {/* Username below name */}
          <Text style={[styles.userHandle, {color: textColor}]}>
            {profileData.username}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: textColor}]}>
                {profileData.posts}
              </Text>
              <Text style={[styles.statLabel, {color: textColor}]}>
                Reels
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: textColor}]}>
                {profileData.followers}
              </Text>
              <Text style={[styles.statLabel, {color: textColor}]}>
                Followers
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: textColor}]}>
                {profileData.likes}
              </Text>
              <Text style={[styles.statLabel, {color: textColor}]}>
                Likes
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.followButton, {borderColor: borderColor}]}
              activeOpacity={0.7}
              onPress={handleFollow}
              disabled={isFollowLoading}>
              {isFollowLoading ? (
                <ActivityIndicator size="small" color={Colors.PRIMARY} />
              ) : (
                <Text style={[styles.followButtonText, {color: Colors.PRIMARY}]}>
                  {profileData.isFollowing ? 'Following' : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageButton, {borderColor: borderColor}]}
              activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={18} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Bio Section */}
          {profileData.bio ? (
            <Text style={[styles.bio, {color: textColor}]}>
              {profileData.bio}
            </Text>
          ) : (
            <Text style={[styles.addBioText, {color: textColor}]}>
              No bio available
            </Text>
          )}
        </View>

        {/* Content Display Option */}
        <View style={styles.contentOptionContainer}>
          <TouchableOpacity style={styles.contentOptionButton}>
            <Ionicons name="videocam-outline" size={20} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Reels Grid */}
        <View style={styles.postsGridContainer}>
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={48} color={textColor} />
            <Text style={[styles.emptyText, {color: textColor}]}>
              Reels feature not available
            </Text>
            <Text style={[styles.emptySubText, {color: textColor}]}>
              This feature is only available for merchants
            </Text>
          </View>
        </View>
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginLeft: scale(8),
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
  scrollView: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: scale(16),
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
  bio: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    textAlign: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(12),
  },
  addBioText: {
    fontSize: moderateScale(13),
    textAlign: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(12),
    opacity: 0.6,
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
  },
  contentOptionContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
  },
  contentOptionButton: {
    alignSelf: 'flex-start',
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
  postOverlayVisible: {
    opacity: 1,
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
});

export default PerticularReelProfile;

