import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
import Header from '../../components/Header/Header';
import ConfirmBox from '../../components/reuseable/ConfirmBox';
import {getData, putData, deleteData, postData} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';
import {Colors} from '../../utils/Colors';
import Skeleton from '../../components/Skeleton/Skeleton';

// Notification Item Component
const NotificationItem = React.memo(
  ({
    item,
    isRead,
    isSelected,
    isMultiSelect,
    backgroundColor,
    textColor,
    borderColor,
    onPress,
    onLongPress,
    onDelete,
    onMarkAsRead,
    onMarkAllAsRead,
    onToggleSelection,
    getNotificationIcon,
    formatTime,
  }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [showMenu, setShowMenu] = useState(false);

    const handleDelete = () => {
      setShowMenu(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onDelete(item.id);
      });
    };

    const handleMarkAsRead = () => {
      setShowMenu(false);
      onMarkAsRead(item.id);
    };

    const handleMarkAllAsRead = () => {
      setShowMenu(false);
      onMarkAllAsRead();
    };

    return (
      <Animated.View
        style={[
          styles.notificationCard,
          {
            backgroundColor: backgroundColor,
            borderBottomColor: borderColor,
            opacity: fadeAnim,
          },
          isRead && styles.readCard,
          isSelected && styles.selectedCard,
        ]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.cardContent}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  item.type?.toLowerCase() === 'premium offer' ||
                  item.type?.toLowerCase() === 'reel_liked'
                    ? '#3B82F6'
                    : item.type?.toLowerCase() === 'merchant_followed' ||
                      item.type?.toLowerCase() === 'user_followed'
                    ? '#10B981'
                    : Colors.PRIMARY + '20',
              },
            ]}>
            {item.type?.toLowerCase() === 'premium offer' ? (
              <MaterialIcons
                name="diamond"
                size={moderateScale(20)}
                color="#3B82F6"
              />
            ) : item.type?.toLowerCase() === 'reel_liked' ? (
              <MaterialIcons
                name="favorite"
                size={moderateScale(20)}
                color="#3B82F6"
              />
            ) : (
              <MaterialIcons
                name={getNotificationIcon(item.type)}
                size={moderateScale(20)}
                color={
                  item.type?.toLowerCase() === 'merchant_followed' ||
                  item.type?.toLowerCase() === 'user_followed'
                    ? '#10B981'
                    : Colors.PRIMARY
                }
              />
            )}
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <Text style={[styles.typeText, {color: textColor}]}>
                {item.title?.toUpperCase() ||
                  item.type?.toUpperCase().replace(/_/g, ' ') ||
                  'GENERAL'}
              </Text>
              {item.type?.toLowerCase() === 'general' &&
                item.title?.includes('Flash') && (
                  <MaterialIcons
                    name="bolt"
                    size={moderateScale(16)}
                    color="#FCD34D"
                  />
                )}
            </View>
            <View style={styles.messageRow}>
              <Text style={[styles.messageText, {color: textColor}]}>
                {item.message || item.body || item.title}
              </Text>
              {/* Read Status Indicator */}
              <View style={styles.readStatusContainer}>
                {isRead ? (
                  <View style={styles.doubleTickContainer}>
                    <Ionicons
                      name="checkmark"
                      size={moderateScale(14)}
                      color={Colors.PRIMARY}
                      style={styles.firstTick}
                    />
                    <Ionicons
                      name="checkmark"
                      size={moderateScale(14)}
                      color={Colors.PRIMARY}
                      style={styles.secondTick}
                    />
                  </View>
                ) : (
                  <Ionicons
                    name="checkmark"
                    size={moderateScale(14)}
                    color={textColor + '60'}
                  />
                )}
              </View>
            </View>
            <Text style={[styles.timeText, {color: textColor + '80'}]}>
              {formatTime(item.created_at || item.createdAt)}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {isMultiSelect ? (
              <TouchableOpacity
                onPress={() => onToggleSelection(item.id)}
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={moderateScale(16)}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setShowMenu(true)}
                style={styles.menuButton}>
                <MaterialIcons
                  name="more-vert"
                  size={moderateScale(20)}
                  color={textColor + '60'}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Menu Modal */}
          <Modal
            visible={showMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}>
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setShowMenu(false)}>
              <View
                style={[
                  styles.menuContainer,
                  {backgroundColor: backgroundColor, borderColor: borderColor},
                ]}
                onStartShouldSetResponder={() => true}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleMarkAsRead}
                  disabled={isRead}>
                  <MaterialIcons
                    name="done"
                    size={moderateScale(20)}
                    color={isRead ? textColor + '40' : Colors.PRIMARY}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      {
                        color: isRead ? textColor + '40' : textColor,
                      },
                    ]}>
                    Mark as read
                  </Text>
                </TouchableOpacity>

                <View
                  style={[styles.menuDivider, {backgroundColor: borderColor}]}
                />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleMarkAllAsRead}>
                  <MaterialIcons
                    name="done-all"
                    size={moderateScale(20)}
                    color={Colors.PRIMARY}
                  />
                  <Text style={[styles.menuItemText, {color: textColor}]}>
                    Mark all as read
                  </Text>
                </TouchableOpacity>

                <View
                  style={[styles.menuDivider, {backgroundColor: borderColor}]}
                />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDelete}>
                  <MaterialIcons
                    name="delete-outline"
                    size={moderateScale(20)}
                    color={Colors.ERROR}
                  />
                  <Text style={[styles.menuItemText, {color: Colors.ERROR}]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

const Notifications = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  // Group notifications by date
  const groupNotificationsByDate = notifs => {
    const grouped = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifs.forEach(notif => {
      const notifDate = new Date(notif.created_at || notif.createdAt);
      notifDate.setHours(0, 0, 0, 0);

      let dateKey;
      if (notifDate.getTime() === today.getTime()) {
        dateKey = 'Today';
      } else if (notifDate.getTime() === yesterday.getTime()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = notifDate.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notif);
    });

    // Convert to array format for SectionList
    return Object.keys(grouped).map(key => ({
      title: key,
      data: grouped[key],
    }));
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getData(ROUTES.NOTIFICATIONS);
      if (response && response.status === 'success' && response.data) {
        setNotifications(response.data);
      } else if (response && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (Array.isArray(response)) {
        setNotifications(response);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async id => {
    try {
      await putData(`${ROUTES.NOTIFICATION_MARK_READ}/${id}/read`, {});
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? {...notif, is_read: true, read: true} : notif,
        ),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await putData(ROUTES.NOTIFICATION_MARK_ALL_READ, {});
      setNotifications(prev =>
        prev.map(notif => ({...notif, is_read: true, read: true})),
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete single notification
  const deleteNotification = async id => {
    try {
      await deleteData(`${ROUTES.NOTIFICATION_DELETE}/${id}`, {});
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    setClearingAll(true);
    try {
      const notification_ids = notifications.map(n => n.id);
      if (notification_ids.length > 0) {
        await deleteData(ROUTES.NOTIFICATIONS_BULK_DELETE, {notification_ids});
      }
      setNotifications([]);
      setShowClearAllModal(false);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    } finally {
      setClearingAll(false);
    }
  };

  // Bulk delete selected
  const bulkDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await deleteData(ROUTES.NOTIFICATIONS_BULK_DELETE, {
        notification_ids: selectedIds,
      });
      setNotifications(prev =>
        prev.filter(notif => !selectedIds.includes(notif.id)),
      );
      setSelectedIds([]);
      setIsMultiSelect(false);
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
    }
  };

  // Toggle selection
  const toggleSelection = id => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id],
    );
  };

  // Get notification icon
  const getNotificationIcon = type => {
    switch (type?.toLowerCase()) {
      case 'merchant_followed':
      case 'user_followed':
        return 'person-add';
      case 'reel_liked':
        return 'favorite';
      case 'reel_commented':
        return 'comment';
      case 'reel_shared':
        return 'share';
      case 'offers':
        return 'tag';
      case 'premium offer':
        return 'diamond';
      case 'delivery update':
        return 'local-shipping';
      case 'general':
        return 'notifications';
      default:
        return 'notifications';
    }
  };

  // Format time
  const formatTime = dateString => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Handle notification press
  const handleNotificationPress = item => {
    if (isMultiSelect) {
      toggleSelection(item.id);
    } else {
      if (!item.is_read && !item.read) {
        markAsRead(item.id);
      }
      // Navigate to relevant screen based on notification type
      // navigation.navigate('NotificationDetail', {notification: item});
    }
  };

  // Render notification item
  const renderNotificationItem = ({item, index, section}) => {
    const isRead = item.is_read || item.read;
    const isSelected = selectedIds.includes(item.id);

    return (
      <NotificationItem
        key={item.id}
        item={item}
        isRead={isRead}
        isSelected={isSelected}
        isMultiSelect={isMultiSelect}
        backgroundColor={backgroundColor}
        textColor={textColor}
        borderColor={borderColor}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => {
          if (!isMultiSelect) {
            setIsMultiSelect(true);
            setSelectedIds([item.id]);
          }
        }}
        onDelete={deleteNotification}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onToggleSelection={toggleSelection}
        getNotificationIcon={getNotificationIcon}
        formatTime={formatTime}
      />
    );
  };

  // Render section header
  const renderSectionHeader = ({section: {title}}) => (
    <View style={[styles.sectionHeader, {backgroundColor: backgroundColor}]}>
      <Text style={[styles.sectionTitle, {color: textColor}]}>{title}</Text>
    </View>
  );

  // Render skeleton loader
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <Skeleton
            width={moderateScale(40)}
            height={moderateScale(40)}
            radius={moderateScale(20)}
          />
          <View style={styles.skeletonContent}>
            <Skeleton width="60%" height={moderateScale(16)} radius={4} />
            <Skeleton
              width="80%"
              height={moderateScale(14)}
              radius={4}
              style={{marginTop: verticalScale(8)}}
            />
            <Skeleton
              width="40%"
              height={moderateScale(12)}
              radius={4}
              style={{marginTop: verticalScale(6)}}
            />
          </View>
        </View>
      ))}
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="notifications-none"
        size={moderateScale(64)}
        color={textColor + '40'}
      />
      <Text style={[styles.emptyText, {color: textColor}]}>
        No notifications
      </Text>
      <Text style={[styles.emptySubText, {color: textColor + '80'}]}>
        You're all caught up!
      </Text>
    </View>
  );

  // Render header right content
  const renderHeaderRight = () => {
    if (isMultiSelect) {
      return (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={() => {
              setIsMultiSelect(false);
              setSelectedIds([]);
            }}
            style={styles.headerButton}>
            <Text style={[styles.headerButtonText, {color: textColor}]}>
              Cancel
            </Text>
          </TouchableOpacity>
          {selectedIds.length > 0 && (
            <TouchableOpacity
              onPress={bulkDeleteSelected}
              style={styles.headerButton}>
              <Text
                style={[
                  styles.headerButtonText,
                  {color: Colors.ERROR, fontWeight: '600'},
                ]}>
                Delete ({selectedIds.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => {
          if (notifications.length > 0) {
            setShowClearAllModal(true);
          }
        }}
        style={styles.headerButton}>
        <Text style={[styles.headerButtonText, {color: textColor}]}>
          Clear all
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, {backgroundColor}]}>
      <Header
        title="Notifications"
        leftType="back"
        onLeftPress={() => {
          if (isMultiSelect) {
            setIsMultiSelect(false);
            setSelectedIds([]);
          } else {
            navigation.goBack();
          }
        }}
        rightContent={renderHeaderRight()}
        containerStyle={styles.headerContainer}
      />

      {loading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={groupedNotifications}
          keyExtractor={(item, index) => `section-${item.title}-${index}`}
          renderItem={({item: section}) => (
            <View>
              {renderSectionHeader({section})}
              {section.data.map((notification, index) =>
                renderNotificationItem({
                  item: notification,
                  index,
                  section,
                }),
              )}
            </View>
          )}
          contentContainerStyle={
            notifications.length === 0 && styles.emptyListContainer
          }
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
              tintColor={Colors.PRIMARY}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmBox
        visible={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={clearAllNotifications}
        title="Delete all notifications?"
        message="This would clear all your notifications you have received."
        confirmText="Clear All"
        cancelText="Go Back"
        type="danger"
        isLoading={clearingAll}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  headerButton: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
  },
  headerButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  notificationCard: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  readCard: {
    opacity: 0.7,
  },
  selectedCard: {
    backgroundColor: Colors.PRIMARY + '10',
  },
  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: verticalScale(4),
  },
  typeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(4),
  },
  messageText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    flex: 1,
    marginRight: scale(8),
  },
  readStatusContainer: {
    marginLeft: scale(4),
  },
  doubleTickContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  firstTick: {
    marginRight: moderateScale(-4),
  },
  secondTick: {
    marginLeft: moderateScale(-4),
  },
  timeText: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8),
  },
  deleteButton: {
    padding: scale(4),
  },
  menuButton: {
    padding: scale(4),
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    minWidth: scale(200),
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(8),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  menuItemText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginLeft: scale(12),
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: verticalScale(4),
  },
  checkbox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.PRIMARY,
  },
  sectionHeader: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  skeletonContainer: {
    paddingVertical: verticalScale(8),
  },
  skeletonItem: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    alignItems: 'flex-start',
  },
  skeletonContent: {
    flex: 1,
    marginLeft: scale(12),
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginTop: verticalScale(16),
  },
  emptySubText: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(8),
  },
});

export default Notifications;
