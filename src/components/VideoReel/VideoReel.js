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

const VideoReel = ({ data = [], initialReelId = null, onEndReached, hasMore, isLoading }) => {
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT - HEADER_HEIGHT);
  const hasScrolledToInitialReel = useRef(false);
  const lastInitialReelId = useRef(null);
  const previousDataIdsRef = useRef([]);
  const isDataStructureChanged = useRef(false);

  // Performance optimization: Track visible items for video management
  const visibleItemsRef = useRef(new Set());
  const lastVisibleIndex = useRef(-1);

  // Initialize first reel as visible and active when component mounts
  useEffect(() => {
    if (reelsData && reelsData.length > 0 && containerHeight > 0) {
      // Mark the first item as visible immediately
      visibleItemsRef.current.add(0);
      lastVisibleIndex.current = 0;
    }
  }, [reelsData, containerHeight]);

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
    return data || [];
  }, [data, currentIdsString]);

  // Reset scroll flag when initialReelId changes
  useEffect(() => {
    if (initialReelId !== lastInitialReelId.current) {
      hasScrolledToInitialReel.current = false;
      lastInitialReelId.current = initialReelId;
    }
  }, [initialReelId]);


  useEffect(() => {


    if (initialReelId && reelsData && reelsData.length > 0 && containerHeight > 0 && !hasScrolledToInitialReel.current) {
      const reelIndex = reelsData.findIndex(reel => {
        // Check all possible ID fields and handle both string and number comparisons
        const reelId = reel.id || reel.reel_id;
        const matches = (
          reelId === initialReelId ||
          reelId?.toString() === initialReelId?.toString()
        );

        return matches;
      });


      if (reelIndex !== -1) {
        // Reset the scroll flag to ensure we can scroll again if needed
        hasScrolledToInitialReel.current = false;

        // Small delay to ensure the list is ready
        const scrollToReel = () => {
          if (!flatListRef.current) {

            return;
          }



          try {
            // First try scrollToIndex
            flatListRef.current.scrollToIndex({
              index: reelIndex,
              animated: false,
              viewPosition: 0,
            });
            setCurrentIndex(reelIndex);
            hasScrolledToInitialReel.current = true;

          } catch (error) {
            console.log('scrollToIndex failed, trying scrollToOffset:', error);
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


              if (!hasScrolledToInitialReel.current) {
                setTimeout(scrollToReel, 100);
              }
            }
          }
        };


        scrollToReel();
      } else {

      }
    }
  }, [initialReelId, reelsData, containerHeight]);


  useEffect(() => {

    if (isDataStructureChanged.current && reelsData && reelsData.length > 0) {

      if (currentIndex >= reelsData.length) {
        setCurrentIndex(reelsData.length - 1);
      }
      isDataStructureChanged.current = false;
    }
  }, [reelsData, currentIndex]);

  const onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
    // Update visible items immediately
    const newVisibleItems = new Set();
    viewableItems.forEach(item => {
      if (item.isViewable && item.index !== null) {
        newVisibleItems.add(item.index);
      }
    });
    visibleItemsRef.current = newVisibleItems;

    if (viewableItems.length > 0) {
      const fullyVisibleItem = viewableItems.find(
        item => item.isViewable && item.index !== null
      );

      if (fullyVisibleItem && fullyVisibleItem.index !== currentIndex) {
        setCurrentIndex(fullyVisibleItem.index);

        // Check if we're near the end and should load more
        if (onEndReached && hasMore && !isLoading) {
          const threshold = 2; // Reduced threshold for better performance
          if (fullyVisibleItem.index >= (reelsData?.length || 0) - threshold) {
            onEndReached();
          }
        }
      }
    }
  }, [currentIndex, reelsData?.length, onEndReached, hasMore, isLoading]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 40, // Even lower threshold for earlier loading
    minimumViewTime: 0, // Immediate response for smooth scrolling
  }).current;


  const handleLike = useCallback((id, isLiked) => {

  }, []);

  const handleShare = useCallback((id) => {

  }, []);

  const renderItem = useCallback(({ item, index }) => {
    const isVisible = visibleItemsRef.current.has(index);
    const isActive = index === currentIndex;

    return (
      <VideoReelItem
        item={item}
        isActive={isActive}
        isVisible={isVisible}
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
      if (index >= 0 && index < (reelsData?.length || 0) && index !== currentIndex) {
        setCurrentIndex(index);

        // Check if we're near the end and should load more
        if (onEndReached && hasMore && !isLoading) {
          const threshold = 3; // Load more when 3 items from end
          if (index >= (reelsData?.length || 0) - threshold) {
            onEndReached();
          }
        }
      }
    }
  };

  if (!reelsData || reelsData.length === 0) {
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
        maxToRenderPerBatch={1}
        windowSize={1}
        initialNumToRender={1}
        scrollEventThrottle={16} // Standard throttle for smooth scrolling
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        // Additional optimizations for smooth scrolling
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 1000,
        }}
        // Prevent jumping during scroll
        scrollEnabled={true}
        nestedScrollEnabled={false}
        overScrollMode="never"
        onScrollToIndexFailed={(info) => {
          // Handle scroll to index failure
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0
            });
          });
        }}
      />

      {/* Loading indicator for pagination */}
      {/* {isLoading && hasMore && (
        <View style={styles.paginationLoading}>
          <ActivityIndicator size="small" color="#F2631F" />
          <Text style={styles.paginationLoadingText}>Loading more reels...</Text>
        </View>
      )} */}
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
  paginationLoading: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  paginationLoadingText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default VideoReel;




