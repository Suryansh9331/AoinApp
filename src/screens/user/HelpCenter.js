import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import Header from '../../components/Header/Header';
import {SafeAreaView} from 'react-native-safe-area-context';

const HelpCenter = () => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const navigation = useNavigation();

  const openLink = (url, errorMsg) => {
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', errorMsg || 'Unable to open link'),
    );
  };

  const helpOptions = [
    {
      id: '1',
      title: 'Website',
      subtitle: 'aoinstore.com',
      icon: 'globe-outline',
      iconType: 'Ionicons',
      color: Colors.PRIMARY,
      onPress: () => openLink('https://aoinstore.com'),
    },
    {
      id: '2',
      title: 'WhatsApp Channel',
      subtitle: 'Official updates & support',
      icon: 'whatsapp',
      iconType: 'FontAwesome',
      color: '#25D366',
      onPress: () =>
        openLink('https://whatsapp.com/channel/0029VbBuaRe60eBnTyPFVz3l'),
    },
    {
      id: '3',
      title: 'Call Us',
      subtitle: '+91 98933 61162',
      icon: 'call-outline',
      iconType: 'Ionicons',
      color: Colors.PRIMARY,
      onPress: () => openLink('tel:9893361162'),
    },
    {
      id: '4',
      title: 'Email Support',
      subtitle: 'infoaoinstore@gmail.com',
      icon: 'mail-outline',
      iconType: 'Ionicons',
      color: Colors.PRIMARY,
      onPress: () => openLink('mailto:infoaoinstore@gmail.com'),
    },
    {
      id: '5',
      title: 'Instagram',
      subtitle: '@aoinstore',
      icon: 'instagram',
      iconType: 'FontAwesome',
      color: '#E4405F',
      onPress: () => openLink('https://www.instagram.com/aoinstore/'),
    },
    {
      id: '6',
      title: 'Facebook',
      subtitle: 'Aoin Store',
      icon: 'facebook',
      iconType: 'FontAwesome',
      color: '#1877F2',
      onPress: () =>
        openLink('https://www.facebook.com/share/1Ah7oXkEEq/'),
    },
    {
      id: '7',
      title: 'LinkedIn',
      subtitle: 'Company profile',
      icon: 'linkedin',
      iconType: 'FontAwesome',
      color: '#0A66C2',
      onPress: () =>
        openLink('https://www.linkedin.com/company/aoinstore/'),
    },
    {
      id: '8',
      title: 'Twitter / X',
      subtitle: '@aoinstore',
      icon: 'twitter',
      iconType: 'FontAwesome',
      color: '#1DA1F2',
      onPress: () => openLink('https://x.com/aoinstore'),
    },
    {
      id: '9',
      title: 'YouTube',
      subtitle: '@Aoinstore',
      icon: 'logo-youtube',
      iconType: 'Ionicons',
      color: '#FF0000',
      onPress: () => openLink('https://www.youtube.com/@Aoinstore'),
    },
  ];

  const renderIcon = item => {
    const size = moderateScale(24);
    return item.iconType === 'FontAwesome' ? (
      <FontAwesome name={item.icon} size={size} color={item.color} />
    ) : (
      <Ionicons name={item.icon} size={size} color={item.color} />
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor}]}>
      <Header title="Help Center" onLeftPress={() => navigation.goBack()} />

      {/* 🔥 ONLY REAL FIX */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: verticalScale(24)}}>

        <View style={styles.optionsContainer}>
          {helpOptions.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionCard,
                {backgroundColor, borderColor},
              ]}
              activeOpacity={0.7}
              onPress={item.onPress}>
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  {renderIcon(item)}
                </View>
                <View>
                  <Text style={[styles.optionText, {color: textColor}]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      {color: textColor, opacity: 0.6},
                    ]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: textColor, opacity: 0.6}]}>
            © 2024 Aoin. All rights reserved.
          </Text>
          <TouchableOpacity
            onPress={() => openLink('https://suryansh9331.github.io/aoin_privacy_policy/')}>
            <Text style={[styles.privacyText, {color: Colors.PRIMARY}]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  optionsContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    gap: verticalScale(12),
  },
  optionCard: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: scale(16),
  },
  optionText: {
    fontSize: moderateScale(16),
    fontWeight: '400',
  },
  subtitle: {
    fontSize: moderateScale(12),
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
  footerText: {
    fontSize: moderateScale(12),
  },
  privacyText: {
    fontSize: moderateScale(12),
    marginTop: 4,
    fontWeight: '500',
  },
});

export default HelpCenter;
