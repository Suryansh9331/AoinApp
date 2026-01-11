import React, {useState, useEffect, useCallback, useMemo, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import Header from '../../components/Header/Header';
import {ProductSkeleton} from '../../components/Skeleton/Skeleton';
import {getData} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';

const Products = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Memoize styles that depend on theme
  const searchContainerStyle = useMemo(
    () => [
      styles.searchContainer,
      {backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5'},
    ],
    [theme],
  );

  // Memoize empty component - only depends on search query
  const emptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="search-outline"
          size={moderateScale(48)}
          color={Colors.GRAY}
        />
        <Text style={[styles.emptyText, {color: Colors.GRAY}]}>
          {searchQuery.trim() ? 'No products found' : 'No products available'}
        </Text>
      </View>
    ),
    [searchQuery],
  );

  // Memoize format price function
  const formatPrice = useCallback(price => {
    return `₹${parseFloat(price).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`;
  }, []);

  // Memoize fetch products function
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getData(ROUTES.PRODUCTS_AVAILABLE);
      
      if (response && response.status === 'success' && response.data) {
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

        setAllProducts(mappedProducts);
        setProducts(mappedProducts);
        setHasFetched(true);
      } else {
        setAllProducts([]);
        setProducts([]);
        setHasFetched(true);
      }
    } catch (error) {
      console.log('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
      setAllProducts([]);
      setProducts([]);
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  }, [formatPrice]);

  // Memoize search function
  const handleSearch = useCallback(
    text => {
      setSearchQuery(text);
      if (text.trim() === '') {
        setProducts(allProducts);
      } else {
        const filtered = allProducts.filter(
          product =>
            product.name.toLowerCase().includes(text.toLowerCase()) ||
            product.category.toLowerCase().includes(text.toLowerCase()),
        );
        setProducts(filtered);
      }
    },
    [allProducts],
  );

  // Memoize render product item function
  const renderProductItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={[styles.productItem, {borderBottomColor: borderColor}]}
        activeOpacity={0.7}>
        <Image
          source={{uri: item.image}}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text
            style={[styles.productName, {color: textColor}]}
            numberOfLines={2}>
            {item.name}
          </Text>
          <Text
            style={[styles.productCategory, {color: Colors.GRAY}]}
            numberOfLines={1}>
            {item.category}
          </Text>
        </View>
        <Text style={[styles.productPrice, {color: Colors.PRIMARY}]}>
          {item.price}
        </Text>
      </TouchableOpacity>
    ),
    [borderColor, textColor],
  );

  // Memoize skeleton loading component
  const loadingComponent = useMemo(
    () => (
      <View>
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <ProductSkeleton key={`skeleton-${index}`} />
        ))}
      </View>
    ),
    [],
  );

  // Fetch products only when screen comes into focus and not fetched yet
  useFocusEffect(
    useCallback(() => {
      if (!hasFetched) {
        fetchProducts();
      }
    }, [hasFetched, fetchProducts]),
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor}]}>
      <Header
        title="My Products"
        leftType={false}
        onLeftPress={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View style={searchContainerStyle}>
        <Ionicons
          name="search"
          size={moderateScale(20)}
          color={Colors.GRAY}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, {color: textColor}]}
          placeholder="Search products..."
          placeholderTextColor={Colors.GRAY}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Products List Header */}
      {/* <View style={styles.listHeader}>
        <Text style={[styles.listHeaderText, {color: textColor}]}>
          Products List
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {backgroundColor: Colors.PRIMARY_LIGHT},
            ]}
            onPress={handleFilter}
            activeOpacity={0.7}>
            <Ionicons
              name="options"
              size={moderateScale(16)}
              color={Colors.BLACK}
            />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, {backgroundColor: Colors.PRIMARY_LIGHT}]}
            onPress={handleSort}
            activeOpacity={0.7}>
            <Ionicons
              name="swap-vertical"
              size={moderateScale(16)}
              color={Colors.BLACK}
            />
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Products List */}
      {loading ? (
        loadingComponent
      ) : (
        <FlatList
          data={products}
          key="products-list"
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyComponent}
        />
      )}
    </SafeAreaView>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginTop: verticalScale(2),
    marginBottom: verticalScale(4),
    paddingHorizontal: scale(12),
    paddingVertical: Platform.OS === 'ios' ? verticalScale(8) : 0,
    borderRadius: moderateScale(12),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(8),
  },
  listHeaderText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(8),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
    gap: scale(6),
  },
  filterButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: Colors.BLACK,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
    gap: scale(6),
  },
  sortButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: Colors.BLACK,
  },
  listContent: {
    paddingBottom: verticalScale(20),
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
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
    marginRight: scale(12),
  },
  productName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  productCategory: {
    fontSize: moderateScale(12),
  },
  productPrice: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyText: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(12),
  },
  skeletonContainer: {
    padding: 0,
  },
});

export default Products;
