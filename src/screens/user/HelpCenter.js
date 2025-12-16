import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import Header from '../../components/Header/Header';

const HelpCenter = () => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const navigation = useNavigation();

  const handleContact = (type, url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        Alert.alert('Error', 'Could not open the link');
        console.error('Error opening URL:', err);
      });
    } else {
      Alert.alert('Info', `${type} contact information coming soon`);
    }
  };

  const helpOptions = [
    {
      id: '1',
      title: '24/7 Support',
      icon: 'headset',
      iconType: 'Ionicons',
      color: '#000000',
      onPress: () => handleContact('24/7 Support'),
    },
    {
      id: '2',
      title: 'Whatsapp',
      icon: 'whatsapp',
      iconType: 'FontAwesome',
      color: '#25D366',
      onPress: () => handleContact('WhatsApp', 'https://wa.me/1234567890'),
    },
    {
      id: '3',
      title: 'Website',
      icon: 'globe-outline',
      iconType: 'Ionicons',
      color: Colors.PRIMARY,
      onPress: () => handleContact('Website', 'https://www.example.com'),
    },
    {
      id: '4',
      title: 'Facebook',
      icon: 'facebook',
      iconType: 'FontAwesome',
      color: '#1877F2',
      onPress: () => handleContact('Facebook', 'https://www.facebook.com'),
    },
    {
      id: '5',
      title: 'Twitter',
      icon: 'twitter',
      iconType: 'FontAwesome',
      color: '#1DA1F2',
      onPress: () => handleContact('Twitter', 'https://www.twitter.com'),
    },
    {
      id: '6',
      title: 'Instagram',
      icon: 'instagram',
      iconType: 'FontAwesome',
      color: '#E4405F',
      onPress: () => handleContact('Instagram', 'https://www.instagram.com'),
    },
    {
      id: '7',
      title: 'Email',
      icon: 'mail-outline',
      iconType: 'Ionicons',
      color: Colors.PRIMARY,
      onPress: () => {
        Linking.openURL('mailto:support@example.com').catch(err => {
          Alert.alert('Error', 'Could not open email client');
          console.error('Error opening email:', err);
        });
      },
    },
  ];

  const renderIcon = (item) => {
    const iconSize = moderateScale(24);
    if (item.iconType === 'FontAwesome') {
      return (
        <FontAwesome name={item.icon} size={iconSize} color={item.color} />
      );
    } else {
      return (
        <Ionicons name={item.icon} size={iconSize} color={item.color} />
      );
    }
  };

  return (
    <View style={[styles.container, {backgroundColor}]}>
      {/* Header */}
       <Header
       title="Help Center"
       
       onLeftPress={() => navigation.goBack()}
      />

      {/* Help Options List */}
      <View style={styles.optionsContainer}>
        {helpOptions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.optionCard, {backgroundColor: backgroundColor}]}
            onPress={item.onPress}
            activeOpacity={0.7}>
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                {renderIcon(item)}
              </View>
              <Text style={[styles.optionText, {color: textColor}]}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginLeft: scale(8),
  },
  optionsContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    gap: verticalScale(12),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: scale(16),
  },
  optionText: {
    fontSize: moderateScale(16),
    fontWeight: '400',
  },
});

export default HelpCenter;

