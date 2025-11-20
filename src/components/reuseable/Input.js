import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Country codes data
const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
];

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  style,
  type = "text", // "text", "phone", "dropdown", "password"
  options = [], // For dropdown type
  disabled = false,
  showPasswordToggle = false, // For password type
  autoCapitalize = "sentences", // For text inputs
  maxLength, // Maximum length for text inputs
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0]);
  const [showPassword, setShowPassword] = useState(false);

  const renderPhoneInput = () => {
    return (
      <View>
        <View style={styles.phoneContainer}>
          <TouchableOpacity
            style={styles.countryCodeButton}
            onPress={() => setShowDropdown(!showDropdown)}
            disabled={disabled}
          >
            <Text style={styles.countryCodeText}>
              {selectedCountryCode.flag} {selectedCountryCode.code}
            </Text>
            <Text style={[styles.dropdownArrow, showDropdown && styles.dropdownArrowUp]}>▼</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.phoneInput, error && styles.errorInput]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            editable={!disabled}
            fontSize={13}
            maxLength={maxLength}
          />
        </View>
        {showDropdown && (
          <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
            {countryCodes.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={[
                  styles.dropdownItem,
                  selectedCountryCode.code === country.code && styles.selectedDropdownItem
                ]}
                onPress={() => {
                  setSelectedCountryCode(country);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text style={styles.countryName}>{country.country}</Text>
                <Text style={styles.countryCode}>{country.code}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderDropdownInput = () => {
    const selectedOption = options.find(option => option.value === value);
    
    return (
      <View>
        <TouchableOpacity
          style={[styles.dropdownButton, error && styles.errorInput]}
          onPress={() => setShowDropdown(!showDropdown)}
          disabled={disabled}
        >
          <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Text style={[styles.dropdownArrow, showDropdown && styles.dropdownArrowUp]}>▼</Text>
        </TouchableOpacity>
        {showDropdown && (
          <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownItem,
                  value === option.value && styles.selectedDropdownItem
                ]}
                onPress={() => {
                  onChangeText(option.value);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{option.label}</Text>
                {value === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderPasswordInput = () => {
    return (
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.passwordInput, error && styles.errorInput]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          keyboardType={keyboardType}
          placeholderTextColor="#999"
          editable={!disabled}
          fontSize={13}
          maxLength={maxLength}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTextInput = () => {
    return (
      <TextInput
        style={[styles.input, error && styles.errorInput, style]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
        editable={!disabled}
        fontSize={13}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
    );
  };


  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {type === "phone" && renderPhoneInput()}
      {type === "dropdown" && renderDropdownInput()}
      {type === "password" && renderPasswordInput()}
      {type === "text" && renderTextInput()}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    color: "#333",
    fontWeight: "600",
    marginLeft: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#ffffff",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "red",
  },
  // Phone Input Styles
  phoneContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    minWidth: 80,
  },
  countryCodeText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
  },
  // Dropdown Styles
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 13,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 13,
    color: "#000",
  },
  placeholderText: {
    fontSize: 13,
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 10,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  dropdownArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  // Inline Dropdown Styles
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedDropdownItem: {
    backgroundColor: "#F0F9FF",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 8,
  },
  countryName: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  countryCode: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  // Password Input Styles
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Input;

