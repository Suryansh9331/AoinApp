import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import VideoReelItem from './VideoReelItem';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 56; 

const VideoReel = ({ data = [], initialReelId = null }) => {
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [reelsData, setReelsData] = useState(data);
  const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT - HEADER_HEIGHT);
  const hasScrolledToInitialReel = useRef(false);

  useEffect(() => {
    setReelsData(data);
  }, [data]);

  // Scroll to specific reel when initialReelId is provided
  useEffect(() => {
    if (initialReelId && reelsData.length > 0 && containerHeight > 0 && !hasScrolledToInitialReel.current) {
      const reelIndex = reelsData.findIndex(reel => 
        reel.id === initialReelId || 
        reel.id?.toString() === initialReelId?.toString() ||
        reel.reel_id?.toString() === initialReelId?.toString()
      );
      
      if (reelIndex !== -1 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: reelIndex,
            animated: true,
            viewPosition: 0.5,
          });
          setCurrentIndex(reelIndex);
          hasScrolledToInitialReel.current = true;
        }, 300); // Small delay to ensure layout is ready
      }
    }
  }, [initialReelId, reelsData, containerHeight]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
    
      const fullyVisibleItem = viewableItems.find(
        item => item.isViewable && item.index !== null
      );
      if (fullyVisibleItem) {
        setCurrentIndex(fullyVisibleItem.index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 100,
  }).current;

  // These handlers are kept for backward compatibility
  // But VideoReelItem now uses Redux actions directly
  const handleLike = (id, isLiked) => {
    // Redux actions are handled in VideoReelItem
    // This is just for any parent component callbacks
    // Local state will be updated via data prop from Redux
  };

  const handleShare = (id) => {
    // Redux actions are handled in VideoReelItem
    // This is just for any parent component callbacks
    // Local state will be updated via data prop from Redux
  };

  const renderItem = ({ item, index }) => {
    return (
      <VideoReelItem
        item={item}
        isActive={index === currentIndex}
        onLike={handleLike}
        onShare={handleShare}
        itemHeight={containerHeight}
      />
    );
  };

  const getItemLayout = containerHeight > 0 ? (data, index) => ({
    length: containerHeight,
    offset: containerHeight * index,
    index,
  }) : undefined;

  const onLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== containerHeight) {
      setContainerHeight(height);
    }
  };

  const onMomentumScrollEnd = (event) => {
    if (containerHeight > 0) {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / containerHeight);
      if (index >= 0 && index < reelsData.length && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  };

  if (reelsData.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#F2631F" />
      </View>
    );
  }

  return (
    <View 
      style={[styles.container, { backgroundColor: '#000' }]}
      onLayout={onLayout}
    >
      <FlatList
        ref={flatListRef}
        data={reelsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={containerHeight > 0 ? containerHeight : undefined}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        removeClippedSubviews={false}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
        scrollEventThrottle={16}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={(info) => {
          // Handle scroll to index failure
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ 
              index: info.index, 
              animated: true,
              viewPosition: 0.5 
            });
          });
        }}
      />
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
});

export default VideoReel;

