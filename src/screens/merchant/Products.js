import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import useAppTheme from '../../theme/useAppTheme';
import {getThemeColors} from '../../theme/themeColors';
import {Colors} from '../../utils/Colors';
import Header from '../../components/Header/Header';

// Sample products data
const PRODUCTS_DATA = [
  {
    id: '1',
    name: 'Classic Cotton T-Shirt',
    category: "Men's Fashion / T-Shirts",
    price: '₹1,299',
    image: 'https://picsum.photos/200/200?random=1',
  },
  {
    id: '2',
    name: 'Summer Floral Dress',
    category: "Women's Fashion / Dresses",
    price: '₹2,499',
    image: 'https://picsum.photos/200/200?random=2',
  },
  {
    id: '3',
    name: 'Wide Brim Sun Hat',
    category: 'Accessories / Hats',
    price: '₹799',
    image: 'https://picsum.photos/200/200?random=3',
  },
  {
    id: '4',
    name: 'Scented Soy Candle',
    category: 'Home Decor / Candles',
    price: '₹499',
    image: 'https://picsum.photos/200/200?random=4',
  },
  {
    id: '5',
    name: 'Hydrating Face Serum',
    category: 'Beauty / Skincare',
    price: '₹1,599',
    image: 'https://picsum.photos/200/200?random=5',
  },
  {
    id: '6',
    name: 'Hydrating Face Serum',
    category: 'Beauty / Skincare',
    price: '₹1,599',
    image: 'https://picsum.photos/200/200?random=6',
  },
  {
    id: '7',
    name: 'Hydrating Face Serum',
    category: 'Beauty / Skincare',
    price: '₹1,599',
    image: 'https://picsum.photos/200/200?random=7',
  },
  {
    id: '8',
    name: 'Leather Wallet',
    category: 'Accessories / Wallets',
    price: '₹1,899',
    image: 'https://picsum.photos/200/200?random=8',
  },
  {
    id: '9',
    name: 'Wireless Headphones',
    category: 'Electronics / Audio',
    price: '₹3,999',
    image: 'https://picsum.photos/200/200?random=9',
  },
  {
    id: '10',
    name: 'Running Shoes',
    category: "Men's Fashion / Footwear",
    price: '₹4,499',
    image: 'https://picsum.photos/200/200?random=10',
  },
];

const Products = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const {backgroundColor, textColor, borderColor} = getThemeColors(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(PRODUCTS_DATA);

  const handleSearch = text => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setProducts(PRODUCTS_DATA);
    } else {
      const filtered = PRODUCTS_DATA.filter(
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
              No products found
            </Text>
          </View>
        }
      />
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
});

export default Products;


