import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import Input from './Input';
import axios from 'axios';
import {ROUTES, BASE_URL} from '../../utils/Routes';

const VerifyUsername = ({
  value,
  onChangeText,
  onStatusChange, // Callback to notify parent of status changes
  checkRoute = ROUTES.ARTIST_CHECK_USERNAME,
  minLength = 3,
  label = 'Username',
  placeholder = 'Choose a username',
  autoCapitalize = 'none',
  disabled = false,
  error, // Error prop from parent component
}) => {
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null, 'available', 'taken'
  const [apiErrorMessage, setApiErrorMessage] = useState(null); // Store API error message
  const usernameTimeoutRef = useRef(null);

  const checkUsernameAvailability = async username => {
    if (!username || username.trim().length < minLength) {
      setUsernameStatus(null);
      setApiErrorMessage(null);
      return;
    }

    try {
      setIsCheckingUsername(true);
      setUsernameStatus(null);
      setApiErrorMessage(null);
      
      // Use axios directly to catch errors properly
      try {
        const response = await axios.post(
          `${BASE_URL}${checkRoute}`,
          {username: username.trim()},
          {
            timeout: 15000,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response && response.data) {
          const isAvailable = response.data.available !== false;
          const newStatus = isAvailable ? 'available' : 'taken';
          setUsernameStatus(newStatus);
          setApiErrorMessage(null);

          // Notify parent of status change
          if (onStatusChange) {
            onStatusChange({
              status: newStatus,
              isAvailable,
              isTaken: !isAvailable,
              error: !isAvailable ? 'This username is already taken' : null,
            });
          }
        }
      } catch (axiosError) {
        // Handle axios error
        if (axiosError.response) {
          const {status, data} = axiosError.response;
          if (status === 400) {
            const errorMsg = data?.message || 'Username already exists';
            setUsernameStatus('taken');
            setApiErrorMessage(errorMsg);
            
            // Notify parent
            if (onStatusChange) {
              onStatusChange({
                status: 'taken',
                isAvailable: false,
                isTaken: true,
                error: errorMsg,
              });
            }
          }
        } else {
          // Network or other error
          console.log('Error checking username:', axiosError);
        }
      }
    } catch (err) {
      console.log('Error checking username:', err);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleChange = text => {
    // Convert to lowercase for username
    const processedValue = text.toLowerCase();
    onChangeText(processedValue);

    // Clear previous timeout
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    // Real-time username checking with minimal delay
    const trimmedValue = processedValue.trim();
    if (trimmedValue.length >= minLength) {
      // Real-time check with minimal delay (200ms)
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsernameAvailability(processedValue);
      }, 200);
      } else {
        // Clear status if too short
        setUsernameStatus(null);
        
        // Notify parent
        if (onStatusChange) {
          onStatusChange({
            status: null,
            isAvailable: false,
            isTaken: false,
            error: null,
          });
        }
      }
    };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, []);

  // Reset status when value changes externally
  useEffect(() => {
    if (!value || value.trim().length < minLength) {
      setUsernameStatus(null);
      setApiErrorMessage(null);
    }
  }, [value, minLength]);

  // Combine parent error with username status error (parent error takes precedence, then API error, then default)
  const displayError = error || apiErrorMessage || (usernameStatus === 'taken' ? 'This username is already taken' : null);

  return (
    <View>
      <Input
        autoCapitalize={autoCapitalize}
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={handleChange}
        disabled={disabled}
        error={displayError}
      />
      {/* Username status messages */}
      {value && value.trim().length > 0 && (
        <View style={styles.usernameStatusContainer}>
          {isCheckingUsername && (
            <Text style={styles.checkingText}>
              ⏳ Checking username availability...
            </Text>
          )}
          {!isCheckingUsername &&
            usernameStatus === 'available' &&
            value.trim().length >= minLength && (
              <Text style={styles.availableText}>✓ Username is available</Text>
            )}
          {!isCheckingUsername &&
            value.trim().length > 0 &&
            value.trim().length < minLength && (
              <Text style={styles.minLengthText}>
                Username must be at least {minLength} characters
              </Text>
            )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  usernameStatusContainer: {
    marginTop: verticalScale(-4),
    marginBottom: verticalScale(4),
    marginLeft: scale(3),
  },
  checkingText: {
    fontSize: moderateScale(12),
    color: '#6366F1',
    fontWeight: '500',
  },
  availableText: {
    fontSize: moderateScale(12),
    color: '#10B981',
    fontWeight: '600',
  },
  takenText: {
    fontSize: moderateScale(12),
    color: '#DC2626',
    fontWeight: '500',
  },
  minLengthText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default VerifyUsername;

