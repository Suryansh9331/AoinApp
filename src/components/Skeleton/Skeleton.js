import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Skeleton = ({ width, height, style, radius = 4 }) => {
  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const animation = useRef(null);

  useEffect(() => {
    const startAnimation = () => {
      translateX.setValue(-SCREEN_WIDTH);
      
      animation.current = Animated.loop(
        Animated.timing(translateX, {
          toValue: SCREEN_WIDTH,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      
      animation.current.start();
    };

    startAnimation();
    
    return () => {
      if (animation.current) {
        animation.current.stop();
      }
    };
  }, []);

  return (
    <View 
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: '#E1E9EE',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.animation,
          {
            transform: [{ translateX }],
            width: SCREEN_WIDTH * 0.3,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
    position: 'relative',
  },
  animation: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    transform: [{ skewX: '-20deg' }],
  },
});

export const ProductSkeleton = () => {
  return [1, 2, 3, 4, 5, 6].map((_, index) => (
    <View key={`skeleton-${index}`} style={productStyles.productItem}>
      <Skeleton 
        width={moderateScale(80)}
        height={moderateScale(80)}
        radius={moderateScale(8)}
        style={productStyles.skeletonImage}
      />
      <View style={productStyles.productDetails}>
        <Skeleton 
          width="70%" 
          height={moderateScale(16)} 
          radius={4} 
          style={productStyles.skeletonText}
        />
        <Skeleton 
          width="50%" 
          height={moderateScale(14)} 
          radius={4} 
          style={[productStyles.skeletonText, { marginTop: verticalScale(4) }]} 
        />
      </View>
      <Skeleton 
        width={moderateScale(60)}
        height={moderateScale(20)}
        radius={4}
        style={productStyles.skeletonPrice}
      />
    </View>
  ));
};

const productStyles = StyleSheet.create({
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1E9EE',
  },
  skeletonImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(8),
    marginRight: scale(12),
  },
  productDetails: {
    flex: 1,
    marginRight: scale(12),
  },
  skeletonText: {
    backgroundColor: '#E1E9EE',
  },
  skeletonPrice: {
    backgroundColor: '#E1E9EE',
  },
});

export default Skeleton;
