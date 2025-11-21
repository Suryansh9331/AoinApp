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

const VideoReel = ({ data = [] }) => {
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [reelsData, setReelsData] = useState(data);
  const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT - HEADER_HEIGHT);

  useEffect(() => {
    setReelsData(data);
  }, [data]);

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

  const handleLike = (id, isLiked) => {
    setReelsData(prevData =>
      prevData.map(item =>
        item.id === id
          ? { ...item, isLiked, likes: isLiked ? item.likes + 1 : item.likes - 1 }
          : item
      )
    );
  };

  const handleShare = (id) => {
    setReelsData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, shares: item.shares + 1 } : item
      )
    );
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

