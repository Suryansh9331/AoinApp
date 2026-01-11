import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import useAppTheme from '../../../theme/useAppTheme';
import { getThemeColors } from '../../../theme/themeColors';
import { Colors } from '../../../utils/Colors';

const EditReelModal = ({
  visible,
  onClose,
  onSave,
  editDescription,
  setEditDescription,
  updatingReel,
}) => {
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: backgroundColor }]}>
          {/* Modal Header */}
          <View
            style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <TouchableOpacity
              onPress={onClose}
              disabled={updatingReel}
              style={styles.modalCancelButton}>
              <Text style={[styles.modalCancelText, { color: textColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Edit Description
            </Text>
            <TouchableOpacity
              onPress={onSave}
              disabled={updatingReel || !editDescription.trim()}
              style={[
                styles.modalSaveButton,
                (!editDescription.trim() || updatingReel) &&
                styles.modalSaveButtonDisabled,
              ]}>
              {updatingReel ? (
                <ActivityIndicator size="small" color={Colors.PRIMARY} />
              ) : (
                <Text style={[styles.modalSaveText, { color: Colors.PRIMARY }]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Description Input */}
          <View style={styles.modalBody}>
            <TextInput
              style={[
                styles.editDescriptionInput,
                {
                  color: textColor,
                  borderColor: borderColor,
                  backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                },
              ]}
              placeholder="Add description..."
              placeholderTextColor={textColor + '80'}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              editable={!updatingReel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom: verticalScale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalCancelButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(12),
  },
  modalCancelText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  modalSaveButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(12),
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  modalBody: {
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(16),
  },
  editDescriptionInput: {
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(16),
    height: verticalScale(120),
    textAlignVertical: 'top',
  },
});

export default EditReelModal;
