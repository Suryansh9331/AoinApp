
import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Colors } from '../../utils/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale } from 'react-native-size-matters';
import { useSelector, useDispatch } from 'react-redux';
import { setThemeMode } from '../../redux/slices/themeSlice';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';


const Header = memo(({
  title,
  subtitle,
  align = 'center',
  leftType = 'back',
  rightType = 'none',
  onLeftPress,
  onRightPress,
  leftContent,
  rightContent,
  containerStyle,
  titleStyle,
  subtitleStyle,
  height = 56,
  showShadow = false,
  bg = '',
  projectTitle,
  projectTitleStyle,
  showThemeToggle = false,
}) => {
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const { iconColor, textColor: themeTextColor, backgroundColor: themeBackgroundColor } = getThemeColors(theme);
  const themeMode = useSelector(state => state.theme?.themeMode || 'light');

  const handleThemeToggle = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    dispatch(setThemeMode(newTheme));
  };

 
  const headerBg = bg || themeBackgroundColor;
  const isPrimaryBg = headerBg === Colors.PRIMARY;
  const renderLeft = () => {
    if (leftContent) return leftContent;

   
    if (projectTitle) {
      return (
        <View style={styles.projectTitleContainer}>
          <Text 
            numberOfLines={1} 
            style={[
              styles.projectTitle, 
              { color: isPrimaryBg ? '#FFFFFF' : themeTextColor },
              projectTitleStyle
            ]}>
            {projectTitle}
          </Text>
        </View>
      );
    }

    if (leftType === 'none') return <View style={styles.sidePad} />;

    const label = leftType === 'back' || leftType === 'arrow-left' ? '‹' : '';
    if (!label) return <View style={styles.sidePad} />;
    return (
      <Pressable
        onPress={onLeftPress}
        hitSlop={12}
        android_ripple={{ color: '#00000012', borderless: true }}
        style={styles.sideBtn}
      >
        <Text style={[
          styles.arrow, 
          { color: isPrimaryBg ? '#FFFFFF' : themeTextColor }
        ]}>{label}</Text>
      </Pressable>
    );
  };

  const renderRight = () => {
    if (rightContent) return rightContent;

    if (showThemeToggle) {
      return (
        <TouchableOpacity
          onPress={handleThemeToggle}
          activeOpacity={0.7}
          style={[
            styles.themeToggleBtn,
            {
              backgroundColor: isPrimaryBg 
                ? 'rgba(255, 255, 255, 0.2)' 
                : (themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
            }
          ]}>
          <Ionicons
            name={themeMode === 'dark' ? 'sunny' : 'moon'}
            size={moderateScale(20)}
            color={isPrimaryBg ? '#FFFFFF' : iconColor}
          />
        </TouchableOpacity>
      );
    }

    if (rightType === 'none') return <View style={styles.sidePad} />;

    const label = rightType === 'arrow-right' ? '›' : '≡'; // simple "menu"
    return (
      <Pressable
        onPress={onRightPress}
        hitSlop={12}
        android_ripple={{ color: '#00000012', borderless: true }}
        style={styles.sideBtn}
      >
        <Text style={[
          styles.arrow, 
          { color: isPrimaryBg ? '#FFFFFF' : themeTextColor }
        ]}>{label}</Text>
      </Pressable>
    );
  };

  const headerTextColor = isPrimaryBg ? '#FFFFFF' : themeTextColor;

  return (
    <View style={[
      styles.wrapper,
      { 
        height: height + (Platform.OS === 'ios' ? 4 : 0), 
        backgroundColor: headerBg 
      },
      showShadow && [
        styles.shadow,
        { shadowColor: themeMode === 'dark' ? '#000000' : '#000000' }
      ],
      containerStyle
    ]}>
      {renderLeft()}

      <View style={[styles.center, 
        align === 'left' && { alignItems: 'flex-start' },
        align === 'right' && { alignItems: 'flex-end' }
      ]}>
        {!!title && (
          <Text numberOfLines={1} style={[styles.title, { color: headerTextColor }, titleStyle]}>
            {title}
          </Text>
        )}
        {!!subtitle && (
          <Text numberOfLines={1} style={[styles.subtitle, { color: headerTextColor }, subtitleStyle]}>
            {subtitle}
          </Text>
        )}
      </View>

      {renderRight()}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidePad: {
    width: 44,
    height: 44,
  },
  arrow: {
    fontSize: 28,
    lineHeight: 28,
    includeFontPadding: false,
  },
  projectTitleContainer: {
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    opacity: 0.7,
  },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
