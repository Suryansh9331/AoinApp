import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { Colors } from '../../utils/Colors';
import { getData } from '../../utils/APiCall';
import { ROUTES } from '../../utils/Routes';
import Header from '../../components/Header/Header';

const FollowerList = ({ route }) => {
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);
  const navigation = useNavigation();
  
  const { merchantId } = route.params || {};
  
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFollowers = useCallback(async () => {
    if (!merchantId) {
      setError('Merchant ID not provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await getData(ROUTES.MERCHANT_FOLLOW_LIST);
     
      
      if (response?.status === 'success' && response?.data && Array.isArray(response.data)) {
        setFollowers(response.data);
      } else if (response && Array.isArray(response)) {
        setFollowers(response);
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      setError(error?.message || 'Failed to fetch followers');
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  const renderFollowerItem = ({ item }) => {
    const followerName = item.business_name || 
                       item.merchant?.username || 
                       item.merchant?.user_name || 
                       item.merchant?.first_name || 
                       item.username || 
                       item.user_name || 
                       'Unknown User';
    
    const followerAvatar = item.merchant?.avatar || 
                          item.merchant?.avatar_url || 
                          item.avatar || 
                          item.avatar_url || 
                          'https://i.pravatar.cc/150?img=1';

    return (
      <TouchableOpacity
        style={[styles.followerItem, { borderColor, backgroundColor }]}
        activeOpacity={0.7}
        onPress={() => {
          // Navigate to follower's profile if needed
          navigation.navigate('PerticularReelProfile', {
            merchantId: item.merchant_id || item.id,
          });
        }}>
        <Image
          source={{ uri: followerAvatar }}
          style={styles.avatar}
        />
        <View style={styles.followerInfo}>
          <Text style={[styles.followerName, { color: textColor }]}>
            {followerName}
          </Text>
          
        </View>
        <Ionicons
          name="chevron-forward"
          size={14}
          color={textColor}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

 

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={textColor} opacity={0.3} />
      <Text style={[styles.emptyText, { color: textColor }]}>
        No followers yet
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color={Colors.PRIMARY} />
      <Text style={[styles.errorText, { color: Colors.PRIMARY }]}>
        {error}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { borderColor: Colors.PRIMARY }]}
        onPress={fetchFollowers}
        activeOpacity={0.7}>
        <Text style={[styles.retryButtonText, { color: Colors.PRIMARY }]}>
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <SafeAreaView style={{ backgroundColor }}>
       <Header
        title="Followers"
        
       />
      </SafeAreaView>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading followers...
          </Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : followers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={followers}
          renderItem={renderFollowerItem}
          keyExtractor={(item, index) => item.id || item.merchant_id || `follower-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  errorText: {
    fontSize: moderateScale(16),
    textAlign: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  retryButton: {
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: moderateScale(16),
    marginTop: verticalScale(12),
    opacity: 0.6,
  },
  listContainer: {
    paddingVertical: verticalScale(8),
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
  },
  avatar: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#f0f0f0',
  },
  followerInfo: {
    flex: 1,
    marginLeft: moderateScale(12),
  },
  followerName: {
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  followerBio: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(2),
    opacity: 0.7,
  },
  chevron: {
    marginLeft: moderateScale(8),
  },
});

export default FollowerList;
