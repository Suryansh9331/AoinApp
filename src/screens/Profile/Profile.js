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
import {useSelector, useDispatch} from 'react-redux';
import {setThemeMode} from '../../redux/slices/themeSlice';
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
  const dispatch = useDispatch();
  const themeMode = useSelector(state => state.theme?.themeMode || 'light');

  const [activeTab, setActiveTab] = useState('Posts');

  const handleThemeToggle = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    dispatch(setThemeMode(newTheme));
  };

  // Sample profile data
  const profileData = {
    username: userId ? `user_${userId}` : 'creative_artist',
    fullName: 'Creative Artist',
    bio: '🎨 Digital Artist | Nature Lover 🌿\n📍 New York, USA\n✨ Creating magic one post at a time',
    avatar: 'https://i.pravatar.cc/150?img=1',
    posts: 125,
    followers: '12.5K',
    following: 342,
    isFollowing: false,
    isOwnProfile: !userId,
  };

  // Sample posts data
  const postsData = [
    {
      id: '1',
      image: 'https://picsum.photos/400/400?random=1',
      likes: 1250,
      comments: 45,
    },
    {
      id: '2',
      image: 'https://picsum.photos/400/400?random=2',
      likes: 890,
      comments: 23,
    },
    {
      id: '3',
      image: 'https://picsum.photos/400/400?random=3',
      likes: 2100,
      comments: 67,
    },
    {
      id: '4',
      image: 'https://picsum.photos/400/400?random=4',
      likes: 567,
      comments: 12,
    },
    {
      id: '5',
      image: 'https://picsum.photos/400/400?random=5',
      likes: 1890,
      comments: 89,
    },
    {
      id: '6',
      image: 'https://picsum.photos/400/400?random=6',
      likes: 2340,
      comments: 156,
    },
    {
      id: '7',
      image: 'https://picsum.photos/400/400?random=7',
      likes: 980,
      comments: 34,
    },
    {
      id: '8',
      image: 'https://picsum.photos/400/400?random=8',
      likes: 1450,
      comments: 56,
    },
    {
      id: '9',
      image: 'https://picsum.photos/400/400?random=9',
      likes: 1120,
      comments: 78,
    },
  ];

  const tabs = ['Posts', 'Reels', 'Tagged'];

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
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerUsername, {color: textColor}]}>
            {profileData.username}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleThemeToggle}
            style={[
              styles.themeToggleButton,
              {
                backgroundColor:
                  themeMode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
              },
            ]}
            activeOpacity={0.7}>
            <Ionicons
              name={themeMode === 'dark' ? 'sunny' : 'moon'}
              size={20}
              color={textColor}
            />
          </TouchableOpacity>
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
          {/* Avatar and Stats */}
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              <Image source={{uri: profileData.avatar}} style={styles.avatar} />
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: textColor}]}>
                  {profileData.posts}
                </Text>
                <Text style={[styles.statLabel, {color: textColor}]}>
                  posts
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: textColor}]}>
                  {profileData.followers}
                </Text>
                <Text style={[styles.statLabel, {color: textColor}]}>
                  followers
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: textColor}]}>
                  {profileData.following}
                </Text>
                <Text style={[styles.statLabel, {color: textColor}]}>
                  following
                </Text>
              </View>
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.bioSection}>
            <Text style={[styles.fullName, {color: textColor}]}>
              {profileData.fullName}
            </Text>
            <Text style={[styles.bio, {color: textColor}]}>
              {profileData.bio}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {profileData.isOwnProfile ? (
              <>
                <TouchableOpacity
                  style={[styles.editButton, {borderColor: borderColor}]}
                  activeOpacity={0.7}>
                  <Text style={[styles.editButtonText, {color: textColor}]}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.shareButton, {borderColor: borderColor}]}
                  activeOpacity={0.7}>
                  <Ionicons name="share-outline" size={18} color={textColor} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    {
                      backgroundColor: profileData.isFollowing
                        ? 'transparent'
                        : Colors.PRIMARY,
                      borderColor: profileData.isFollowing
                        ? borderColor
                        : Colors.PRIMARY,
                    },
                  ]}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.followButtonText,
                      {
                        color: profileData.isFollowing ? textColor : '#FFFFFF',
                      },
                    ]}>
                    {profileData.isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.messageButton, {borderColor: borderColor}]}
                  activeOpacity={0.7}>
                  <Text style={[styles.messageButtonText, {color: textColor}]}>
                    Message
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.shareButton, {borderColor: borderColor}]}
                  activeOpacity={0.7}>
                  <Ionicons
                    name="person-add-outline"
                    size={18}
                    color={textColor}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Highlights/Stories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.highlightsContainer}
            contentContainerStyle={styles.highlightsContent}>
            {[1, 2, 3, 4, 5].map(item => (
              <View key={item} style={styles.highlightItem}>
                <View
                  style={[styles.highlightCircle, {borderColor: borderColor}]}>
                  <Ionicons name="add" size={20} color={textColor} />
                </View>
                <Text style={[styles.highlightLabel, {color: textColor}]}>
                  New
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, {borderTopColor: borderColor}]}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}>
              <Ionicons
                name={
                  tab === 'Posts' ? 'grid' : tab === 'Reels' ? 'film' : 'person'
                }
                size={20}
                color={
                  activeTab === tab
                    ? textColor
                    : theme === 'dark'
                    ? '#6B7280'
                    : '#9CA3AF'
                }
              />
              <View
                style={[
                  styles.tabIndicator,
                  activeTab === tab && {
                    backgroundColor: Colors.PRIMARY,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts Grid */}
        <FlatList
          data={postsData}
          renderItem={renderPostItem}
          keyExtractor={item => item.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.postsGrid}
        />
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
  headerUsername: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginLeft: scale(8),
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  avatarContainer: {
    marginRight: scale(20),
  },
  avatar: {
    width: moderateScale(88),
    height: moderateScale(88),
    borderRadius: moderateScale(44),
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
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
  bioSection: {
    marginBottom: verticalScale(12),
  },
  fullName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  bio: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(16),
  },
  editButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
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
  highlightsContainer: {
    marginBottom: verticalScale(12),
  },
  highlightsContent: {
    paddingRight: scale(16),
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: scale(16),
  },
  highlightCircle: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
  },
  highlightLabel: {
    fontSize: moderateScale(11),
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: verticalScale(8),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    position: 'relative',
  },
  activeTab: {},
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
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
