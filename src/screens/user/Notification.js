import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
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
          // Navigate to reel detail or play video
          // Disabled for now - no navigation needed
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