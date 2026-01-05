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
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
import Header from '../../components/Header/Header';
import {getData} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';
import {Colors} from '../../utils/Colors';

const Search = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);

  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy data for other sections
  const premiumSellers = [
    {id: 1, image: 'https://via.placeholder.com/80'},
    {id: 2, image: 'https://via.placeholder.com/80'},
    {id: 3, image: 'https://via.placeholder.com/80'},
    {id: 4, image: 'https://via.placeholder.com/80'},
  ];

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
    {id: 1, image: 'https://via.placeholder.com/80', verified: true},
    {id: 2, image: 'https://via.placeholder.com/80', verified: true},
    {id: 3, image: 'https://via.placeholder.com/80', verified: true},
    {id: 4, image: 'https://via.placeholder.com/80', verified: true},
  ];

  const recentProducts = [
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

  useEffect(() => {
    fetchTrendingData();
  }, [fetchTrendingData]);

  const renderHeaderRight = () => {
    return (
      <TouchableOpacity onPress={() => {}}>
        <Text style={[styles.headerButtonText, {color: textColor}]}>
          Search
        </Text>
      </TouchableOpacity>
    );
  };

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

  // Render product card with play button
  const renderProductCard = (item, index) => {
    const thumbnail = item.thumbnail_url || item.video_url || item.thumbnail;
    return (
      <TouchableOpacity
        key={item.id || item.reel_id || index}
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={() => {
          // Navigate to reel detail or play video
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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, {backgroundColor}]}>
      <Header
        title=""
        leftType="back"
        onLeftPress={() => {
          navigation.goBack();
        }}
        rightContent={renderHeaderRight()}
        containerStyle={styles.headerContainer}
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
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.micButton}>
            <Ionicons
              name="mic"
              size={moderateScale(20)}
              color={textColor + '80'}
            />
          </TouchableOpacity>
        </View>

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

        {/* Premium Seller Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>
            Premium Seller
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            nestedScrollEnabled={true}>
            {premiumSellers.map(item => renderSellerThumbnail(item))}
          </ScrollView>
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
            {premiumPicks.map((item, index) => renderProductCard(item, index))}
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
          <Text style={[styles.sectionTitle, {color: textColor}]}>
            Trending Now
          </Text>
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
                trendingData.map((item, index) => renderProductCard(item, index))
              ) : (
                <Text style={[styles.emptyText, {color: textColor}]}>
                  No trending reels found
                </Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Recents Products Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>
            Recents Products
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            nestedScrollEnabled={true}>
            {recentProducts.map((item, index) => renderProductCard(item, index))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
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
    width: moderateScale(80),
    height: moderateScale(80),
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
  emptyText: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    paddingVertical: verticalScale(20),
  },
});

export default Search;
