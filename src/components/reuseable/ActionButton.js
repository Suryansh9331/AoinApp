import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  View,
} from 'react-native';
import { verticalScale, moderateScale, scale } from 'react-native-size-matters';
import { Colors } from '../../utils/Colors';

const ActionButton = ({
  title = 'Click Me',
  onPress = () => {},
  bgColor = Colors.PRIMARY,
  color = '#fff',
  fontSize = moderateScale(15),
  height = verticalScale(46),
  width = '100%',
  borderRadius = moderateScale(12),
  fontWeight = '700',
  loading = false,
  disabled = false,
  shadow = true,
  uppercase = false,
  borderColor = null,
  borderWidth = 0,
  leftIcon = null,
  rightIcon = null,
  style,
  textStyle,
  indicatorColor,
}) => {
  const [pressed, setPressed] = useState(false);

  const backgroundColor = disabled
    ? '#dcdcdc'
    : pressed
    ? shadeColor(bgColor, -8)
    : bgColor;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled || loading}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      style={[
        styles.button,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          borderColor: borderColor || bgColor,
          borderWidth,
          opacity: disabled ? 0.6 : 1,
          ...(shadow
            ? Platform.select({
                ios: styles.shadowIOS,
                android: styles.shadowAndroid,
              })
            : {}),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor || color} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.iconWrapper}>{leftIcon}</View> : null}
          <Text
            style={[
              styles.text,
              {
                color,
                fontSize,
                fontWeight,
                textTransform: uppercase ? 'uppercase' : 'none',
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.iconWrapper}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const shadeColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  text: {
    letterSpacing: scale(0.5),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowIOS: {
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(6),
    shadowOffset: { width: 0, height: moderateScale(4) },
  },
  shadowAndroid: {
    elevation: moderateScale(5),
  },
});

export default ActionButton;
