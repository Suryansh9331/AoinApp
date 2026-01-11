import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import { getData } from '../../utils/APiCall';
import { ROUTES } from '../../utils/Routes';
import { Colors } from '../../utils/Colors';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';

const Notification = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);
  
  const [trendingData, setTrendingData] = useState([]);
  const [recentlyViewedData, setRecentlyViewedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewedLoading, setRecentlyViewedLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search reels functionality
  const searchReels = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await getData(`${ROUTES.SEARCH_REELS}?q=${encodeURIComponent(query.trim())}&per_page=20`);
      
      if (response && response.data) {
        // Map search results to match expected structure
        const mappedSearchResults = response.data.map((apiReel, index) => {
          return {
            id: apiReel.reel_id?.toString() || apiReel.id?.toString() || `search-${index}`,
            reel_id: apiReel.reel_id,
            videoUrl: apiReel.video_url,
            thumbnail: apiReel.thumbnail_url,
            username: apiReel.merchant?.username || apiReel.merchant?.user_name || `merchant_${apiReel.merchant_id}` || 'User',
            userAvatar: apiReel.merchant?.avatar || apiReel.merchant?.avatar_url || apiReel.product?.thumbnail_url || 'https://i.pravatar.cc/150?img=1',
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
        setTrendingData(response.data);
      } else if (Array.isArray(response)) {
        setTrendingData(response);
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
      if (response && response.status === 'success' && response.data && response.data.reels) {
        setRecentlyViewedData(response.data.reels);
      } else if (Array.isArray(response)) {
        setRecentlyViewedData(response);
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
  }, []);

  // Render product card with play button
  const renderProductCard = (item, index) => {
    // Use thumbnail_url if available, otherwise fallback to video_url or thumbnail
    const thumbnail = item.thumbnail_url || item.video_url || item.thumbnail;
    return (
      <TouchableOpacity
        key={item.id || item.reel_id || index}
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('UserReelsView', {
            initialReelIndex: 0,
            reelsData: showSearchResults ? searchResults : trendingData,
            startIndex: showSearchResults ? searchResults.findIndex(r => r.id === (item.id || item.reel_id)) : trendingData.findIndex(r => r.id === (item.id || item.reel_id))
          });
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
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor }]}>
      <Header
        title="Notifications"
        leftType="back"
        onLeftPress={() => {
          navigation.goBack();
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: borderColor }]}>
          <Ionicons
            name="search"
            size={moderateScale(20)}
            color={textColor + '80'}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search products"
            placeholderTextColor={textColor + '60'}
            value={searchQuery}
            onChangeText={(text) => {
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
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Search Results
            </Text>
            {searchLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={[styles.loadingText, { color: textColor }]}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
                nestedScrollEnabled={true}>
                {searchResults.map((item, index) => renderProductCard(item, index))}
              </ScrollView>
            ) : (
              <Text style={[styles.emptyText, { color: textColor }]}>
                No results found for "{searchQuery}"
              </Text>
            )}
          </View>
        )}
        
        {/* Trending Now Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Trending Now
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
              <Text style={[styles.loadingText, { color: textColor }]}>Loading trending reels...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              nestedScrollEnabled={true}>
              {trendingData.length > 0 ? (
                trendingData.map((item, index) => renderProductCard(item, index))
              ) : (
                <Text style={[styles.emptyText, { color: textColor }]}>
                  No trending reels found
                </Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Recently Viewed Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Recently Viewed
          </Text>
          {recentlyViewedLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
              <Text style={[styles.loadingText, { color: textColor }]}>Loading recently viewed...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              nestedScrollEnabled={true}>
              {recentlyViewedData.length > 0 ? (
                recentlyViewedData.map((item, index) => renderProductCard(item, index))
              ) : (
                <Text style={[styles.emptyText, { color: textColor }]}>
                  No recently viewed products
                </Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Recent Notifications
          </Text>
          <View style={styles.notificationContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              No new notifications
            </Text>
          </View>
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
  section: {
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
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
  horizontalScrollContent: {
    paddingLeft: scale(16),
    paddingRight: scale(16),
    paddingVertical: verticalScale(4),
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
  emptyText: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    paddingVertical: verticalScale(20),
  },
  notificationContainer: {
    marginHorizontal: scale(16),
  },
});
export default Notification;