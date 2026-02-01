import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import Input from '../../components/reuseable/Input';
import ActionButton from '../../components/reuseable/ActionButton';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { Colors } from '../../utils/Colors';
import FONTS from '../../utils/Font';
import Header from '../../components/Header/Header';
import { putData } from '../../utils/APiCall';
import { BASE_URL, ROUTES } from '../../utils/Routes';

const MyProfileEdit = ({ route }) => {
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);
  const navigation = useNavigation();
  const userData = useSelector(state => state.auth.data);

  // Get profile data passed from MyProfile screen
  const profileData = route.params?.profileData || {};

  const [firstName, setFirstName] = useState(profileData.first_name || '');
  const [lastName, setLastName] = useState(profileData.last_name || '');
  const [dateOfBirth, setDateOfBirth] = useState(profileData.date_of_birth || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [gender, setGender] = useState(profileData.gender || 'male');
  const [loading, setLoading] = useState(false);

  // Initialize selected date from existing dateOfBirth
  useEffect(() => {
    if (dateOfBirth) {
      const parts = dateOfBirth.split('-');
      if (parts.length === 3) {
        setSelectedDay(parts[0]);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setSelectedMonth(monthNames[parseInt(parts[1]) - 1]);
        setSelectedYear(parts[2]);
      }
    }
  }, [dateOfBirth]);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    // Generate dates around today (15 days before and after)
    for (let i = -15; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Memoized calendar generation functions
  const generateCalendarDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i.toString());
    }
    return days;
  }, []);

  const generateCalendarMonths = useMemo(() => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }, []);

  const generateCalendarYears = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i.toString());
    }
    return years;
  }, []);

  // Memoized date update function
  const updateDateFromSelection = useCallback(() => {
    // Only update if all three selections are made
    if (selectedDay && selectedMonth && selectedYear) {
      // Convert month name to number
      const monthMap = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const monthNumber = monthMap[selectedMonth];
      
      if (monthNumber) {
        // Create date string in YYYY-MM-DD format
        const dateString = `${selectedYear}-${monthNumber}-${selectedDay.padStart(2, '0')}`;
        const constructedDate = new Date(dateString);
        
        // Check if date is valid
        if (!isNaN(constructedDate.getTime())) {
          const formattedDate = formatDate(constructedDate);
          setDateOfBirth(formattedDate);
        } 
      }
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  // Handle OK button press
  const handleDateConfirm = useCallback(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      setShowDatePicker(false);
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(formatDate(selectedDate));
    }
  };

  // Memoized update handler
  const handleUpdate = useCallback(async () => {
    try {
      setLoading(true);
       
      // Prepare update data
      const updateData = {
        first_name: firstName || '',
        last_name: lastName || '',
        date_of_birth: dateOfBirth || '',
        gender: gender || '',
      };
   
      const response = await putData(`${BASE_URL}${ROUTES.USER_PROFILE}`, updateData);
      
      if (response) {
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.dir('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, dateOfBirth, gender, navigation]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <Header
        title="Edit Profile"
        onLeftPress={() => navigation.goBack()}
      />

      {/* Form Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        
        {/* First Name */}
        <Input
          label="First Name"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="none"
          type="text"
        />

        {/* Last Name */}
        <Input
          label="Last Name"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="none"
          type="text"
        />

        {/* Date of Birth */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: textColor }]}>Date of Birth</Text>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              { borderColor: borderColor, backgroundColor: backgroundColor },
            ]}
            onPress={() => setShowDatePicker(true)}>
            <Text style={[styles.dateText, { color: textColor }]}>
              {dateOfBirth || 'Select Date of Birth'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={textColor} />
          </TouchableOpacity>
          {showDatePicker && (
            <View style={styles.datePickerModal}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              
              {/* Day Selector */}
              <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Day</Text>
                <ScrollView 
                  horizontal={true} 
                  showsHorizontalScrollIndicator={false}
                  style={styles.daySelectorScroll}>
                  {generateCalendarDays.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayPickerOption,
                        selectedDay === day && styles.selectedDayOption
                      ]}
                      onPress={() => {
                        setSelectedDay(day);
                        updateDateFromSelection();
                      }}>
                      <Text style={[
                        styles.dayPickerOptionText,
                        selectedDay === day && styles.selectedDayOptionText
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Selector */}
              <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Month</Text>
                <ScrollView 
                  horizontal={true} 
                  showsHorizontalScrollIndicator={false}
                  style={styles.monthSelectorScroll}>
                  {generateCalendarMonths.map((month, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.monthPickerOption,
                        selectedMonth === month && styles.selectedMonthOption
                      ]}
                      onPress={() => {
                        setSelectedMonth(month);
                        updateDateFromSelection();
                      }}>
                      <Text style={[
                        styles.monthPickerOptionText,
                        selectedMonth === month && styles.selectedMonthOptionText
                      ]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Selector */}
              <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Year</Text>
                <ScrollView 
                  horizontal={true} 
                  showsHorizontalScrollIndicator={false}
                  style={styles.yearSelectorScroll}>
                  {generateCalendarYears.map((year, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.yearPickerOption,
                        selectedYear === year && styles.selectedYearOption
                      ]}
                      onPress={() => {
                        setSelectedYear(year);
                        updateDateFromSelection();
                      }}>
                      <Text style={[
                        styles.yearPickerOptionText,
                        selectedYear === year && styles.selectedYearOptionText
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* OK Button - Only show when all three are selected */}
              {selectedDay && selectedMonth && selectedYear && (
                <TouchableOpacity
                  style={styles.okButton}
                  onPress={handleDateConfirm}>
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Gender */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: textColor }]}>Gender</Text>
          <Input
            placeholder="Select Gender"
            value={gender}
            onChangeText={setGender}
            type="dropdown"
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' }
            ]}
          />
        </View>

       
      </ScrollView>

      {/* Update Button */}
      <View style={styles.buttonContainer}>
        <ActionButton
          title={loading ? 'Updating...' : 'Update Profile'}
          onPress={handleUpdate}
          bgColor={Colors.PRIMARY}
          color={Colors.WHITE}
          fontSize={moderateScale(13)}
          fontWeight="700"
          fontFamily={FONTS.WINDSONG.REGULAR}
          style={styles.updateButton}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: moderateScale(12),
    flex: 1,
  },
  datePickerModal: {
   
    padding: scale(20),
    borderRadius: moderateScale(12),
    marginVertical: verticalScale(10),
  },
  datePickerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(10),
    
  },
  datePickerOption: {
    padding: scale(15),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.PRIMARY,
    marginVertical: verticalScale(5),
  },
  datePickerOptionText: {
    color: Colors.WHITE,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  selectedDateOption: {
    backgroundColor: Colors.SECONDARY,
    borderColor: Colors.PRIMARY,
  },
  selectedDateOptionText: {
    color: Colors.PRIMARY,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  selectorContainer: {
    marginBottom: verticalScale(15),
  },
  selectorLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(8),
    color: "black",
  },
  daySelectorScroll: {
    marginVertical: verticalScale(5),
  },
  monthSelectorScroll: {
    marginVertical: verticalScale(5),
  },
  yearSelectorScroll: {
    marginVertical: verticalScale(5),
  },
  dayPickerOption: {
    padding: scale(12),
    borderRadius: moderateScale(6),
    backgroundColor: Colors.PRIMARY,
    marginHorizontal: scale(4),
    minWidth: scale(40),
    alignItems: 'center',
  },
  dayPickerOptionText: {
    color: Colors.WHITE,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  selectedDayOption: {
    backgroundColor: Colors.SECONDARY,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  selectedDayOptionText: {
    color: Colors.PRIMARY,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  monthPickerOption: {
    padding: scale(12),
    borderRadius: moderateScale(6),
    backgroundColor: Colors.PRIMARY,
    marginHorizontal: scale(4),
    minWidth: scale(50),
    alignItems: 'center',
  },
  monthPickerOptionText: {
    color: Colors.WHITE,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  selectedMonthOption: {
    backgroundColor: Colors.SECONDARY,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  selectedMonthOptionText: {
    color: Colors.PRIMARY,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  yearPickerOption: {
    padding: scale(12),
    borderRadius: moderateScale(6),
    backgroundColor: Colors.PRIMARY,
    marginHorizontal: scale(4),
    minWidth: scale(60),
    alignItems: 'center',
  },
  yearPickerOptionText: {
    color: Colors.WHITE,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  selectedYearOption: {
    backgroundColor: Colors.SECONDARY,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  selectedYearOptionText: {
    color: Colors.PRIMARY,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(20),
    paddingTop: verticalScale(10),
  },
  updateButton: {
    height: verticalScale(40),
  },
  okButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(30),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  okButtonText: {
    color: Colors.WHITE,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});

export default MyProfileEdit;