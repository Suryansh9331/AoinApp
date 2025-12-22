import React, {useState, useCallback, useEffect, useMemo, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import {useNavigation, useFocusEffect, useRoute} from '@react-navigation/native';
import { SafeAreaView, StatusBar } from 'react-native';
import Header from '../../components/Header/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import {ROUTES} from '../../utils/Routes';
import {uploadFormData, getData, updateReel} from '../../utils/APiCall';

// Import image picker
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';

// Validation constants
const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_DURATION = 60; // seconds
const MAX_DESCRIPTION_LENGTH = 5000;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv'];


const Post = ({ routeParams }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);

  // Check if we're editing a reel - memoized
  const editingReel = useMemo(() => routeParams?.editingReel || route.params?.editingReel, [routeParams, route.params]);
  const editingReelId = useMemo(() => routeParams?.editingReelId || route.params?.editingReelId, [routeParams, route.params]);
  const isEditingMode = useMemo(() => !!editingReel, [editingReel]);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Format price to Indian currency format - memoized (must be before fetchProducts)
  const formatPrice = useCallback((price) => {
    return `₹${parseFloat(price).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`;
  }, []);

  // Handler functions - defined early for use in other callbacks
  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  // Memoize product list rendering
  const renderProductItem = useCallback((product, index) => {
    const isSelected = selectedProduct?.id === product.id;
    return (
      <TouchableOpacity
        key={product.id + index}
        style={[
          styles.productItem,
          {borderBottomColor: borderColor},
          isSelected && {
            backgroundColor: theme === 'dark' 
              ? 'rgba(242, 99, 31, 0.15)' 
              : 'rgba(242, 99, 31, 0.05)'
          },
        ]}
        onPress={() => handleProductSelect(product)}
        activeOpacity={0.7}>
        <Image
          source={{uri: product.image}}
          style={styles.productImage}
        />
        <View style={styles.productDetails}>
          <Text style={[styles.productName, {color: textColor}]}>
            {product.name}
          </Text>
          <Text style={[styles.productCategory, {color: textColor, opacity: 0.7}]}>
            {product.category}
          </Text>
          <Text style={[styles.productPrice, {color: Colors.PRIMARY}]}>
            {product.price}
          </Text>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={Colors.PRIMARY}
          />
        )}
      </TouchableOpacity>
    );
  }, [selectedProduct, borderColor, theme, textColor, handleProductSelect]);

  // Memoize products list
  const productsList = useMemo(() => {
    if (products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cube-outline"
            size={moderateScale(48)}
            color={Colors.GRAY}
          />
          <Text style={[styles.emptyText, {color: Colors.GRAY}]}>
            No products available
          </Text>
        </View>
      );
    }
    return products.map((product, index) => renderProductItem(product, index));
  }, [products, renderProductItem]);

  // Memoize styles that depend on theme
  const videoPlaceholderStyle = useMemo(() => [
    styles.videoPlaceholder,
    {
      borderColor: borderColor,
      backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
    }
  ], [borderColor, theme]);

  const addDetailsButtonStyle = useMemo(() => [
    styles.addDetailsButton,
    {
      borderColor: borderColor,
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF'
    }
  ], [borderColor, theme]);

  const descriptionInputStyle = useMemo(() => [
    styles.descriptionInput,
    {
      color: textColor,
      borderColor: borderColor,
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF'
    }
  ], [textColor, borderColor, theme]);

  // Memoize upload button disabled state
  const isUploadDisabled = useMemo(() => {
    if (isEditingMode) {
      return !description.trim() || uploading;
    }
    return !selectedVideo || !selectedProduct || !description.trim() || uploading;
  }, [isEditingMode, description, uploading, selectedVideo, selectedProduct]);

  // Validation function - memoized
  const validateUpload = useCallback(async (video, product, desc) => {
    try {
      // 1. Video file validation
      if (!video) {
        throw new Error('Please select a video');
      }

      // 2. Check video file extension
      const fileExtension = video.name ? '.' + video.name.split('.').pop().toLowerCase() : '';
      if (!ALLOWED_VIDEO_EXTENSIONS.includes(fileExtension)) {
        throw new Error(`Invalid video format. Allowed formats: ${ALLOWED_VIDEO_EXTENSIONS.join(', ')}`);
      }

      // 3. Check video file size (100MB max)
      const maxSizeBytes = MAX_VIDEO_SIZE_MB * 1024 * 1024;
      if (video.fileSize > maxSizeBytes) {
        throw new Error(`Video size must be less than ${MAX_VIDEO_SIZE_MB}MB`);
      }

      // 4. Check video duration (60 seconds max)
      if (video.duration > MAX_VIDEO_DURATION) {
        throw new Error(`Video duration must be less than ${MAX_VIDEO_DURATION} seconds`);
      }

      // 5. MIME type validation
      if (!ALLOWED_VIDEO_TYPES.includes(video.type?.toLowerCase())) {
        throw new Error(`Invalid video type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}`);
      }

      // 6. Product validation
      if (!product?.id) {
        throw new Error('Please select a product');
      }

      // 7. Description validation
      if (!desc?.trim()) {
        throw new Error('Please add a description');
      }

      // 8. Description length validation
      if (desc.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error(`Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`);
      }

      return true;
    } catch (error) {
      setValidationError(error.message);
      throw error;
    }
  }, []);

  // Initialize with reel data if editing
  useEffect(() => {
    if (isEditingMode && editingReel) {
      // Use caption or description field (API might return either)
      const existingDescription = editingReel.description || editingReel.caption || '';
      setDescription(existingDescription);
      // Video already exists, so user can only edit description
    }
  }, [isEditingMode, editingReel]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await getData(ROUTES.PRODUCTS_AVAILABLE);
      
      if (response && response.status === 'success' && response.data) {
        // Map API response to UI format
        const mappedProducts = response.data.map(item => ({
          id: item.product_id.toString(),
          product_id: item.product_id,
          name: item.product_name,
          category: item.category_name,
          price: formatPrice(item.selling_price),
          selling_price: item.selling_price,
          stock_qty: item.stock_qty,
          category_id: item.category_id,
          // Use placeholder image if no image URL in API response
          image: `https://picsum.photos/200/200?random=${item.product_id}`,
        }));
        
        setProducts(mappedProducts);
        setHasFetched(true);
      } else {
        setProducts([]);
        setHasFetched(true);
      }
    } catch (error) {
      console.log('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
      setProducts([]);
      setHasFetched(true);
    } finally {
      setLoadingProducts(false);
    }
  }, [formatPrice]);

  // Fetch products only when screen comes into focus (not on mount)
  useFocusEffect(
    useCallback(() => {
      // Only fetch if we haven't fetched yet
      if (!hasFetched) {
        fetchProducts();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasFetched, fetchProducts])
  );

  // Permission handling - react-native-image-picker handles it automatically
  // But we can check beforehand for better UX
  const checkAndRequestPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const apiLevel = Platform.Version;
      let permission;

      if (apiLevel >= 33) {
        // Android 13+ uses granular media permissions
        permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO;
      } else {
        // Android 12 and below
        permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      }

      // Check if already granted
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) {
        return true;
      }

      // Request permission
      const result = await PermissionsAndroid.request(permission, {
        title: 'Video Access Permission',
        message: 'AoinApp needs access to your videos to upload content',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Allow',
      });

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.log('Permission check error:', error);
      // Let the library handle it
      return true;
    }
  }, []);

  const handleVideoPick = useCallback(async () => {
    // Let react-native-image-picker handle permissions automatically
    const options = {
      mediaType: 'video',
      quality: 1,
      videoQuality: 'high',
      durationLimit: 300, // 5 minutes max
      selectionLimit: 1,
      includeBase64: false,
      saveToPhotos: false,
      presentationStyle: 'pageSheet', // For iOS
    };

    launchImageLibrary(options, response => {
      console.log('Video picker response:', response);
      
      if (response.didCancel) {
        console.log('User cancelled video picker');
        return;
      }
      
      if (response.errorCode) {
        console.log('Video picker error:', response.errorCode, response.errorMessage);
        
        let errorTitle = 'Error';
        let errorMessage = 'Failed to select video';
        let showSettingsButton = false;

        switch (response.errorCode) {
          case 'permission':
            errorTitle = 'Permission Required';
            errorMessage = 'Please allow access to your videos in app settings to upload content.';
            showSettingsButton = true;
            break;
          case 'others':
            errorMessage = response.errorMessage || 'An error occurred while selecting video';
            break;
          default:
            errorMessage = response.errorMessage || 'Failed to select video. Please try again.';
        }

        const buttons = [
          { text: 'Cancel', style: 'cancel' },
        ];

        if (showSettingsButton && Platform.OS === 'android') {
          buttons.push({
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings().catch(err =>
                console.log('Error opening settings:', err),
              );
            },
          });
        }

        Alert.alert(errorTitle, errorMessage, buttons);
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const video = response.assets[0];
        const videoData = {
          uri: video.uri,
          type: video.type || 'video/mp4',
          name: video.fileName || video.uri.split('/').pop() || `video_${Date.now()}.mp4`,
          fileSize: video.fileSize,
          duration: video.duration,
        };
        setSelectedVideo(videoData);
        console.log('Video selected successfully:', {
          uri: video.uri,
          type: video.type,
          name: video.fileName,
        });
      }
    });
  }, []);

  const handleAddDetails = useCallback(() => {
    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video first');
      return;
    }
    // TODO: Navigate to details screen or show modal
    Alert.alert('Add Details', 'Details screen will open here');
  }, [selectedVideo]);

  const handleUpload = useCallback(async () => {
    try {
      setValidationError('');
      
      // For editing, only description is required
      if (isEditingMode) {
        if (!description.trim()) {
          throw new Error('Please add a description');
        }

      setUploading(true);
      try {
        // Update reel with new description
        const result = await updateReel(editingReelId, {
          description: description.trim(),
        });

        Alert.alert('Success', 'Reel updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to MerchantBottomTab and show Profile tab
              navigation.navigate('MerchantBottomTab', {
                navigateToTab: 'Profile',
              });
            },
          },
        ]);
      } catch (error) {
        console.log('Update error:', error);
        Alert.alert(
          'Update Failed',
          error?.message || 'Failed to update reel. Please try again.',
        );
      } finally {
        setUploading(false);
      }
      return;
    }

      // For new upload, run all validations
      try {
        await validateUpload(selectedVideo, selectedProduct, description);
      } catch (error) {
        console.log('Validation error:', error);
        Alert.alert('Validation Error', error.message);
        return;
      }

      // If we get here, all validations passed

      setUploading(true);
      setUploadProgress(0);
      
      try {
        // React Native FormData
        const formData = new FormData();
        formData.append('video', {
          uri: selectedVideo.uri,
          type: selectedVideo.type || 'video/mp4',
          name: selectedVideo.name || `video_${Date.now()}.mp4`,
        });
        formData.append('url', selectedVideo.uri);
        formData.append('product_id', selectedProduct.product_id.toString());
        formData.append('description', description.trim());

        console.log('Starting upload with form data:', {
          video: { uri: selectedVideo.uri, type: selectedVideo.type },
          product_id: selectedProduct.product_id,
          description: description.trim().substring(0, 20) + '...',
        });

        // Upload with progress tracking
        const response = await uploadFormData(
          ROUTES.UPLOAD_REEL, 
          formData,
          (progress) => {
            console.log('Upload progress:', progress);
            setUploadProgress(progress);
          }
        );
        
        console.log('Upload successful:', response);
        
        Alert.alert('Success', 'Video uploaded successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedVideo(null);
              setSelectedProduct(null);
              setDescription('');
              setUploadProgress(0);
              
              // Navigate back if possible
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                // If we can't go back, navigate to home or another appropriate screen
                navigation.navigate('MerchantBottomTab', {
                  screen: 'Home',
                });
              }
            },
          },
        ]);
      } catch (error) {
        console.log('Upload error:', error);
        Alert.alert(
          'Upload Failed',
          error?.message || 'Failed to upload video. Please try again.',
        );
      } finally {
        setUploading(false);
      }
    } catch (error) {
      console.log('Validation error:', error);
      Alert.alert('Validation Error', error.message);
    }
  }, [isEditingMode, description, editingReelId, selectedVideo, selectedProduct, validateUpload, navigation]);

  return (
    <View style={[styles.container, {backgroundColor}]}>
      {/* <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={false}
      /> */}
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <Header
          title={isEditingMode ? 'Edit Reel' : 'Create Reel'}
          leftType={false}
          onLeftPress={() => navigation.goBack()}
          rightType="text"
          rightContent={
            <TouchableOpacity
              onPress={handleUpload}
              disabled={isUploadDisabled}
              style={[
                styles.uploadButton,
                isUploadDisabled && styles.uploadButtonDisabled,
              ]}
              activeOpacity={0.7}>
              {uploading ? (
                <View style={styles.uploadProgressContainer}>
                  <ActivityIndicator size="small" color={Colors.PRIMARY} />
                  <View style={styles.uploadProgressOverlay}>
                    <Text style={styles.uploadProgressText}>
                      {uploadProgress > 0 ? `${uploadProgress}%` : 'Uploading...'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.uploadButtonText}>
                  {isEditingMode ? 'Update' : 'Upload'}
                </Text>
              )}
            </TouchableOpacity>
          }
          containerStyle={{
            backgroundColor,
            borderBottomWidth: 0,
          }}
          titleStyle={{ color: textColor }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {/* Video Upload Section - Only show when creating new reel */}
          {!isEditingMode && (
            <View style={styles.videoSection}>
              {/* Video Thumbnail */}
              <TouchableOpacity
                style={styles.videoContainer}
                onPress={handleVideoPick}
                activeOpacity={0.9}>
                {selectedVideo ? (
                  <View style={styles.videoThumbnailContainer}>
                    {/* Use Video component to show first frame as thumbnail */}
                    <Video
                      source={{uri: selectedVideo.uri}}
                      style={styles.videoThumbnail}
                      resizeMode="cover"
                      paused={true}
                      muted={true}
                      repeat={false}
                      onLoad={() => {
                        console.log('Video thumbnail loaded');
                      }}
                      onError={(error) => {
                        console.log('Video thumbnail error:', error);
                      }}
                    />
                    <View style={styles.playButton}>
                      <Ionicons name="play-circle" size={48} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <View style={videoPlaceholderStyle}>
                    <Ionicons name="videocam-outline" size={48} color={textColor} />
                    <Text style={[styles.placeholderText, {color: textColor}]}>
                      Tap to select video
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Product Details */}
              <View style={styles.productInfoContainer}>
                {selectedProduct ? (
                  <>
                    <Text style={[styles.productDescription, {color: textColor}]}>
                      {selectedProduct.name}
                    </Text>
                    <Text style={[styles.productAttributes, {color: textColor}]}>
                      Category: {selectedProduct.category}
                    </Text>
                    <Text style={[styles.productAttributes, {color: textColor}]}>
                      Price: {selectedProduct.price}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.productDescription, {color: textColor}]}>
                      Crafted from premium silk, this kurta combines comfort with luxury.
                    </Text>
                    <Text style={[styles.productAttributes, {color: textColor}]}>
                      Fabric: 100% Silk
                    </Text>
                    <Text style={[styles.productAttributes, {color: textColor}]}>
                      Color: Royal Red
                    </Text>
                    <Text style={[styles.productAttributes, {color: textColor}]}>
                      Fit: Regular, Comfortable
                    </Text>
                  </>
                )}
              </View>
            </View>
          )}

          {/* Add Details Button - Only show when creating new reel */}
          {!isEditingMode && (
            <TouchableOpacity
              style={addDetailsButtonStyle}
              onPress={handleAddDetails}
              activeOpacity={0.7}>
              <Text style={[styles.addDetailsText, {color: textColor}]}>
                Add details....
              </Text>
            </TouchableOpacity>
          )}

          {/* Description Input */}
          <View style={styles.descriptionContainer}>
            <TextInput
              style={descriptionInputStyle}
              placeholder="Add description..."
              placeholderTextColor={textColor + '80'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Products List Section */}
          <View style={styles.productsListSection}>
            <Text style={[styles.productsListTitle, {color: textColor}]}>
              Products List
            </Text>
            
            {loadingProducts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.PRIMARY} />
                <Text style={[styles.loadingText, {color: textColor}]}>
                  Loading products...
                </Text>
              </View>
            ) : (
              <View style={styles.productsList}>
                {productsList}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Post;

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
  backButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  uploadButton: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
  uploadProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 40,
    height: 20,
  },
  uploadProgressOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadProgressText: {
    color: 'white',
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
  videoSection: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    gap: scale(12),
  },
  videoContainer: {
    width: scale(140),
    height: verticalScale(200),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnailContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(12),
  },
  videoThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(12),
    backgroundColor: '#000',
  },
  videoSelectedText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    marginTop: verticalScale(8),
    fontWeight: '600',
  },
  videoFileName: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    marginTop: verticalScale(4),
    opacity: 0.8,
    paddingHorizontal: scale(8),
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  productInfoContainer: {
    flex: 1,
    paddingVertical: verticalScale(8),
  },
  productDescription: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(8),
  },
  productAttributes: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    marginBottom: verticalScale(4),
  },
  addDetailsButton: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(8),
    borderWidth: 1,
  },
  addDetailsText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  descriptionContainer: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(12),
  },
  descriptionInput: {
    minHeight: verticalScale(100),
    padding: scale(12),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    fontSize: moderateScale(14),
  },
  productsListSection: {
    marginTop: verticalScale(24),
    paddingHorizontal: scale(16),
  },
  productsListTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: verticalScale(12),
  },
  productsList: {
    gap: 0,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  productImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(8),
    marginRight: scale(12),
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  productCategory: {
    fontSize: moderateScale(12),
    marginBottom: verticalScale(4),
  },
  productPrice: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(20),
  },
  loadingText: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(8),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(12),
  },
});


