import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const POST_ITEM_SIZE = (SCREEN_WIDTH - 4) / 3;

const Profile = ({routeParams}) => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const route = useRoute();
  const navigation = useNavigation();
  const userId = routeParams?.userId || route.params?.userId;


  // Sample profile data
  const profileData = {
    username: userId ? `merchant_${userId}` : '@Shivm_w',
    fullName: 'Merchant Store',
    bio: '', // Empty bio - will show "Tap to add bio"
    avatar: 'https://i.pravatar.cc/150?img=1',
    posts: 125,
    followers: 38,
    following: 14,
    likes: 91,
    isFollowing: false,
    isOwnProfile: !userId,
  };

  // Sample posts data with view counts
  const postsData = [
    {
      id: '1',
      image: 'https://picsum.photos/400/400?random=1',
      views: '13M',
      likes: 1250,
      comments: 45,
    },
    {
      id: '2',
      image: 'https://picsum.photos/400/400?random=2',
      views: '18M',
      likes: 890,
      comments: 23,
    },
    {
      id: '3',
      image: 'https://picsum.photos/400/400?random=3',
      views: '12M',
      likes: 2100,
      comments: 67,
    },
    {
      id: '4',
      image: 'https://picsum.photos/400/400?random=4',
      views: '1M',
      likes: 567,
      comments: 12,
    },
    {
      id: '5',
      image: 'https://picsum.photos/400/400?random=5',
      views: '5M',
      likes: 1890,
      comments: 89,
    },
    {
      id: '6',
      image: 'https://picsum.photos/400/400?random=6',
      views: '8M',
      likes: 2340,
      comments: 156,
    },
    {
      id: '7',
      image: 'https://picsum.photos/400/400?random=7',
      views: '3M',
      likes: 980,
      comments: 34,
    },
    {
      id: '8',
      image: 'https://picsum.photos/400/400?random=8',
      views: '6M',
      likes: 1450,
      comments: 56,
    },
    {
      id: '9',
      image: 'https://picsum.photos/400/400?random=9',
      views: '2M',
      likes: 1120,
      comments: 78,
    },
  ];

  const [pressedPosts, setPressedPosts] = useState({});

  const renderPostItem = ({item}) => {
    const isPressed = pressedPosts[item.id] || false;

    return (
      <TouchableOpacity
        style={[styles.postItem, {borderColor: borderColor}]}
        activeOpacity={1}
        onPressIn={() => setPressedPosts(prev => ({...prev, [item.id]: true}))}
        onPressOut={() =>
          setPressedPosts(prev => ({...prev, [item.id]: false}))
        }>
        <Image
          source={{uri: item.image}}
          style={styles.postImage}
          resizeMode="cover"
        />
        {/* Camera icon in top right */}
        <View style={styles.cameraIconContainer}>
          <Ionicons name="videocam" size={14} color="#FFFFFF" />
        </View>
        {/* View count in bottom left */}
        <View style={styles.viewCountContainer}>
          <Text style={styles.viewCountText}>{item.views}</Text>
        </View>
        <View
          style={[styles.postOverlay, isPressed && styles.postOverlayVisible]}>
          <View style={styles.postStats}>
            <Ionicons name="heart" size={16} color="#FFFFFF" />
            <Text style={styles.postStatText}>{item.likes}</Text>
          </View>
          <View style={styles.postStats}>
            <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
            <Text style={styles.postStatText}>{item.comments}</Text>
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
          <Text style={[styles.headerTitle, {color: textColor}]}>
            Profile
          </Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="chevron-down" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
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

          {/* Username */}
          <Text style={[styles.username, {color: textColor}]}>
            {profileData.username}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: textColor}]}>
                {profileData.following}
              </Text>
              <Text style={[styles.statLabel, {color: textColor}]}>
                Following
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
              style={[styles.editButton, {borderColor: borderColor}]}
              activeOpacity={0.7}>
              <Text style={[styles.editButtonText, {color: Colors.PRIMARY}]}>
                Edit profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bookmarkButton, {borderColor: borderColor}]}
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
            <Ionicons name="ellipsis-horizontal" size={20} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsGridContainer}>
          <FlatList
            data={postsData}
            renderItem={renderPostItem}
            keyExtractor={item => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.postsGrid}
          />
          
          {/* Upload Video Overlay */}
          <View style={styles.uploadOverlay}>
            <Text style={styles.uploadOverlayText}>
              Tap to upload a new video
            </Text>
            <Ionicons name="arrow-down" size={20} color="#FFFFFF" style={styles.uploadArrow} />
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
    fontSize: moderateScale(16),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(16),
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
    backgroundColor: '#FFFFFF',
  },
  bookmarkButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
  uploadOverlay: {
    position: 'absolute',
    bottom: verticalScale(20),
    right: scale(16),
    backgroundColor: 'rgba(255, 165, 0, 0.9)',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    maxWidth: SCREEN_WIDTH * 0.6,
  },
  uploadOverlayText: {
    color: '#FFFFFF',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  uploadArrow: {
    marginLeft: scale(4),
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
});

export default Profile;



