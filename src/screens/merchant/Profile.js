import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  CommonActions,
  useFocusEffect,
} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { Colors } from '../../utils/Colors';
import Skeleton from '../../components/Skeleton/Skeleton';
import { clearCredentials } from '../../redux/slices/authSlice';
import { clearAuthToken, getData } from '../../utils/APiCall';
import { deleteReel, updateReel } from '../../utils/APiCall';
import { removeItem, AUTH_STORAGE_KEY } from '../../utils/MMKVStorage';
import { ROUTES } from '../../utils/Routes';
import { setThemeMode } from '../../redux/slices/themeSlice';
import { setReelsData } from '../../redux/slices/reelsSlice';
import EditReelModal from './components/EditReelModal';
import ProfileSkeleton from './components/ProfileSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POST_ITEM_SIZE = Math.floor(SCREEN_WIDTH / 3);

const Profile = () => {
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const userData = useSelector(state => state.auth.data);
  const themeState = useSelector(state => state.theme);
  const handleThemeToggle = () => {
    const newThemeMode = theme === 'dark' ? 'light' : 'dark';
    dispatch(setThemeMode(newThemeMode));
  };
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const merchantId = useMemo(() => {
    const userInfo = userData?.data || userData || {};
    return userInfo.merchant_id || userInfo.id || userInfo.user_id || null; }, [userData]);
  const [merchantProfile, setMerchantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followersData, setFollowersData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);


  const fetchMerchantReelsDirect = async (page = 1, perPage = 20) => {
    try {
      const response = await getData(`${ROUTES.MERCHANT_MY_REELS}?page=${page}&per_page=${perPage}`);
    
      return response;
    } catch (error) {
      console.error('Error fetching merchant reels:', error);
      throw error;
    }
  };
  const fetchMerchantProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await getData(ROUTES.MERCHANT_PROFILE);

      if (response && response.profile) {
        setMerchantProfile(response.profile);
      } else {
        setProfileError('Invalid profile data received');
      }
    } catch (error) {
      setProfileError(error?.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchFollowersCount = useCallback(async () => {
    if (!merchantId) {
      return;
    }

    try {
      const response = await getData(`${ROUTES.MERCHANT_FOLLOWERS}?page=1&per_page=20`);

      if (response && response.status === 'success') {
        setFollowersCount(response.total_followers || 0);
        setFollowersData(response.data || []);
      } else if (response && response.total_followers !== undefined) {
        setFollowersCount(response.total_followers);
        setFollowersData(response.data || []);
      }
    } catch (error) {
      console.log('Followers count fetch error:', error);
      // Silently handle errors for followers count
    }
  }, [merchantId]);

  const fetchMerchantAnalytics = useCallback(async () => {
    try {
      const response = await getData(ROUTES.MERCHANT_ANALYTICS);

      if (response && response.data) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.log('Analytics fetch error:', error);
    }
  }, []);


  useEffect(() => {
    if (!merchantProfile) {
      fetchMerchantProfile();
    }
    if (merchantId) {
      fetchFollowersCount();
      fetchMerchantAnalytics();
    }

  }, [merchantId]);

  // Fetch reels using direct API
  const fetchReels = useCallback(async (page = 1, perPage = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchMerchantReelsDirect(page, perPage);

      if (response && response.data) {
        if (page === 1) {
          setReels(response.data);
        } else {
          setReels(prev => [...prev, ...response.data]);
        }
        setHasMoreReels(response.data.length === perPage);
        
        // Store reels data in Redux for UserReelsView
        dispatch(setReelsData(response.data));
        
      } else {
        setReels([]);
        setHasMoreReels(false);
      }
    } catch (error) {
      setError('Failed to fetch reels. Please try again.');
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {

      setCurrentPage(1);
      setHasMoreReels(true);
      setLoadingMore(false);


      if (!merchantProfile) {
        fetchMerchantProfile();
      }

      if (merchantId) {
        fetchFollowersCount();
      }

      fetchMerchantAnalytics();


      const timer = setTimeout(() => {
        fetchReels(1, 20);
      }, 300);

      return () => clearTimeout(timer);

    }, [merchantId, fetchFollowersCount, setCurrentPage, setHasMoreReels, setLoadingMore, fetchReels]),
  );


  const loadMoreReels = useCallback(async () => {
    if (!hasMoreReels || loadingMore || loading) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      await fetchReels(nextPage, 20);
      setCurrentPage(nextPage);


    } catch (error) {
      console.log('Error loading more reels:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMoreReels, loadingMore, loading, fetchReels, setCurrentPage]);

  const formatViews = useCallback(views => {
    if (!views) return '0';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }, []);

  const [visibleMenuReelId, setVisibleMenuReelId] = useState(null);
  const [deletingReelId, setDeletingReelId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReels, setHasMoreReels] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReelData, setEditingReelData] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [updatingReel, setUpdatingReel] = useState(false);

  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
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
            }),
          );
        },
      },
    ]);
  }, [dispatch, navigation]);

  const handleDeleteReel = useCallback(
    item => {
      Alert.alert('Delete Reel', 'Are you sure you want to delete this reel?', [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setVisibleMenuReelId(null),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingReelId(item.id || item.reel_id);
            try {
              const reelId = item.id || item.reel_id;
              await deleteReel(reelId);

              // Refresh reels after deletion
              await fetchReels(1, 20);

              setVisibleMenuReelId(null);
              Alert.alert('Success', 'Reel deleted successfully');
            } catch (error) {
              console.error('Error deleting reel:', error);
              Alert.alert('Error', 'Failed to delete reel. Please try again.');
            } finally {
              setDeletingReelId(null);
            }
          },
        },
      ]);
    },
    [fetchReels],
  );

  const handleEditReel = useCallback(item => {
    setVisibleMenuReelId(null);

    const currentDescription = item.description || item.caption || '';
    setEditingReelData(item);
    setEditDescription(currentDescription);
    setEditModalVisible(true);
  }, []);

  const handleSaveDescription = useCallback(async () => {
    if (!editDescription.trim()) {
      Alert.alert('Error', 'Please add a description');
      return;
    }

    if (!editingReelData) {
      return;
    }

    setUpdatingReel(true);
    try {
      const reelId = editingReelData.id || editingReelData.reel_id;
      await updateReel(reelId, {
        description: editDescription.trim(),
      });

      await fetchReels(1, 20);

      setEditModalVisible(false);
      setEditingReelData(null);
      setEditDescription('');
      Alert.alert('Success', 'Description updated successfully');
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to update description');
    } finally {
      setUpdatingReel(false);
    }
  }, [editDescription, editingReelData, dispatch]);

  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditingReelData(null);
    setEditDescription('');
  }, []);

  const renderReelItem = useCallback(
    ({ item }) => {
      const thumbnailUrl = item.thumbnail_url || item.thumbnail;
      const views = formatViews(item.views || item.views_count || 0);
      const isMenuVisible = visibleMenuReelId === (item.id || item.reel_id);
      const isDeleting = deletingReelId === (item.id || item.reel_id);

      const imageSource = thumbnailUrl && thumbnailUrl !== 'null' && thumbnailUrl !== null && thumbnailUrl !== undefined
        ? { uri: thumbnailUrl }
        : { uri: 'https://i.pravatar.cc/150?img=1' };

      return (
        <TouchableOpacity
          style={[styles.postItem, { borderColor: borderColor }]}
          activeOpacity={0.7}
          onPress={() => {
            const currentReelId = item.reel_id || item.id;
            
            navigation.navigate('UserReelsView', {
              initialReelId: currentReelId,
              reels: reels, 
            });
          }}>
          <Image
            source={imageSource}
            style={styles.postImage}
            resizeMode="cover"
          />
          {/* Video icon in top right */}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="videocam" size={14} color="#FFFFFF" />
          </View>

          {/* Three-dot menu in top left */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              setVisibleMenuReelId(
                isMenuVisible ? null : item.id || item.reel_id,
              )
            }
            disabled={isDeleting}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Menu options */}
          {isMenuVisible && !isDeleting && (
            <View
              style={[
                styles.menuOptions,
                { backgroundColor: theme === 'dark' ? '#2A2A2A' : '#FFFFFF' },
              ]}>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => handleEditReel(item)}>
                <MaterialCommunityIcons
                  name="pencil"
                  size={16}
                  color={theme === 'dark' ? '#FFFFFF' : '#000000'}
                />
                <Text
                  style={[
                    styles.menuOptionText,
                    { color: theme === 'dark' ? '#FFFFFF' : '#000000' },
                  ]}>
                  Edit
                </Text>
              </TouchableOpacity>
              <View
                style={[styles.menuDivider, { backgroundColor: borderColor }]}
              />
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => handleDeleteReel(item)}>
                <MaterialCommunityIcons
                  name="delete"
                  size={16}
                  color="#FF3040"
                />
                <Text style={[styles.menuOptionText, { color: '#FF3040' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading indicator while deleting */}
          {isDeleting && (
            <View style={styles.deleteLoadingOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          )}

          {/* View count in bottom left */}
          <View style={styles.viewCountContainer}>
            <Text style={styles.viewCountText}>{views}</Text>
          </View>
          <View
            style={[styles.postOverlay]}
            pointerEvents="none">
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
    [
      borderColor,
      visibleMenuReelId,
      deletingReelId,
      reels,
      navigation,
      theme,
      formatViews,
    ],
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: borderColor },
          Platform.OS === 'ios' && { paddingTop: insets.top + verticalScale(10) },
        ]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="chevron-down" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, styles.themeToggleButton]}
            onPress={handleThemeToggle}>
            <Ionicons 
              name={theme === 'dark' ? 'sunny' : 'moon'} 
              size={20} 
              color={textColor} 
            />
          </TouchableOpacity>
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
        {profileLoading && !merchantProfile ? (
          <ProfileSkeleton />
        ) : profileError && !merchantProfile ? (
          <View style={styles.profileErrorContainer}>
            <Text style={[styles.errorText, { color: Colors.PRIMARY }]}>
              {profileError}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { borderColor: borderColor }]}
              onPress={fetchMerchantProfile}>
              <Text style={[styles.retryButtonText, { color: Colors.PRIMARY }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : merchantProfile ? (
          <View style={styles.profileSection}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: merchantProfile?.profile_img || 'https://i.pravatar.cc/150?img=1' }}
                style={styles.avatar}
              />
            </View>

            {/* Merchant Name */}
            <View style={styles.nameContainer}>
              <Text style={[styles.username, { color: textColor }]}>
                {merchantProfile?.business_name || 'Merchant Store'}
              </Text>
              {merchantProfile?.is_verified && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.PRIMARY} style={styles.verifiedBadge} />
              )}
            </View>
            {/* Username below name */}
            <Text style={[styles.userHandle, { color: textColor }]}>
              @{merchantProfile?.username || 'merchant'}
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: textColor }]}>
                  {reels?.length || 0}
                </Text>
                <Text style={[styles.statLabel, { color: textColor }]}>
                  Reels
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: textColor }]}>
                  {followersCount}
                </Text>
                <Text style={[styles.statLabel, { color: textColor }]}>
                  Followers
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: textColor }]}>
                  {analyticsData?.aggregated_stats?.total_likes || 0}
                </Text>
                <Text style={[styles.statLabel, { color: textColor }]}>
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
                    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('EditProfile')}>
                <Text style={[styles.editButtonText, { color: Colors.PRIMARY }]}>
                  Edit profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.bookmarkButton,
                  {
                    borderColor: borderColor,
                    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  },
                ]}
                activeOpacity={0.7}>
                <Ionicons
                  name="bookmark-outline"
                  size={18}
                  color={Colors.PRIMARY}
                />
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
                  scrollEnabled={true}
                  onEndReached={loadMoreReels}
                  ListFooterComponent={loadingMore ? (
                    <View style={styles.loadingMoreContainer}>
                      <ActivityIndicator size="small" color={Colors.PRIMARY} />
                      <Text style={[styles.loadingMoreText, { color: textColor }]}>
                        Loading more...
                      </Text>
                    </View>
                  ) : null}

                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                />
              ) : loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.PRIMARY} />
                  <Text style={[styles.loadingText, { color: textColor }]}>
                    Loading reels...
                  </Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: Colors.PRIMARY }]}>
                    {error}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="videocam-outline"
                    size={48}
                    color={textColor}
                  />
                  <Text style={[styles.emptyText, { color: textColor }]}>
                    No reels yet
                  </Text>
                  <Text style={[styles.emptySubText, { color: textColor }]}>
                    Upload your first reel to get started
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Edit Description Modal */}
      <EditReelModal
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        onSave={handleSaveDescription}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        updatingReel={updatingReel}
      />
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
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
  },
  verifiedBadge: {
    marginLeft: scale(4),
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
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
    position: 'relative',
    marginHorizontal: 0.1,
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
  menuButton: {
    position: 'absolute',
    top: scale(6),
    left: scale(6),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: moderateScale(4),
    padding: scale(4),
    zIndex: 100,
  },
  menuOptions: {
    position: 'absolute',
    top: scale(32),
    left: scale(2),
    borderRadius: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 101,
    minWidth: moderateScale(120),
    paddingVertical: verticalScale(5),
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(3),
    gap: scale(8),
  },
  menuOptionText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginVertical: verticalScale(4),
  },
  deleteLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 102,
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
    fontSize: moderateScale(10),
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
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  loadingMoreText: {
    marginLeft: scale(8),
    fontSize: moderateScale(12),
  },
  retryButton: {
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(5),
    borderRadius: moderateScale(8),
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
});

export default Profile;
