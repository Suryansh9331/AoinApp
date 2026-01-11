import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import Skeleton from '../../../components/Skeleton/Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POST_ITEM_SIZE = Math.floor(SCREEN_WIDTH / 3);

const ProfileSkeleton = () => {
  return (
    <View style={styles.profileSection}>
      {/* Avatar Skeleton */}
      <View style={styles.avatarContainer}>
        <Skeleton
          width={moderateScale(100)}
          height={moderateScale(100)}
          radius={moderateScale(50)}
        />
      </View>

      {/* Name Skeleton */}
      <Skeleton
        width={moderateScale(150)}
        height={moderateScale(20)}
        radius={4}
        style={styles.skeletonName}
      />
      
      {/* Username Skeleton */}
      <Skeleton
        width={moderateScale(120)}
        height={moderateScale(16)}
        radius={4}
        style={styles.skeletonUsername}
      />

      {/* Stats Skeleton */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Skeleton
            width={moderateScale(30)}
            height={moderateScale(18)}
            radius={4}
          />
          <Skeleton
            width={moderateScale(40)}
            height={moderateScale(12)}
            radius={4}
            style={{ marginTop: verticalScale(4) }}
          />
        </View>
        <View style={styles.statItem}>
          <Skeleton
            width={moderateScale(30)}
            height={moderateScale(18)}
            radius={4}
          />
          <Skeleton
            width={moderateScale(50)}
            height={moderateScale(12)}
            radius={4}
            style={{ marginTop: verticalScale(4) }}
          />
        </View>
        <View style={styles.statItem}>
          <Skeleton
            width={moderateScale(30)}
            height={moderateScale(18)}
            radius={4}
          />
          <Skeleton
            width={moderateScale(40)}
            height={moderateScale(12)}
            radius={4}
            style={{ marginTop: verticalScale(4) }}
          />
        </View>
      </View>

      {/* Action Buttons Skeleton */}
      <View style={styles.actionButtons}>
        <Skeleton
          width="70%"
          height={moderateScale(44)}
          radius={moderateScale(8)}
        />
        <Skeleton
          width={moderateScale(44)}
          height={moderateScale(44)}
          radius={moderateScale(8)}
        />
      </View>

      {/* Bio Skeleton */}
      <View style={styles.skeletonBioContainer}>
        <Skeleton width="90%" height={moderateScale(14)} radius={4} />
        <Skeleton
          width="80%"
          height={moderateScale(14)}
          radius={4}
          style={{ marginTop: verticalScale(6) }}
        />
        <Skeleton
          width="60%"
          height={moderateScale(14)}
          radius={4}
          style={{ marginTop: verticalScale(6) }}
        />
      </View>

      {/* Reels Grid Skeleton */}
      <View style={styles.postsGridContainer}>
        <View style={styles.skeletonReelsRow}>
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <Skeleton
              key={`skeleton-reel-${index}`}
              width={POST_ITEM_SIZE}
              height={POST_ITEM_SIZE}
              radius={0}
              style={styles.skeletonReelItem}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(20),
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  skeletonName: {
    marginBottom: verticalScale(4),
  },
  skeletonUsername: {
    marginBottom: verticalScale(16),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(20),
  },
  statItem: {
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(12),
    width: '100%',
    paddingHorizontal: scale(20),
  },
  skeletonBioContainer: {
    width: '100%',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  postsGridContainer: {
    position: 'relative',
    paddingBottom: verticalScale(100),
  },
  skeletonReelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  skeletonReelItem: {
    marginHorizontal: 0.1,
  },
});

export default ProfileSkeleton;
