import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import { StatusBar } from 'react-native';
import Header from '../../components/Header/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import { getThemeColors } from '../../theme/themeColors';
import { Colors } from '../../utils/Colors';
import { ROUTES } from '../../utils/Routes';
import { uploadFormData, getData, updateReel } from '../../utils/APiCall';

// Import custom components
import Input from '../../components/reuseable/Input';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';

// Platforms constants
const PLATFORMS = [
  { label: 'Amazon', value: 'Amazon' },
  { label: 'Flipkart', value: 'Flipkart' },
  { label: 'Myntra', value: 'Myntra' },
  { label: 'Ajio', value: 'Ajio' },
  { label: 'Meesho', value: 'Meesho' },
  { label: 'Nykaa', value: 'Nykaa' },
  { label: 'Snapdeal', value: 'Snapdeal' },
  { label: 'Tata CLiQ', value: 'Tata CLiQ' },
  { label: 'Other', value: 'Other' },
];

// Validation constants
const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_DURATION = 60; // seconds
const MAX_DESCRIPTION_LENGTH = 5000;
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv'];

const Post = ({ routeParams }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useAppTheme();
  const { backgroundColor, textColor, borderColor } = getThemeColors(theme);

  // Check if we're editing a reel - memoized
  const editingReel = useMemo(
    () => routeParams?.editingReel || route.params?.editingReel,
    [routeParams, route.params],
  );
  const editingReelId = useMemo(
    () => routeParams?.editingReelId || route.params?.editingReelId,
    [routeParams, route.params],
  );
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

  // New states for External Mode
  const [uploadMode, setUploadMode] = useState('AOIN'); // 'AOIN' or 'EXTERNAL'
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');

  // Format price to Indian currency format - memoized (must be before fetchProducts)
  const formatPrice = useCallback(price => {
    return `₹${parseFloat(price).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`;
  }, []);

  // Handler functions - defined early for use in other callbacks
  const handleProductSelect = useCallback(product => {
    setSelectedProduct(product);
  }, []);

  // Memoize product list rendering
  const renderProductItem = useCallback(
    (product, index) => {
      const isSelected = selectedProduct?.product_id === product.product_id;
      return (
        <TouchableOpacity
          key={product.product_id + index}
          style={[
            styles.productItem,
            { borderBottomColor: borderColor },
            isSelected && {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(242, 99, 31, 0.15)'
                  : 'rgba(242, 99, 31, 0.05)',
            },
          ]}
          onPress={() => handleProductSelect(product)}
          activeOpacity={0.7}>
          <Image
            source={{ uri: product.primary_image }}
            style={styles.productThumbnail}
          />
          <View style={styles.productDetails}>
            <Text style={[styles.productNameText, { color: textColor }]}>
              {product.name}
            </Text>

            <Text
              style={[
                styles.productCategoryText,
                { color: textColor, opacity: 0.7 },
              ]}>
              {product.category}
            </Text>

            <Text style={[styles.productPriceText, { color: Colors.PRIMARY }]}>
              ₹{product.selling_price}
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
    },
    [selectedProduct, borderColor, theme, textColor, handleProductSelect],
  );

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
          <Text style={[styles.emptyText, { color: Colors.GRAY }]}>
            No products available
          </Text>
        </View>
      );
    }
    return products.map((product, index) => renderProductItem(product, index));
  }, [products, renderProductItem]);

  // Memoize styles that depend on theme
  const videoPlaceholderStyle = useMemo(
    () => [
      styles.videoPlaceholder,
      {
        borderColor: borderColor,
        backgroundColor:
          theme === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.05)',
      },
    ],
    [borderColor, theme],
  );

  const modeToggleStyle = useMemo(() => ({
    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
    borderColor: borderColor,
  }), [theme, borderColor]);

  const inputStyle = useMemo(
    () => [
      styles.textInput,
      {
        color: textColor,
        borderColor: borderColor,
        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      },
    ],
    [textColor, borderColor, theme],
  );

  const descriptionInputStyle = useMemo(
    () => [
      styles.descriptionInput,
      {
        color: textColor,
        borderColor: borderColor,
        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      },
    ],
    [textColor, borderColor, theme],
  );

  // Memoize upload button disabled state
  const isUploadDisabled = useMemo(() => {
    if (uploading) return true;
    if (isEditingMode) {
      return !description.trim();
    }

    const hasVideo = !!selectedVideo;
    const hasDescription = !!description.trim();

    if (uploadMode === 'AOIN') {
      return !hasVideo || !selectedProduct || !hasDescription;
    } else {
      return !hasVideo || !productUrl.trim() || !productName.trim() || !hasDescription;
    }
  }, [isEditingMode, description, uploading, selectedVideo, selectedProduct, uploadMode, productUrl, productName]);

  // Validation function - memoized
  const validateUpload = useCallback(async (video, desc) => {
    try {
      // 1. Video file validation
      if (!video) {
        throw new Error('Please select a video');
      }

      // 2. Check video file extension
      const fileExtension = video.name
        ? '.' + video.name.split('.').pop().toLowerCase()
        : '';
      if (!ALLOWED_VIDEO_EXTENSIONS.includes(fileExtension)) {
        throw new Error(
          `Invalid video format. Allowed formats: ${ALLOWED_VIDEO_EXTENSIONS.join(
            ', ',
          )}`,
        );
      }

      // 3. Check video file size (100MB max)
      const maxSizeBytes = MAX_VIDEO_SIZE_MB * 1024 * 1024;
      if (video.fileSize > maxSizeBytes) {
        throw new Error(`Video size must be less than ${MAX_VIDEO_SIZE_MB}MB`);
      }

      // 4. Check video duration (60 seconds max)
      if (video.duration > MAX_VIDEO_DURATION) {
        throw new Error(
          `Video duration must be less than ${MAX_VIDEO_DURATION} seconds`,
        );
      }

      // 5. MIME type validation
      if (!ALLOWED_VIDEO_TYPES.includes(video.type?.toLowerCase())) {
        throw new Error(
          `Invalid video type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(
            ', ',
          )}`,
        );
      }

      // 6. Mode specific validation
      if (uploadMode === 'AOIN') {
        if (!selectedProduct) {
          throw new Error('Please select a product');
        }
      } else {
        if (!productUrl.trim()) {
          throw new Error('Please enter the product URL');
        }
        if (!productUrl.startsWith('http')) {
          throw new Error('Product URL must be a valid link (starting with http/https)');
        }
        if (!productName.trim()) {
          throw new Error('Please enter the product name');
        }
      }

      // 7. Description validation
      if (!desc?.trim()) {
        throw new Error('Please add a description');
      }

      // 8. Description length validation
      if (desc.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error(
          `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`,
        );
      }

      return true;
    } catch (error) {
      setValidationError(error.message);
      throw error;
    }
  }, [uploadMode, selectedProduct, productUrl, productName]);

  // Initialize with reel data if editing
  useEffect(() => {
    if (isEditingMode && editingReel) {
      // Use caption or description field (API might return either)
      const existingDescription =
        editingReel.description || editingReel.caption || '';
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
          primary_image: item.primary_image,
          image: item.primary_image,
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
    }, [hasFetched, fetchProducts]),
  );

  const handleVideoPick = useCallback(async () => {
    const options = {
      mediaType: 'video',
      quality: 1,
      videoQuality: 'high',
      selectionLimit: 1,
      includeBase64: false,
      saveToPhotos: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to select video');
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const video = response.assets[0];
        const videoData = {
          uri: video.uri,
          type: video.type || 'video/mp4',
          name: video.fileName || `video_${Date.now()}.mp4`,
          fileSize: video.fileSize,
          duration: video.duration,
        };
        setSelectedVideo(videoData);
      }
    });
  }, []);

  const handleUpload = useCallback(async () => {
    try {
      setValidationError('');

      if (isEditingMode) {
        if (!description.trim()) {
          throw new Error('Please add a description');
        }

        setUploading(true);
        try {
          const result = await updateReel(editingReelId, {
            description: description.trim(),
          });

          Alert.alert('Success', 'Reel updated successfully!', [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('MerchantBottomTab', {
                  navigateToTab: 'Profile',
                });
              },
            },
          ]);
        } catch (error) {
          Alert.alert('Update Failed', error?.message || 'Failed to update reel.');
        } finally {
          setUploading(false);
        }
        return;
      }

      try {
        await validateUpload(selectedVideo, description);
      } catch (error) {
        Alert.alert('Validation Error', error.message);
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('video', {
          uri: selectedVideo.uri,
          type: selectedVideo.type || 'video/mp4',
          name: selectedVideo.name || `video_${Date.now()}.mp4`,
        });
        formData.append('description', description.trim());

        if (uploadMode === 'AOIN') {
          formData.append('product_id', selectedProduct.product_id.toString());
          formData.append('is_external', '0');
          formData.append('upload_mode', 'AOIN');
        } else {
          formData.append('product_url', productUrl.trim());
          formData.append('product_name', productName.trim());
          formData.append('is_external', '1');
          formData.append('upload_mode', 'EXTERNAL');
          if (platform.trim()) formData.append('platform', platform.trim());
          if (category.trim()) formData.append('category', category.trim());
        }

        // Log keys for debugging (values are hidden in FormData)
        console.log('FormData keys:', Object.keys(formData));

        const response = await uploadFormData(
          ROUTES.UPLOAD_REEL,
          formData,
          progress => setUploadProgress(progress)
        );

        Alert.alert('Success', 'Reel uploaded successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setSelectedVideo(null);
              setSelectedProduct(null);
              setDescription('');
              setProductUrl('');
              setProductName('');
              setPlatform('');
              setCategory('');
              setUploadProgress(0);

              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MerchantBottomTab', { screen: 'Home' });
              }
            },
          },
        ]);
      } catch (error) {
        console.log('Detailed Upload Error:', error);
        if (error.data) {
          console.log('Error Data:', error.data);
        }
        Alert.alert('Upload Failed', error?.message || 'Failed to upload video.');
      } finally {
        setUploading(false);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [
    isEditingMode,
    description,
    editingReelId,
    selectedVideo,
    selectedProduct,
    uploadMode,
    productUrl,
    productName,
    platform,
    category,
    validateUpload,
    navigation,
  ]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <View style={{ flex: 1, backgroundColor }}>
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
                <View style={styles.uploadProgressWrapper}>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.progressText}>
                    {uploadProgress}%
                  </Text>
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}>

          {/* Video Section */}
          {!isEditingMode && (
            <View style={styles.videoSection}>
              <TouchableOpacity
                style={styles.videoContainer}
                onPress={handleVideoPick}
                activeOpacity={0.9}>
                {selectedVideo ? (
                  <View style={styles.videoThumbnailContainer}>
                    <Video
                      source={{ uri: selectedVideo.uri }}
                      style={styles.videoThumbnail}
                      resizeMode="cover"
                      paused={true}
                      muted={true}
                    />
                    <View style={styles.playButton}>
                      <Ionicons name="play-circle" size={48} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <View style={videoPlaceholderStyle}>
                    <Ionicons
                      name="videocam-outline"
                      size={48}
                      color={textColor}
                    />
                    <Text style={[styles.placeholderText, { color: textColor }]}>
                      Tap to select video
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.videoInfoContainer}>
                <Text style={[styles.videoStatusText, { color: textColor }]}>
                  {selectedVideo ? 'Video Selected' : 'No Video Selected'}
                </Text>
                <Text style={[styles.videoHintText, { color: textColor, opacity: 0.6 }]}>
                  {selectedVideo ? selectedVideo.name : 'Max size: 100MB\nMax duration: 60s'}
                </Text>
              </View>
            </View>
          )}


          {/* Mode Selection Section */}
          {!isEditingMode && (
            <View style={styles.modeSelectionSection}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Link Product Mode</Text>
              <View style={[styles.modeToggle, modeToggleStyle]}>
                <TouchableOpacity
                  style={[styles.modeOption, uploadMode === 'AOIN' && styles.modeOptionActive]}
                  onPress={() => setUploadMode('AOIN')}
                >
                  <Text style={[styles.modeText, uploadMode === 'AOIN' ? styles.modeTextActive : { color: textColor }]}>AOIN Mode</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeOption, uploadMode === 'EXTERNAL' && styles.modeOptionActive]}
                  onPress={() => setUploadMode('EXTERNAL')}
                >
                  <Text style={[styles.modeText, uploadMode === 'EXTERNAL' ? styles.modeTextActive : { color: textColor }]}>External Mode</Text>
                </TouchableOpacity>
              </View>

              {uploadMode === 'AOIN' && selectedProduct && (
                <View style={styles.selectedProductPreview}>
                  <Text style={[styles.selectedLabel, { color: textColor, marginBottom: 0, marginRight: scale(4) }]}>Selected:</Text>
                  <Text style={[styles.selectedName, { color: Colors.PRIMARY }]} numberOfLines={1}>
                    {selectedProduct.name}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={[styles.inputLabel, { color: textColor }]}>Description</Text>
            <TextInput
              style={descriptionInputStyle}
              placeholder="What is this reel about? (Max 5000 chars)"
              placeholderTextColor={textColor + '60'}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={5000}
              textAlignVertical="top"
            />
          </View>

          {/* Conditional Content based on Upload Mode */}
          {!isEditingMode && (
            uploadMode === 'AOIN' ? (
              <View style={styles.productsListSection}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Select Your Product
                </Text>

                {loadingProducts ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.PRIMARY} />
                    <Text style={[styles.loadingText, { color: textColor }]}>
                      Fetching products...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.productsList}>{productsList}</View>
                )}
              </View>
            ) : (
              <View style={styles.externalFormSection}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  External Product Details
                </Text>

                <Input
                  label="Product URL *"
                  placeholder="https://amazon.in/dp/..."
                  value={productUrl}
                  onChangeText={setProductUrl}
                  autoCapitalize="none"
                />

                <Input
                  label="Product Name *"
                  placeholder="Enter product title"
                  value={productName}
                  onChangeText={setProductName}
                />

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1, marginRight: scale(8) }}>
                    <Input
                      label="Platform (Optional)"
                      placeholder="Select..."
                      type="dropdown"
                      options={PLATFORMS}
                      value={platform}
                      onChangeText={setPlatform}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Category (Optional)"
                      placeholder="e.g. Fashion"
                      value={category}
                      onChangeText={setCategory}
                    />
                  </View>
                </View>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </SafeAreaView>

  );
};

export default Post;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(150),
  },
  uploadButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    minWidth: scale(70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: Colors.GRAY,
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: moderateScale(13),
  },
  uploadProgressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: '#FFF',
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginLeft: scale(4),
  },
  videoSection: {
    flexDirection: 'row',
    padding: scale(16),
    gap: scale(12),
  },
  videoContainer: {
    width: scale(120),
    height: verticalScale(180),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnailContainer: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(10),
    textAlign: 'center',
    paddingHorizontal: scale(4),
  },
  playButton: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  videoInfoContainer: {
    flex: 1,
    paddingVertical: verticalScale(4),
  },
  videoStatusText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  videoHintText: {
    fontSize: moderateScale(11),
    lineHeight: moderateScale(15),
  },
  modeSelectionSection: {
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(20),
  },
  selectedProductPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
    backgroundColor: 'rgba(242, 99, 31, 0.05)',
    padding: scale(8),
    borderRadius: moderateScale(6),
  },
  modeAndInfoContainer: {
    display: 'none',
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: verticalScale(12),
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: moderateScale(8),
    padding: scale(4),
    borderWidth: 1,
    marginBottom: verticalScale(12),
  },
  modeOption: {
    flex: 1,
    paddingVertical: verticalScale(6),
    alignItems: 'center',
    borderRadius: moderateScale(6),
  },
  modeOptionActive: {
    backgroundColor: Colors.PRIMARY,
  },
  modeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#FFF',
  },
  selectedProductInfo: {
    marginTop: verticalScale(4),
  },
  selectedLabel: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    opacity: 0.6,
    marginBottom: verticalScale(2),
  },
  selectedName: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  placeholderInfo: {
    fontSize: moderateScale(12),
    fontStyle: 'italic',
  },
  descriptionContainer: {
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  descriptionInput: {
    borderRadius: moderateScale(8),
    borderWidth: 1,
    padding: scale(12),
    fontSize: moderateScale(14),
    minHeight: verticalScale(80),
  },
  textInput: {
    borderRadius: moderateScale(8),
    borderWidth: 1,
    padding: scale(10),
    fontSize: moderateScale(14),
  },
  productsListSection: {
    paddingHorizontal: scale(16),
  },
  productsList: {
    marginTop: verticalScale(4),
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
  },
  productThumbnail: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(6),
    marginRight: scale(12),
  },
  productDetails: {
    flex: 1,
  },
  productNameText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  productCategoryText: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  productPriceText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginTop: verticalScale(4),
  },
  externalFormSection: {
    paddingHorizontal: scale(16),
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: verticalScale(20),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(12),
  },
  emptyContainer: {
    padding: verticalScale(40),
    alignItems: 'center',
  },
  emptyText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
  },
});

