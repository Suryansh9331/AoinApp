import React, {useState, useEffect} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import {ROUTES} from '../../utils/Routes';
import {uploadFormData, getData} from '../../utils/APiCall';

// Import image picker
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';


const Post = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Format price to Indian currency format
  const formatPrice = price => {
    return `₹${parseFloat(price).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`;
  };

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.log('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Permission handling - react-native-image-picker handles it automatically
  // But we can check beforehand for better UX
  const checkAndRequestPermission = async () => {
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
  };

  const handleVideoPick = async () => {
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
  };

  const handleProductSelect = product => {
    setSelectedProduct(product);
  };

  const handleAddDetails = () => {
    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video first');
      return;
    }
    // TODO: Navigate to details screen or show modal
    Alert.alert('Add Details', 'Details screen will open here');
  };

  const handleUpload = async () => {
    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video');
      return;
    }

    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a product');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please add a description');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      // React Native FormData
      const formData = new FormData();
      formData.append('video', {
        uri: selectedVideo.uri,
        type: selectedVideo.type || 'video/mp4',
        name: selectedVideo.name || 'video.mp4',
      });
      formData.append('url', selectedVideo.uri);
      // Use product_id from API response
      formData.append('product_id', selectedProduct.product_id.toString());
      formData.append('description', description.trim());

      // Upload with progress tracking
      const response = await uploadFormData(
        ROUTES.UPLOAD_REEL, 
        formData,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      Alert.alert('Success', 'Video uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedVideo(null);
            setSelectedProduct(null);
            setDescription('');
            // Only go back if there's a screen to go back to
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
            // Otherwise, stay on the same screen (form is already reset)
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
      setUploadProgress(0);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor}]}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>Upload</Text>
        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading || !selectedVideo || !selectedProduct || !description.trim()}
          style={[
            styles.uploadButton,
            (!selectedVideo || !selectedProduct || !description.trim()) &&
              styles.uploadButtonDisabled,
          ]}>
          {uploading ? (
            <View style={styles.uploadProgressContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
              {uploadProgress > 0 && (
                <View style={styles.uploadProgressOverlay}>
                  <Text style={styles.uploadProgressText}>{uploadProgress}%</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>Upload</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Video Upload Section */}
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
              <View style={[styles.videoPlaceholder, {borderColor: borderColor}]}>
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

        {/* Add Details Button */}
        <TouchableOpacity
          style={[styles.addDetailsButton, {borderColor: borderColor}]}
          onPress={handleAddDetails}
          activeOpacity={0.7}>
          <Text style={[styles.addDetailsText, {color: textColor}]}>
            Add details....
          </Text>
        </TouchableOpacity>

        {/* Description Input */}
        <View style={styles.descriptionContainer}>
          <TextInput
            style={[styles.descriptionInput, {color: textColor, borderColor: borderColor}]}
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
              {products.length > 0 ? (
                products.map((product, index) => (
                  <TouchableOpacity
                    key={product.id + index}
                    style={[
                      styles.productItem,
                      {borderBottomColor: borderColor},
                      selectedProduct?.id === product.id && styles.selectedProductItem,
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
                      <Text style={[styles.productCategory, {color: textColor}]}>
                        {product.category}
                      </Text>
                      <Text style={[styles.productPrice, {color: Colors.PRIMARY}]}>
                        {product.price}
                      </Text>
                    </View>
                    {selectedProduct?.id === product.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={Colors.PRIMARY}
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
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
              )}
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: Colors.PRIMARY,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  uploadProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(80),
    minHeight: verticalScale(40),
  },
  uploadProgressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  uploadProgressText: {
    color: Colors.PRIMARY,
    fontSize: moderateScale(9),
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
  selectedProductItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
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
    opacity: 0.7,
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

export default Post;
