import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const GoogleButton = ({onPress, style, textStyle, disabled = false}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.buttonDisabled, style]}>
      <FontAwesome name="google" size={moderateScale(18)} color="#4285F4" />
      <Text style={[styles.label, disabled && styles.labelDisabled, textStyle]}>
        Continue with Google
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    borderWidth: moderateScale(0.01),
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: verticalScale(1)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(1),
    elevation: 1,
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#374151',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  labelDisabled: {
    opacity: 0.6,
  },
});

export default GoogleButton;
