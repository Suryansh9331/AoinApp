import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
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
  const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT - HEADER_HEIGHT);
  const hasScrolledToInitialReel = useRef(false);
  const lastInitialReelId = useRef(null);
  const previousDataIdsRef = useRef([]);
  const isDataStructureChanged = useRef(false);

  // Get current IDs for comparison
  const currentIds = data.map(r => (r.id || r.reel_id)?.toString()).filter(Boolean);
  const currentIdsString = currentIds.join(',');
  const previousIdsStringRef = useRef('');
  
  // Check if structure changed (new items added/removed)
  const structureChanged = currentIdsString !== previousIdsStringRef.current;
  if (structureChanged) {
    previousIdsStringRef.current = currentIdsString;
    isDataStructureChanged.current = true;
  } else {
    isDataStructureChanged.current = false;
  }
  
  // Memoize reels data - always return latest data, but track structure changes
  const reelsData = useMemo(() => {
    return data;
  }, [data.length, currentIdsString]);

  // Reset scroll flag when initialReelId changes
  useEffect(() => {
    if (initialReelId !== lastInitialReelId.current) {
      hasScrolledToInitialReel.current = false;
      lastInitialReelId.current = initialReelId;
    }
  }, [initialReelId]);

  // Scroll to specific reel when initialReelId is provided
  useEffect(() => {
    if (initialReelId && reelsData.length > 0 && containerHeight > 0 && !hasScrolledToInitialReel.current) {
      const reelIndex = reelsData.findIndex(reel => {
        // Check all possible ID fields and handle both string and number comparisons
        const reelId = reel.id || reel.reel_id;
        return (
          reelId === initialReelId ||
          reelId?.toString() === initialReelId?.toString()
        );
      });

      if (reelIndex !== -1) {
        // Reset the scroll flag to ensure we can scroll again if needed
        hasScrolledToInitialReel.current = false;
        
        // Small delay to ensure the list is ready
        const scrollToReel = () => {
          if (!flatListRef.current) return;
          
          try {
            // First try scrollToIndex
            flatListRef.current.scrollToIndex({
              index: reelIndex,
              animated: false,
              viewPosition: 0.5,
            });
            setCurrentIndex(reelIndex);
            hasScrolledToInitialReel.current = true;
          } catch (error) {
            // If that fails, try scrollToOffset
            try {
              const offset = reelIndex * containerHeight;
              flatListRef.current.scrollToOffset({
                offset,
                animated: false,
              });
              setCurrentIndex(reelIndex);
              hasScrolledToInitialReel.current = true;
            } catch (e) {
              // If both methods fail, try again after a short delay
              if (!hasScrolledToInitialReel.current) {
                setTimeout(scrollToReel, 100);
              }
            }
          }
        };

        // Initial attempt
        scrollToReel();
      }
    }
  }, [initialReelId, reelsData, containerHeight]);

  // Preserve current index when data structure hasn't changed (only like state updated)
  useEffect(() => {
    // Only reset if data structure actually changed (new items added/removed)
    // Don't reset if only like state changed
    if (isDataStructureChanged.current && reelsData.length > 0) {
      // If structure changed and we have data, maintain current index if possible
      if (currentIndex >= reelsData.length) {
        setCurrentIndex(reelsData.length - 1);
      }
      isDataStructureChanged.current = false;
    }
  }, [reelsData, currentIndex]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const fullyVisibleItem = viewableItems.find(
        item => item.isViewable && item.index !== null
      );
      if (fullyVisibleItem && fullyVisibleItem.index !== currentIndex) {
        setCurrentIndex(fullyVisibleItem.index);
      }
    }
  }, [currentIndex]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 100,
  }).current;

  // These handlers are kept for backward compatibility
  // But VideoReelItem now uses Redux actions directly
  const handleLike = useCallback((id, isLiked) => {
    // Redux actions are handled in VideoReelItem
    // This is just for any parent component callbacks
    // Local state will be updated via data prop from Redux
  }, []);

  const handleShare = useCallback((id) => {
    // Redux actions are handled in VideoReelItem
    // This is just for any parent component callbacks
    // Local state will be updated via data prop from Redux
  }, []);

  const renderItem = useCallback(({ item, index }) => {
    return (
      <VideoReelItem
        item={item}
        isActive={index === currentIndex}
        onLike={handleLike}
        onShare={handleShare}
        itemHeight={containerHeight}
      />
    );
  }, [currentIndex, containerHeight, handleLike, handleShare]);

  const getItemLayout = useCallback((data, index) => ({
    length: containerHeight,
    offset: containerHeight * index,
    index,
  }), [containerHeight]);

  const keyExtractor = useCallback((item) => {
    return (item.id || item.reel_id)?.toString() || `reel-${item.index}`;
  }, []);

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
      <View style={[styles.loadingContainer, { backgroundColor: '#000000' }]}>
        <ActivityIndicator size="large" color="#F2631F" />
        <Text style={styles.loadingText}>Loading reels...</Text>
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
        keyExtractor={keyExtractor}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={containerHeight > 0 ? containerHeight : undefined}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={containerHeight > 0 ? getItemLayout : undefined}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
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
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
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
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
});

export default VideoReel;




