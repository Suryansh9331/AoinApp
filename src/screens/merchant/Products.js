import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import Header from '../../components/Header/Header';
import {getData} from '../../utils/APiCall';
import {ROUTES} from '../../utils/Routes';

const Products = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
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
        
        setAllProducts(mappedProducts);
        setProducts(mappedProducts);
      } else {
        setAllProducts([]);
        setProducts([]);
      }
    } catch (error) {
      console.log('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = text => {
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
  };

  const handleFilter = () => {
    console.log('Filter pressed');
  };

  const handleSort = () => {
    console.log('Sort pressed');
  };

  const renderProductItem = ({item}) => (
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
  );

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <Header
        title="My Products"
        leftType="back"
        onLeftPress={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5'},
        ]}>
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
      <View style={styles.listHeader}>
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
      </View>

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={[styles.loadingText, {color: textColor}]}>
            Loading products...
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
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
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  loadingText: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(12),
  },
});

export default Products;





