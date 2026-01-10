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
  Modal,
  TextInput,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useNavigation,
  CommonActions,
  useFocusEffect,
} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import Skeleton from '../../components/Skeleton/Skeleton';
import {clearCredentials} from '../../redux/slices/authSlice';
import {clearAuthToken, getData} from '../../utils/APiCall';
import {deleteReel, updateReel} from '../../utils/APiCall';
import {removeItem, AUTH_STORAGE_KEY} from '../../utils/MMKVStorage';
import {ROUTES} from '../../utils/Routes';


const fetchMerchantReelsDirect = async (page = 1, perPage = 20) => {
  try {
    const response = await getData(`${ROUTES.MERCHANT_MY_REELS}?page=${page}&per_page=${perPage}`);
    
    return response;
  } catch (error) {
    console.error('Error fetching merchant reels:', error);
    throw error;
  }
};

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const POST_ITEM_SIZE = Math.floor(SCREEN_WIDTH / 3);

const Profile = () => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const userData = useSelector(state => state.auth.data);
  console.log("User Data:",userData)
  // Local state for reels instead of Redux
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const merchantId = useMemo(() => {
    const userInfo = userData?.data || userData || {};
    return userInfo.merchant_id || userInfo.id || userInfo.user_id || null;
  }, [userData]);

  const [merchantProfile, setMerchantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followersData, setFollowersData] = useState([]);
  const [merchantStats, setMerchantStats] = useState(null);

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
      // console.log("Followers Response:", response);
      
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

  const fetchMerchantStats = useCallback(async () => {
    if (!merchantId) {
      return;
    }

    try {
      const response = await getData(`${ROUTES.MERCHANT_STATS_DETAIL}${merchantId}/stats`);
      console.log('Merchant Stats Response:', response);
      
      if (response && response.status === 'success') {
        setMerchantStats(response.data || response);
      } else if (response.likes_count !== undefined || response.shares_count !== undefined) {
        setMerchantStats(response);
      }
    } catch (error) {
      console.log('Merchant stats fetch error:', error);
      // Silently handle errors for stats
    }
  }, [merchantId]);

  useEffect(() => {
    if (!merchantProfile) {
      fetchMerchantProfile();
    }
    if (merchantId) {
      fetchFollowersCount();
      fetchMerchantStats();
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
  }, []);

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
              routes: [{name: 'Splash'}],
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
    ({item}) => {
      // Handle API response structure properly
      const thumbnailUrl = item.thumbnail_url || item.thumbnail;
      const views = formatViews(item.views || item.views_count || 0);
      const isMenuVisible = visibleMenuReelId === (item.id || item.reel_id);
      const isDeleting = deletingReelId === (item.id || item.reel_id);
      
      // Use fallback image if thumbnail is null, undefined, or invalid
      const imageSource = thumbnailUrl && thumbnailUrl !== 'null' && thumbnailUrl !== null && thumbnailUrl !== undefined
        ? {uri: thumbnailUrl} 
        : {uri: 'https://i.pravatar.cc/150?img=1'};

      return (
        <TouchableOpacity
          style={[styles.postItem, {borderColor: borderColor}]}
          activeOpacity={0.7}
          onPress={() => {
            const reelIndex = reels.findIndex(reel => reel.id === item.id || reel.reel_id === item.reel_id);
            navigation.navigate('UserReelsView', {
              initialReelIndex: reelIndex >= 0 ? reelIndex : 0,
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
                {backgroundColor: theme === 'dark' ? '#2A2A2A' : '#FFFFFF'},
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
                    {color: theme === 'dark' ? '#FFFFFF' : '#000000'},
                  ]}>
                  Edit
                </Text>
              </TouchableOpacity>
              <View
                style={[styles.menuDivider, {backgroundColor: borderColor}]}
              />
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => handleDeleteReel(item)}>
                <MaterialCommunityIcons
                  name="delete"
                  size={16}
                  color="#FF3040"
                />
                <Text style={[styles.menuOptionText, {color: '#FF3040'}]}>
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
    <View style={[styles.container, {backgroundColor}]}>
      <View
        style={[
          styles.header,
          {borderBottomColor: borderColor},
          Platform.OS === 'ios' && {paddingTop: insets.top + verticalScale(10)},
        ]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, {color: textColor}]}>Profile</Text>
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
        {profileLoading && !merchantProfile ? (
          <View style={styles.profileSection}>
            {/* Avatar Skeleton */}
            <View style={styles.avatarContainer}>
              <Skeleton
                width={moderateScale(100)}
                height={moderateScale(100)}
                radius={moderateScale(50)}
              />
            </View>

            {/* Name Skeleton */}
            <Skeleton
              width={moderateScale(150)}
              height={moderateScale(20)}
              radius={4}
              style={styles.skeletonName}
            />
            {/* Username Skeleton */}
            <Skeleton
              width={moderateScale(120)}
              height={moderateScale(16)}
              radius={4}
              style={styles.skeletonUsername}
            />

            {/* Stats Skeleton */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Skeleton
                  width={moderateScale(30)}
                  height={moderateScale(18)}
                  radius={4}
                />
                <Skeleton
                  width={moderateScale(40)}
                  height={moderateScale(12)}
                  radius={4}
                  style={{marginTop: verticalScale(4)}}
                />
              </View>
              <View style={styles.statItem}>
                <Skeleton
                  width={moderateScale(30)}
                  height={moderateScale(18)}
                  radius={4}
                />
                <Skeleton
                  width={moderateScale(50)}
                  height={moderateScale(12)}
                  radius={4}
                  style={{marginTop: verticalScale(4)}}
                />
              </View>
              <View style={styles.statItem}>
                <Skeleton
                  width={moderateScale(30)}
                  height={moderateScale(18)}
                  radius={4}
                />
                <Skeleton
                  width={moderateScale(40)}
                  height={moderateScale(12)}
                  radius={4}
                  style={{marginTop: verticalScale(4)}}
                />
              </View>
            </View>

            {/* Action Buttons Skeleton */}
            <View style={styles.actionButtons}>
              <Skeleton
                width="70%"
                height={moderateScale(44)}
                radius={moderateScale(8)}
              />
              <Skeleton
                width={moderateScale(44)}
                height={moderateScale(44)}
                radius={moderateScale(8)}
              />
            </View>

            {/* Bio Skeleton */}
            <View style={styles.skeletonBioContainer}>
              <Skeleton width="90%" height={moderateScale(14)} radius={4} />
              <Skeleton
                width="80%"
                height={moderateScale(14)}
                radius={4}
                style={{marginTop: verticalScale(6)}}
              />
              <Skeleton
                width="60%"
                height={moderateScale(14)}
                radius={4}
                style={{marginTop: verticalScale(6)}}
              />
            </View>

            {/* Reels Grid Skeleton */}
            <View style={styles.postsGridContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.skeletonReelsRow}>
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <Skeleton
                    key={`skeleton-reel-${index}`}
                    width={POST_ITEM_SIZE}
                    height={POST_ITEM_SIZE}
                    radius={0}
                    style={styles.skeletonReelItem}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
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
                source={{uri: merchantProfile?.profile_img || 'https://i.pravatar.cc/150?img=1'}}
                style={styles.avatar}
              />
            </View>

            {/* Merchant Name */}
            <View style={styles.nameContainer}>
              <Text style={[styles.username, {color: textColor}]}>
                {merchantProfile?.business_name || 'Merchant Store'}
              </Text>
              {merchantProfile?.is_verified && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.PRIMARY} style={styles.verifiedBadge} />
              )}
            </View>
            {/* Username below name */}
            <Text style={[styles.userHandle, {color: textColor}]}>
              @{merchantProfile?.username || 'merchant'}
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: textColor}]}>
                  {reels?.length || 0}
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
                  {merchantStats?.likes_count || 0}
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
                    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  },
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
                      <Text style={[styles.loadingMoreText, {color: textColor}]}>
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
                  <Ionicons
                    name="videocam-outline"
                    size={48}
                    color={textColor}
                  />
                  <Text style={[styles.emptyText, {color: textColor}]}>
                    No reels yet
                  </Text>
                  <Text style={[styles.emptySubText, {color: textColor}]}>
                    Upload your first reel to get started
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Edit Description Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseEditModal}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, {backgroundColor: backgroundColor}]}>
            {/* Modal Header */}
            <View
              style={[styles.modalHeader, {borderBottomColor: borderColor}]}>
              <TouchableOpacity
                onPress={handleCloseEditModal}
                disabled={updatingReel}
                style={styles.modalCancelButton}>
                <Text style={[styles.modalCancelText, {color: textColor}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, {color: textColor}]}>
                Edit Description
              </Text>
              <TouchableOpacity
                onPress={handleSaveDescription}
                disabled={updatingReel || !editDescription.trim()}
                style={[
                  styles.modalSaveButton,
                  (!editDescription.trim() || updatingReel) &&
                    styles.modalSaveButtonDisabled,
                ]}>
                {updatingReel ? (
                  <ActivityIndicator size="small" color={Colors.PRIMARY} />
                ) : (
                  <Text style={[styles.modalSaveText, {color: Colors.PRIMARY}]}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Description Input */}
            <View style={styles.modalBody}>
              <TextInput
                style={[
                  styles.editDescriptionInput,
                  {
                    color: textColor,
                    borderColor: borderColor,
                    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  },
                ]}
                placeholder="Add description..."
                placeholderTextColor={textColor + '80'}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                editable={!updatingReel}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    left: scale(6),
    borderRadius: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 101,
    minWidth: moderateScale(120),
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    gap: scale(8),
  },
  menuOptionText: {
    fontSize: moderateScale(14),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalCancelButton: {
    padding: scale(8),
    minWidth: scale(60),
  },
  modalCancelText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  modalSaveButton: {
    padding: scale(8),
    minWidth: scale(60),
    alignItems: 'flex-end',
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  modalBody: {
    padding: scale(16),
  },
  editDescriptionInput: {
    minHeight: verticalScale(150),
    padding: scale(12),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    fontSize: moderateScale(14),
  },
  profileLoadingContainer: {
    paddingVertical: verticalScale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileErrorContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(5),
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
    paddingHorizontal: scale(5),
  },
  skeletonReelItem: {
    marginRight: scale(4),
  },
  skeletonReelsRow: {
    paddingHorizontal: scale(5),
    paddingVertical: verticalScale(8),
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
});

export default Profile;
