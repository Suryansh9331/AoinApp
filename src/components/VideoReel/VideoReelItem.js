import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Colors } from '../../utils/Colors';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import {
  likeReel_Request,
  unlikeReel_Request,
  shareReel_Request,
} from '../../redux/slices/reelSlice';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoReelItem = ({ item, isActive, onLike, onShare, itemHeight }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userData = useSelector(state => state.auth.data);
  const userRole = userData?.data?.role || userData?.role || 'user';
  const theme = useAppTheme();
  const { backgroundColor, textColor } = getThemeColors(theme);
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likes, setLikes] = useState(item.likes);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const likeScale = useRef(new Animated.Value(1)).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const doubleTapOpacity = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isActive, isPaused]);

  // Sync local state with item props (from Redux)
  useEffect(() => {
    setIsLiked(item.isLiked || false);
    setLikes(item.likes || 0);
  }, [item.isLiked, item.likes]);

  const handleLike = () => {
    const newLikedState = !isLiked;
    const reelId = item.reel_id || item.id;
    
    // Optimistically update UI
    setIsLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);
    
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
      dispatch(likeReel_Request({ reelId }));
    } else {
      dispatch(unlikeReel_Request({ reelId }));
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
      dispatch(shareReel_Request({ reelId }));

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

  const formatNumber = (num) => {
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

    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      handleDoubleTap();
      lastTap.current = null;
    } else {
      // Single tap - pause/play
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now) {
          setIsPaused(!isPaused);
          lastTap.current = null;
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000', height: itemHeight || SCREEN_HEIGHT }]}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={handleVideoPress}
      >
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.video}
          resizeMode="cover"
          paused={!isPlaying}
          repeat
          muted={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          onError={(error) => {
            console.error('Video error:', error);
          }}
          onLoad={() => {
            // Video loaded successfully
          }}
        />

        {/* Double tap heart animation */}
        <Animated.View
          style={[
            styles.doubleTapHeart,
            {
              opacity: doubleTapOpacity,
              transform: [{ scale: doubleTapOpacity }],
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="heart" size={80} color="#FF3040" />
        </Animated.View>

        {/* Pause overlay with play button */}
        {isPaused && (
          <TouchableOpacity
            style={styles.pauseOverlay}
            onPress={() => setIsPaused(false)}
            activeOpacity={1}
          >
            <View style={styles.pauseIconContainer}>
              <Ionicons name="play" size={moderateScale(32)} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

      </TouchableOpacity>

      {/* Right side action buttons */}
      <View style={styles.rightActions}>
        {/* User Avatar */}
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={() => {
            const bottomTabName = userRole === 'merchant' ? 'MerchantBottomTab' : 'UserBottomTab';
            navigation.navigate(bottomTabName, { 
              navigateToTab: 'Profile',
              userId: item.userId || item.id 
            });
          }}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item.userAvatar }}
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
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.actionIconContainer,
              {
                transform: [{ scale: likeScale }],
              },
            ]}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={moderateScale(32)}
              color={isLiked ? '#FF3040' : '#FFFFFF'}
            />
            <Animated.View
              style={[
                styles.likeAnimation,
                { opacity: likeOpacity },
              ]}
              pointerEvents="none"
            >
              <Ionicons name="heart" size={moderateScale(40)} color="#FF3040" />
            </Animated.View>
          </Animated.View>
          <Text style={styles.actionCount}>{formatNumber(likes)}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
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
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleTapHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    zIndex: 10,
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
});

export default VideoReelItem;

