import React, { Fragment } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';

const MyProfileSkeleton = () => {
  const theme = useAppTheme();
  const { backgroundColor } = getThemeColors(theme);

  return (
    <Fragment>
      {/* Form Fields Skeleton */}
      <View style={styles.formContainer}>
        {/* Full Name Skeleton */}
        <View style={styles.fieldSkeleton}>
          <View style={[styles.skeletonItem, styles.labelSkeleton]} />
          <View style={[styles.skeletonItem, styles.inputSkeleton]} />
        </View>

        {/* Email Skeleton */}
        <View style={styles.fieldSkeleton}>
          <View style={styles.labelContainer}>
            <View style={[styles.skeletonItem, styles.labelSkeleton]} />
            <View style={[styles.skeletonItem, styles.verifiedSkeleton]} />
          </View>
          <View style={[styles.skeletonItem, styles.inputSkeleton]} />
        </View>

        {/* Date of Birth Skeleton */}
        <View style={styles.fieldSkeleton}>
          <View style={[styles.skeletonItem, styles.labelSkeleton]} />
          <View style={[styles.skeletonItem, styles.inputSkeleton]} />
        </View>

        {/* Gender Skeleton */}
        <View style={styles.fieldSkeleton}>
          <View style={[styles.skeletonItem, styles.labelSkeleton]} />
          <View style={[styles.skeletonItem, styles.inputSkeleton]} />
        </View>

        {/* Phone Number Skeleton */}
        <View style={styles.fieldSkeleton}>
          <View style={styles.labelContainer}>
            <View style={[styles.skeletonItem, styles.labelSkeleton]} />
            <View style={[styles.skeletonItem, styles.verifiedSkeleton]} />
          </View>
          <View style={styles.phoneContainer}>
            <View style={[styles.skeletonItem, styles.countryCodeSkeleton]} />
            <View style={[styles.skeletonItem, styles.phoneInputSkeleton]} />
          </View>
        </View>
      </View>

     
     
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
  },
  headerTitle: {
    width: scale(150),
    height: verticalScale(24),
    borderRadius: moderateScale(4),
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(32), // Increased top padding since header is removed
    paddingBottom: verticalScale(100),
  },
  fieldSkeleton: {
    marginBottom: verticalScale(20),
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  labelSkeleton: {
    width: scale(100),
    height: verticalScale(16),
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(8),
  },
  verifiedSkeleton: {
    width: scale(60),
    height: verticalScale(16),
    borderRadius: moderateScale(4),
  },
  inputSkeleton: {
    width: '100%',
    height: verticalScale(50),
    borderRadius: moderateScale(12),
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: scale(8),
  },
  countryCodeSkeleton: {
    width: scale(80),
    height: verticalScale(50),
    borderRadius: moderateScale(12),
  },
  phoneInputSkeleton: {
    flex: 1,
    height: verticalScale(50),
    borderRadius: moderateScale(12),
  },
  buttonContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(20),
    paddingTop: verticalScale(10),
  },
  buttonSkeleton: {
    width: '100%',
    height: verticalScale(50),
    borderRadius: moderateScale(8),
  },
  skeletonItem: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
  },
});

export default MyProfileSkeleton;
