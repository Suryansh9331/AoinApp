import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
import Header from '../../components/Header/Header';
import VideoReel from '../../components/VideoReel/VideoReel';
import {getData} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';
import {Colors} from '../../utils/Colors';

const Explore = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);

  const [trendingData, setTrendingData] = useState([]);
  const [recentlyViewedData, setRecentlyViewedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewedLoading, setRecentlyViewedLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Dummy data for other sections
  const premiumPicks = [
    {
      id: 1,
      thumbnail: 'https://via.placeholder.com/200x300',
      videoUrl: '',
    },
    {
      id: 2,
      thumbnail: 'https://via.placeholder.com/200x300',
      videoUrl: '',
    },
    {
      id: 3,
      thumbnail: 'https://via.placeholder.com/200x300',
      videoUrl: '',
    },
  ];

  const verifiedSellers = [
    {id: 1, image: 'https://images.pexels.com/photos/27941502/pexels-photo-27941502.jpeg', verified: true},
    {id: 2, image: 'https://images.pexels.com/photos/31451028/pexels-photo-31451028.jpeg', verified: true},
    {id: 3, image: 'https://images.pexels.com/photos/13155691/pexels-photo-13155691.jpeg', verified: true},
    {id: 4, image: 'https://images.pexels.com/photos/28953735/pexels-photo-28953735.jpeg', verified: true},
    {id: 5, image: 'https://images.pexels.com/photos/7617893/pexels-photo-7617893.jpeg', verified: true},
    {id: 6, image: 'https://images.pexels.com/photos/28953736/pexels-photo-28953736.jpeg', verified: true},
  ];

  

  // Search reels functionality
  const searchReels = useCallback(async query => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await getData(
        `${ROUTES.SEARCH_REELS}?q=${encodeURIComponent(
          query.trim(),
        )}&per_page=20`,
      );

      if (response && response.data) {
        console.log('Search API response:', response);
        console.log('Search data length:', response.data.length);
        // Map search results to match VideoReelItem expected structure
        const mappedSearchResults = response.data.map((apiReel, index) => {
          console.log(`Search result ${index}:`, apiReel);
          const mappedResult = {
            id:
              apiReel.reel_id?.toString() ||
              apiReel.id?.toString() ||
              `search-${index}`,
            reel_id: apiReel.reel_id,
            videoUrl: apiReel.video_url || apiReel.videoUrl || apiReel.url || apiReel.video || apiReel.file_url,
            thumbnail: apiReel.thumbnail_url || apiReel.thumbnailUrl || apiReel.thumbnail || apiReel.poster_url || apiReel.image,
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
          };
          
          // Log if videoUrl is missing
          if (!mappedResult.videoUrl) {
            console.warn(`Search result ${index} has no videoUrl!`, apiReel);
          } else {
            console.log(`Search result ${index} videoUrl:`, mappedResult.videoUrl);
          }
          
          console.log(`Mapped search result ${index}:`, mappedResult);
          return mappedResult;
        });
        setSearchResults(mappedSearchResults);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Error searching reels:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Fetch trending data
  const fetchTrendingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getData(ROUTES.GET_TRENDING_LIST);
    
      if (response && response.status === 'success' && response.data) {
        const mappedTrendingData = response.data.map((apiReel, index) => {
          const mappedItem = {
            id:
              apiReel.reel_id?.toString() ||
              apiReel.id?.toString() ||
              `trending-${index}`,
            reel_id: apiReel.reel_id,
            videoUrl: apiReel.video_url || apiReel.videoUrl,
            thumbnail: apiReel.thumbnail_url || apiReel.thumbnail,
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
          };
         
          return mappedItem;
        });
       
        setTrendingData(mappedTrendingData);
      } else if (Array.isArray(response)) {
        const mappedTrendingData = response.map((apiReel, index) => {
          return {
            id:
              apiReel.reel_id?.toString() ||
              apiReel.id?.toString() ||
              `trending-${index}`,
            reel_id: apiReel.reel_id,
            videoUrl: apiReel.video_url || apiReel.videoUrl,
            thumbnail: apiReel.thumbnail_url || apiReel.thumbnail,
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
          };
        });
        setTrendingData(mappedTrendingData);
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recently viewed data
  const fetchRecentlyViewedData = useCallback(async () => {
    try {
      setRecentlyViewedLoading(true);
      const response = await getData(ROUTES.RECENTLY_VIEWED);
      console.log('Recently viewed API response:', response);
      
      if (
        response &&
        response.status === 'success' &&
        response.data &&
        response.data.reels
      ) {
        
        const mappedRecentlyViewedData = response.data.reels.map((apiReel, index) => {
        
          return {
            id:
              apiReel.reel_id?.toString() ||
              apiReel.id?.toString() ||
              `recent-${index}`,
            reel_id: apiReel.reel_id,
            videoUrl: apiReel.video_url || apiReel.videoUrl || apiReel.url || apiReel.video || apiReel.file_url,
            thumbnail: apiReel.thumbnail_url || apiReel.thumbnailUrl || apiReel.thumbnail || apiReel.poster_url || apiReel.image,
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
          };
        });
        console.log('Mapped recently viewed data:', mappedRecentlyViewedData);
        setRecentlyViewedData(mappedRecentlyViewedData);
      } else if (Array.isArray(response)) {
        console.log('Recently viewed array response:', response);
        // Map array response to ensure consistent structure
        const mappedRecentlyViewedData = response.map((apiReel, index) => {
          return {
            id:
              apiReel.reel_id?.toString() ||
              apiReel.id?.toString() ||
              `recent-${index}`,
            reel_id: apiReel.reel_id,
            videoUrl: apiReel.video_url || apiReel.videoUrl || apiReel.url || apiReel.video || apiReel.file_url,
            thumbnail: apiReel.thumbnail_url || apiReel.thumbnailUrl || apiReel.thumbnail || apiReel.poster_url || apiReel.image,
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
          };
        });
        setRecentlyViewedData(mappedRecentlyViewedData);
      }
    } catch (error) {
      console.error('Error fetching recently viewed data:', error);
    } finally {
      setRecentlyViewedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingData();
    fetchRecentlyViewedData();
  }, [fetchTrendingData, fetchRecentlyViewedData]);



  // Render circular seller thumbnail
  const renderSellerThumbnail = (item, showVerified = false) => (
    <TouchableOpacity
      key={item.id}
      style={styles.sellerThumbnailContainer}
      activeOpacity={0.7}>
      <View style={styles.sellerThumbnailWrapper}>
        <Image
          source={{uri: item.image}}
          style={styles.sellerThumbnail}
          resizeMode="cover"
        />
        {showVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={moderateScale(16)}
              color={Colors.PRIMARY}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderProductCard = (item, index, source = 'trending') => {
    const thumbnail = item.thumbnail_url || item.video_url || item.thumbnail;
    const reelId = item.id || item.reel_id;

    return (
      <TouchableOpacity
        key={reelId || index}
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={() => {
          const reelId = item.id || item.reel_id;
          console.log('ProductCard clicked - source:', source);
          console.log('ProductCard clicked - item:', item);
          console.log('ProductCard clicked - reelId:', reelId);
          
          // Navigate to UserReelsView for all reel types
          if (source === 'search') {
            navigation.navigate('UserReelsView', {
              initialReelId: reelId,
              reelsData: searchResults,
            });
          } else if (source === 'recentlyViewed') {
            navigation.navigate('UserReelsView', {
              initialReelId: reelId,
              reelsData: recentlyViewedData,
            });
          } else {
            // trending
            navigation.navigate('UserReelsView', {
              initialReelId: reelId,
              reelsData: trendingData,
            });
          }
        }}>
        <Image
          source={{uri: thumbnail || 'https://via.placeholder.com/200x300'}}
          style={styles.productCardImage}
          resizeMode="cover"
        />
        <View style={styles.playButtonOverlay}>
          <View style={styles.playButton}>
            <Ionicons
              name="play"
              size={moderateScale(16)}
              color="#FFFFFF"
            />
          </View>
        </View>
        {/* Show product info if available */}
        {item.product && (
          <View style={styles.productInfoOverlay}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.product.product_name}
            </Text>
            <Text style={styles.productPrice}>
              ₹{item.product.selling_price}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, {backgroundColor}]}>
      <Header
        title="Explore"
        leftType="none"
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, {backgroundColor: borderColor}]}>
          <Ionicons
            name="search"
            size={moderateScale(20)}
            color={textColor + '80'}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, {color: textColor}]}
            placeholder="Search products"
            placeholderTextColor={textColor + '60'}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              searchReels(text);
            }}
            onSubmitEditing={() => searchReels(searchQuery)}
          />
          <TouchableOpacity style={styles.micButton}>
            <Ionicons
              name="mic"
              size={moderateScale(20)}
              color={textColor + '80'}
            />
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {showSearchResults && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              Search Results
            </Text>
            {searchLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={[styles.loadingText, {color: textColor}]}>
                  Searching...
                </Text>
              </View>
            ) : searchResults.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
                nestedScrollEnabled={true}>
                {searchResults.map((item, index) =>
                  renderProductCard(item, index, 'search'),
                )}
              </ScrollView>
            ) : (
              <Text style={[styles.emptyText, {color: textColor}]}>
                No results found for "{searchQuery}"
              </Text>
            )}
          </View>
        )}

        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'All' && styles.tabActive,
              selectedTab === 'All' && {borderBottomColor: Colors.PRIMARY},
            ]}
            onPress={() => setSelectedTab('All')}>
            <Text
              style={[
                styles.tabText,
                {color: selectedTab === 'All' ? Colors.PRIMARY : textColor},
              ]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'Popular' && styles.tabActive,
              selectedTab === 'Popular' && {borderBottomColor: Colors.PRIMARY},
            ]}
            onPress={() => setSelectedTab('Popular')}>
            <Text
              style={[
                styles.tabText,
                {
                  color: selectedTab === 'Popular' ? Colors.PRIMARY : textColor,
                },
              ]}>
              Popular
            </Text>
          </TouchableOpacity>
        </View>

        {/* Premium Picks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              Premium Picks
            </Text>
            <TouchableOpacity style={styles.filterButton}>
              <MaterialIcons
                name="tune"
                size={moderateScale(20)}
                color={textColor}
              />
              <Text style={[styles.filterText, {color: textColor}]}>
                Filter
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            nestedScrollEnabled={true}>
            {premiumPicks.map((item, index) => renderProductCard(item, index, 'premium'))}
          </ScrollView>
        </View>

        {/* Verified Seller Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>
            Verified Seller
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            nestedScrollEnabled={true}>
            {verifiedSellers.map(item =>
              renderSellerThumbnail(item, true),
            )}
          </ScrollView>
        </View>

        {/* Trending Now Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => {
              if (trendingData.length > 0) {
                navigation.navigate('UserReelsView', {
                  initialReelId: trendingData[0].id,
                  reelsData: trendingData,
                });
              }
            }}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              Trending Now
            </Text>
            <View style={styles.seeAllContainer}>
              <Text style={[styles.seeAllText, {color: Colors.PRIMARY}]}>
                See All
              </Text>
              <Ionicons
                name="chevron-forward"
                size={moderateScale(16)}
                color={Colors.PRIMARY}
              />
            </View>
          </TouchableOpacity>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              nestedScrollEnabled={true}>
              {trendingData.length > 0 ? (
                trendingData.map((item, index) => renderProductCard(item, index, 'trending'))
              ) : (
                <Text style={[styles.emptyText, {color: textColor}]}>
                  No trending reels found
                </Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Recently Viewed Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              Recently Viewed
            </Text>
            <View style={styles.seeAllContainer}>
              <Text style={[styles.seeAllText, {color: Colors.PRIMARY}]}>
                See All
              </Text>
              <Ionicons
                name="chevron-forward"
                size={moderateScale(16)}
                color={Colors.PRIMARY}
              />
            </View>
          </View>
          {recentlyViewedLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
              <Text style={[styles.loadingText, {color: textColor}]}>
                Loading recently viewed...
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              nestedScrollEnabled={true}>
              {recentlyViewedData.length > 0 ? (
                recentlyViewedData.map((item, index) => renderProductCard(item, index, 'recentlyViewed'))
              ) : (
                <Text style={[styles.emptyText, {color: textColor}]}>
                  No recently viewed products
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginTop: verticalScale(12),
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
    backgroundColor: '#F5F5F5',
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    padding: 0,
  },
  micButton: {
    marginLeft: scale(8),
    padding: scale(4),
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: scale(16),
    marginBottom: verticalScale(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    paddingBottom: verticalScale(8),
    marginRight: scale(24),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  section: {
    marginTop: verticalScale(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  seeAllText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(16),
    gap: scale(4),
  },
  filterText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  horizontalScrollContent: {
    paddingLeft: scale(16),
    paddingRight: scale(16),
    paddingVertical: verticalScale(4),
  },
  sellerThumbnailContainer: {
    marginRight: scale(12),
    flexShrink: 0,
  },
  sellerThumbnailWrapper: {
    position: 'relative',
  },
  sellerThumbnail: {
    gap: scale(14),
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(40),
    
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(10),
  },
  productCard: {
    width: scale(150),
    height: verticalScale(200),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    marginRight: scale(12),
    backgroundColor: '#F5F5F5',
    flexShrink: 0,
  },
  productCardImage: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playButton: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(24),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    paddingVertical: verticalScale(20),
  },
  productInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: moderateScale(8),
  },
  productName: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  productPrice: {
    color: Colors.PRIMARY,
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
});

export default Explore;
