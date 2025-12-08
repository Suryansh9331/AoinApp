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
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRoute, useNavigation, CommonActions} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import {fetchMerchantReels_Request} from '../../redux/slices/reelSlice';
import {clearCredentials} from '../../redux/slices/authSlice';
import {clearAuthToken} from '../../utils/APiCall';
import {removeItem, AUTH_STORAGE_KEY} from '../../utils/MMKVStorage';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const POST_ITEM_SIZE = (SCREEN_WIDTH - 4) / 3;

const Profile = ({routeParams}) => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userId = routeParams?.userId || route.params?.userId;
  const insets = useSafeAreaInsets();

 
  const {reels, loading, error} = useSelector(state => state.reels);


  useEffect(() => {
    if (reels.length === 0 && !loading) {
      dispatch(fetchMerchantReels_Request({page: 1, per_page: 20}));
    }
  }, [dispatch]);

  // Get current user data for profile
  const userData = useSelector(state => state.auth.data);
  const userInfo = userData?.data || userData || {};

  // Sample profile data
  const profileData = {
    username: userId ? `merchant_${userId}` : userInfo.username || userInfo.user_name || '@merchant',
    fullName: userId ? 'Merchant Store' : userInfo.first_name && userInfo.last_name 
      ? `${userInfo.first_name} ${userInfo.last_name}` 
      : userInfo.name || 'Merchant Store',
    bio: userInfo.bio || userInfo.description || '', // Empty bio - will show "Tap to add bio"
    avatar: userInfo.avatar || userInfo.avatar_url || userInfo.profile_picture || 
      userInfo.profile_image || 'https://i.pravatar.cc/150?img=1',
    posts: reels?.length || 0,
    followers: 38,
    following: 14,
    likes: reels?.reduce((sum, reel) => sum + (reel.likes || 0), 0) || 0,
    isFollowing: false,
    isOwnProfile: !userId,
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

  const [pressedReels, setPressedReels] = useState({});

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            dispatch(clearCredentials());
            clearAuthToken();
           
            removeItem(AUTH_STORAGE_KEY);
           
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              })
            );
          },
        },
      ]
    );
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
          navigation.navigate('MerchantBottomTab', {
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
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={false}
      />
      {/* Header */}
      <View style={[
        styles.header, 
        {borderBottomColor: borderColor},
        Platform.OS === 'ios' && {paddingTop: insets.top + verticalScale(10)}
      ]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, {color: textColor}]}>
            Profile
          </Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="chevron-down" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('MerchantSettings')}>
            <Ionicons name="settings-outline" size={24} color={textColor} />
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
              style={[
                styles.editButton, 
                {
                  borderColor: borderColor,
                  backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF'
                }
              ]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EditProfile')}>
              <Text style={[styles.editButtonText, {color: Colors.PRIMARY}]}>
                Edit profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.bookmarkButton, 
                {
                  borderColor: borderColor,
                  backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF'
                }
              ]}
              activeOpacity={0.7}>
              <Ionicons name="bookmark-outline" size={18} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Bio Section */}
          {profileData.bio ? (
            <Text style={[styles.bio, {color: textColor}]}>
              {profileData.bio}
            </Text>
          ) : (
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.addBioText, {color: textColor}]}>
                Tap to add bio
              </Text>
            </TouchableOpacity>
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
          {reels.length > 0 ? (
            <FlatList
              data={reels}
              renderItem={renderReelItem}
              keyExtractor={item => item.id || item.reel_id?.toString()}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.postsGrid}
            />
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
              <Text style={[styles.loadingText, {color: textColor}]}>
                Loading reels...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, {color: Colors.PRIMARY}]}>
                {error}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-outline" size={48} color={textColor} />
              <Text style={[styles.emptyText, {color: textColor}]}>
                No reels yet
              </Text>
              <Text style={[styles.emptySubText, {color: textColor}]}>
                Upload your first reel to get started
              </Text>
            </View>
          )}
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
  themeToggleButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
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
  editButton: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  followButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  shareButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    minWidth: scale(120),
  },
  logoutButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
});

export default Profile;



