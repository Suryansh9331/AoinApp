import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {useSelector} from 'react-redux';
import Input from '../../components/reuseable/Input';
import ActionButton from '../../components/reuseable/ActionButton';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import FONTS from '../../utils/Font';
import DateTimePicker from '@react-native-community/datetimepicker';

const MyProfile = () => {
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const navigation = useNavigation();
  const userData = useSelector(state => state.auth.data);

  const [fullName, setFullName] = useState(
    userData?.first_name && userData?.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : 'Cody Fisher',
  );
  const [email, setEmail] = useState(
    userData?.email || 'cody.fisher45@example',
  );
  const [dateOfBirth, setDateOfBirth] = useState(new Date('1990-07-12'));
  const [gender, setGender] = useState('Male');
  const [phoneNumber, setPhoneNumber] = useState('99 453 231 50');
  const [countryCode, setCountryCode] = useState('+91');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const formatDate = date => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleSave = () => {
    // TODO: Implement save profile API call
    console.log('Saving profile:', {
      fullName,
      email,
      dateOfBirth: formatDate(dateOfBirth),
      gender,
      phoneNumber: `${countryCode} ${phoneNumber}`,
    });
    // Show success message or navigate back
    navigation.goBack();
  };

  const genders = ['Male', 'Female', 'Other'];

  return (
    <View style={[styles.container, {backgroundColor}]}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, {color: textColor}]}>
            My Profile
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Full Name */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: textColor}]}>Full Name</Text>
          <Input
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        {/* Email Address */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: textColor}]}>
            Email Address
          </Text>
          <Input
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Date of Birth */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: textColor}]}>Date of Birth</Text>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              {borderColor: borderColor, backgroundColor: backgroundColor},
            ]}
            onPress={() => setShowDatePicker(true)}>
            <Text style={[styles.dateText, {color: textColor}]}>
              {formatDate(dateOfBirth)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Gender */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: textColor}]}>Gender</Text>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              {borderColor: borderColor, backgroundColor: backgroundColor},
            ]}
            onPress={() => setShowGenderPicker(true)}>
            <Text style={[styles.dropdownText, {color: textColor}]}>
              {gender}
            </Text>
            <Ionicons name="chevron-down" size={20} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Phone Number */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, {color: textColor}]}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            <TouchableOpacity
              style={[
                styles.countryCodeButton,
                {borderColor: borderColor, backgroundColor: backgroundColor},
              ]}>
              <Text style={styles.flagEmoji}>🇮🇳</Text>
              <Ionicons name="chevron-down" size={16} color={textColor} />
              <Text style={[styles.countryCode, {color: textColor}]}>
                {countryCode}
              </Text>
            </TouchableOpacity>
            <View style={styles.phoneInputContainer}>
              <Input
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.phoneInput}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <ActionButton
          title="Saved"
          onPress={handleSave}
          bgColor={Colors.PRIMARY}
          color={Colors.WHITE}
          fontSize={moderateScale(16)}
          fontWeight="700"
          fontFamily={FONTS.WINDSONG.REGULAR}
          style={styles.saveButton}
        />
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderPicker(false)}>
          <View style={[styles.modalContent, {backgroundColor}]}>
            {genders.map(item => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.genderOption,
                  {borderBottomColor: borderColor},
                  gender === item && {
                    backgroundColor: `${Colors.PRIMARY}20`,
                  },
                ]}
                onPress={() => {
                  setGender(item);
                  setShowGenderPicker(false);
                }}>
                <Text style={[styles.genderText, {color: textColor}]}>
                  {item}
                </Text>
                {gender === item && (
                  <Ionicons name="checkmark" size={20} color={Colors.PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(100),
  },
  fieldContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  dateText: {
    fontSize: moderateScale(16),
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: moderateScale(16),
    flex: 1,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: scale(8),
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    gap: scale(6),
  },
  flagEmoji: {
    fontSize: moderateScale(20),
  },
  countryCode: {
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  phoneInputContainer: {
    flex: 1,
  },
  phoneInput: {
    marginTop: 0,
  },
  buttonContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(20),
    paddingTop: verticalScale(10),
  },
  saveButton: {
    height: verticalScale(50),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
    maxHeight: '50%',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  genderText: {
    fontSize: moderateScale(16),
  },
});

export default MyProfile;

