import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Share,
  Platform,
  Linking,
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {Colors} from '../../utils/Colors';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {
  likeReel_Request,
  unlikeReel_Request,
  shareReel_Request,
} from '../../redux/slices/reelSlice';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const VideoReelItem = ({item, isActive, onLike, onShare, itemHeight}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userData = useSelector(state => state.auth.data);
  const userRole = userData?.data?.role || userData?.role || 'user';
  const theme = useAppTheme();
  const {backgroundColor, textColor} = getThemeColors(theme);
  const merchantProfileImage =
  item?.profile_img ||               // ← THIS IS THE REAL FIELD
  item?.merchant?.profile_img ||     // fallback if nested
  null;




  // Convert isLiked to boolean (handle string "true"/"false" from API)
  const getIsLiked = value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
  };

  const [isLiked, setIsLiked] = useState(() => getIsLiked(item.isLiked));
  const [likes, setLikes] = useState(item.likes || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);

  const likeScale = useRef(new Animated.Value(1)).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const doubleTapOpacity = useRef(new Animated.Value(0)).current;
  const buyPulse = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(null);

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isActive]);

  // Sync local state with item props (from Redux)
  // Use item.id or item.reel_id to detect when item changes
  useEffect(() => {
    const itemIsLiked = getIsLiked(item.isLiked);
    setIsLiked(itemIsLiked);
    setLikes(item.likes || 0);
  }, [item.id, item.reel_id, item.isLiked, item.likes]);

  const handleLike = () => {
    const newLikedState = !isLiked;
    const reelId = item.reel_id || item.id;

    // Optimistically update UI
    setIsLiked(newLikedState);
    setLikes(prev => (newLikedState ? prev + 1 : prev - 1));

    // Animate like button
    Animated.sequence([
      Animated.parallel([
        Animated.spring(likeScale, {
          toValue: 1.3,
          useNativeDriver: true,
        }),
        Animated.timing(likeOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(likeScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(likeOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Dispatch Redux action
    if (newLikedState) {
      dispatch(likeReel_Request({reelId}));
    } else {
      dispatch(unlikeReel_Request({reelId}));
    }

    // Callback for parent component
    if (onLike) {
      onLike(item.id, newLikedState);
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }

    // Show double tap animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(doubleTapOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(doubleTapOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShare = async () => {
    const reelId = item.reel_id || item.id;

    try {
      // Dispatch share action to API
      dispatch(shareReel_Request({reelId}));

      // Native share functionality
      const result = await Share.share({
        message: `Check out this amazing reel by ${item.username}: ${item.caption}`,
        url: item.videoUrl,
        title: 'Share Reel',
      });

      // Callback for parent component
      if (onShare) {
        onShare(item.id);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatNumber = num => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleVideoPress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      handleDoubleTap();
      lastTap.current = null;
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now) {
          // Single tap - toggle play/pause
          setIsPlaying(prev => !prev);
          setShowPlayPauseIcon(true);
          // Hide icon after 1 second
          setTimeout(() => setShowPlayPauseIcon(false), 1000);
          lastTap.current = null;
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: '#000', height: itemHeight || SCREEN_HEIGHT},
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={handleVideoPress}>
        <Video
          source={{uri: item.videoUrl}}
          style={styles.video}
          resizeMode="cover"
          paused={!isPlaying}
          repeat
          muted={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          pointerEvents="none"
          onError={error => {
            console.error('Video error:', error);
          }}
          onLoad={() => {
            // Video loaded successfully
          }}
        />

        {/* Invisible touch overlay to handle taps */}
        <TouchableOpacity
          style={styles.touchOverlay}
          activeOpacity={1}
          onPress={handleVideoPress}>
          <View style={{flex: 1}} />
        </TouchableOpacity>

        {/* Double tap heart animation */}
        <Animated.View
          style={[
            styles.doubleTapHeart,
            {
              opacity: doubleTapOpacity,
              transform: [{scale: doubleTapOpacity}],
            },
          ]}
          pointerEvents="none">
          <Ionicons name="heart" size={80} color="#FF3040" />
        </Animated.View>

        {/* Play/Pause icon overlay */}
        {showPlayPauseIcon && (
          <View style={styles.playPauseIcon} pointerEvents="none">
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color="#FFFFFF"
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Right side action buttons */}
      <View style={styles.rightActions}>
        {/* User Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => {
            if (userRole === 'merchant') {
              // For merchant, navigate to Profile tab
              navigation.navigate('MerchantBottomTab', {
                navigateToTab: 'Profile',
                userId: item.merchant_id || item.userId || item.id,
              });
            } else {
              // For user, navigate to PerticularReelProfile screen
              navigation.navigate('PerticularReelProfile', {
                userId: item.merchant_id || item.userId || item.id,
                merchantId: item.merchant_id || item.userId || item.id,
              });
            }
          }}
          activeOpacity={0.7}>
          <Image
            key={merchantProfileImage} // 🔥 forces correct image render
            source={
              merchantProfileImage
                ? {uri: merchantProfileImage}
                : require('../../../assest/images/AppLogo.png') // local fallback
            }
            style={styles.avatar}
          />

          <View style={styles.followButton}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          activeOpacity={0.7}>
          <Animated.View
            style={[
              styles.actionIconContainer,
              {
                transform: [{scale: likeScale}],
              },
            ]}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={moderateScale(32)}
              color={isLiked ? '#FF3040' : '#FFFFFF'}
            />
            <Animated.View
              style={[styles.likeAnimation, {opacity: likeOpacity}]}
              pointerEvents="none">
              <Ionicons name="heart" size={moderateScale(40)} color="#FF3040" />
            </Animated.View>
          </Animated.View>
          <Text style={styles.actionCount}>{formatNumber(likes)}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}>
          <Ionicons
            name="paper-plane-outline"
            size={moderateScale(32)}
            color="#FFFFFF"
          />
          <Text style={styles.actionCount}>{formatNumber(item.shares)}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom info section */}
      <View style={styles.bottomInfo}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <Text style={styles.caption} numberOfLines={2}>
          {item.caption}
        </Text>
        {item?.product_id && (
          <Animated.View
            style={{
              transform: [{scale: buyPulse}],
              marginTop: verticalScale(10),
              alignSelf: 'flex-start',
            }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                Linking.openURL(
                  `https://aoinstore.com/product/${item.product_id}`,
                )
              }
              style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.musicInfo}>
          <Ionicons name="musical-notes" size={16} color="#FFFFFF" />
          <Text style={styles.musicText}>Original Audio</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  doubleTapHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    zIndex: 10,
  },
  playPauseIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  rightActions: {
    position: 'absolute',
    right: scale(12),
    bottom: verticalScale(100),
    alignItems: 'center',
    gap: verticalScale(24),
  },
  avatarContainer: {
    marginBottom: verticalScale(8),
    position: 'relative',
  },
  avatar: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  followButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  actionButton: {
    alignItems: 'center',
    gap: verticalScale(4),
  },
  actionIconContainer: {
    position: 'relative',
  },
  likeAnimation: {
    position: 'absolute',
    top: -4,
    left: -4,
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: verticalScale(20),
    left: scale(12),
    right: scale(80),
    gap: verticalScale(8),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  username: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  caption: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: verticalScale(4),
  },
  musicText: {
    color: '#FFFFFF',
    fontSize: moderateScale(13),
    fontWeight: '500',
  },

  buyButton: {
    backgroundColor: '#F2631F',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(22),
    borderRadius: scale(24),
    shadowColor: '#F2631F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  buyButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});

export default VideoReelItem;
