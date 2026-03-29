import { Product, MainCategory, Gender, ProductType } from '../types';

export const footwearCategories: ProductType[] = ['Shoes', 'Sandals', 'Slippers', 'Wedding', 'Casual', 'Sports'];
export const menClothingCategories: ProductType[] = ['T-Shirts', 'Shirts', 'Jeans', 'Cargo Pants', 'Shorts', 'Track Pants'];
export const womenClothingCategories: ProductType[] = ['Sarees', 'Kurtis', 'Tops', 'Dresses'];
export const kidsClothingCategories: ProductType[] = ['T-Shirts', 'Shorts', 'Dresses', 'School wear'];
export const clothingCategories: ProductType[] = ['T-Shirts', 'Shirts', 'Jeans', 'Cargo Pants', 'Shorts', 'Track Pants', 'Sarees', 'Kurtis', 'Tops', 'Dresses', 'School wear'];

const unsplashIds: Record<string, string[]> = {
  // Footwear
  'Shoes': ['1542291026-7eec264c27ff', '1560769629-975ec94e6a86', '1595950653106-6c9ebd614d3a', '1525966222134-fcfa99b8ae77', '1549298916-b41d501d3772'],
  'Sandals': ['1621996346565-e3dbc646d9a9', '1562273138-f46be4ebdf33', '1603487742131-4160ec999306', '1612033448550-9d6f9c17f07d', '1605034313761-73ea4a0cfbf3'],
  'Slippers': ['1589187151032-573a91317445', '1608667508764-aa3c0739919a', '1600185365483-26d7a4cc7519', '1595341888016-a392ef81b7de'],
  'Wedding': ['1543163521-1bf539c55dd2', '1596609548086-85bbf8ddb6b9', '1519415943484-9fa1873496d4', '1515347619252-60a4bdad8886', '1549298916-b41d501d3772'],
  'Casual': ['1525966222134-fcfa99b8ae77', '1549298916-b41d501d3772', '1560769629-975ec94e6a86', '1512374382149-4332c6c02151', '1491553895911-0055eca6402d'],
  'Sports': ['1542291026-7eec264c27ff', '1560769629-975ec94e6a86', '1595950653106-6c9ebd614d3a', '1525966222134-fcfa99b8ae77', '1549298916-b41d501d3772'],
  // Clothing
  'T-Shirts': ['1521572163474-6864f9cf17ab', '1583743814035-46b395944462', '1576566588028-4147f3842f27'],
  'Shirts': ['1596755094514-f87034a31217', '1602810318383-e386cc2a3cc7', '1603252109303-275144ee9921'],
  'Jeans': ['1542272604-787c3835535d', '1541099649105-f69ad21f3246', '1604176354204-9025e1ca0266'],
  'Cargo Pants': ['1591195853828-11db59a4c111', '1624266114284-8a1f738927a3'],
  'Shorts': ['1591195853828-11db59a4c111', '1624266114284-8a1f738927a3'],
  'Track Pants': ['1515886657617-aa3c0739919a', '1483721314737-c5b5769305d7'],
  'Sarees': ['1610030469983-d45869d09375', '1617627143767-7a0223325bb4'],
  'Kurtis': ['1610030469983-d45869d09375', '1617627143767-7a0223325bb4'],
  'Tops': ['1564584217132-c997ec609749', '1551488831-00ddcb6c603e'],
  'Dresses': ['1539006711211-593a39631719', '1595777434624-221c8714a582'],
  'School wear': ['1617922093583-37dd4979c7c7', '1617922093583-37dd4979c7c7'],
};

const categoryQueries: Record<ProductType, string[]> = {
  'Shoes': ['running shoes', 'premium sneakers', 'leather shoes'],
  'Sandals': ['fashion sandals', 'flat sandals', 'summer sandals'],
  'Slippers': ['soft slippers', 'slide slippers', 'home slippers'],
  'Wedding': ['wedding shoes', 'formal shoes', 'ceremony footwear'],
  'Casual': ['casual shoes', 'streetwear shoes', 'daily footwear'],
  'Sports': ['sports shoes', 'training shoes', 'athletic shoes'],
  'T-Shirts': ['fashion tshirt', 'cotton tshirt', 'casual tee'],
  'Shirts': ['formal shirt', 'button shirt', 'cotton shirt'],
  'Jeans': ['denim jeans', 'blue jeans', 'casual denim'],
  'Cargo Pants': ['cargo pants', 'utility pants', 'streetwear pants'],
  'Shorts': ['casual shorts', 'summer shorts', 'athletic shorts'],
  'Track Pants': ['track pants', 'jogger pants', 'athleisure pants'],
  'Sarees': ['saree fashion', 'traditional saree', 'ethnic saree'],
  'Kurtis': ['kurti fashion', 'ethnic kurti', 'women kurti'],
  'Tops': ['fashion top', 'casual top', 'women top'],
  'Dresses': ['fashion dress', 'casual dress', 'party dress'],
  'School wear': ['school uniform', 'student uniform', 'kids school wear'],
};

const getUnsplashId = (category: string, id: string, index: number): string => {
  const ids = unsplashIds[category] || unsplashIds['Shoes'];
  return ids[(parseInt(id) + index) % ids.length];
};

const getCategoryPhoto = (category: ProductType, gender: Gender, index: number) => {
  const queries = categoryQueries[category] || ['fashion product'];
  const query = queries[index % queries.length];
  return `https://source.unsplash.com/featured/900x900/?${encodeURIComponent(`${gender} ${query}`)}`;
};

const generateProducts = (mainCategory: MainCategory, gender: Gender, count: number, startIndex: number): Product[] => {
  return Array.from({ length: count }).map((_, i) => {
    const id = (startIndex + i).toString();
    let category: ProductType;
    
    if (mainCategory === 'Footwear') {
      category = footwearCategories[Math.floor(Math.random() * footwearCategories.length)];
    } else {
      if (gender === 'Men') category = menClothingCategories[Math.floor(Math.random() * menClothingCategories.length)];
      else if (gender === 'Women') category = womenClothingCategories[Math.floor(Math.random() * womenClothingCategories.length)];
      else category = kidsClothingCategories[Math.floor(Math.random() * kidsClothingCategories.length)];
    }

    const price = Math.floor(Math.random() * 150) + 50;
    const discount = Math.random() > 0.7 ? 50 : 0;
    const originalPrice = discount > 0 ? price * 2 : price;
    
    let sizes: (number | string)[];
    if (mainCategory === 'Footwear') {
      sizes = gender === 'Men' ? [7, 8, 9, 10, 11, 12] : gender === 'Women' ? [5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 5];
    } else {
      sizes = ['S', 'M', 'L', 'XL'];
    }

    return {
      id,
      name: `${gender}'s ${category} Pro ${id}`,
      price,
      originalPrice,
      rating: 4 + Math.random(),
      reviews: Math.floor(Math.random() * 500) + 50,
      mainCategory,
      category,
      gender,
      images: [
        `https://images.unsplash.com/photo-${getUnsplashId(category, id, 0)}?auto=format&fit=crop&w=800&q=80`,
        getCategoryPhoto(category, gender, 1),
        getCategoryPhoto(category, gender, 2),
      ],
      description: `Experience ultimate comfort and style with the ${gender}'s ${category} Pro. Designed for the modern individual who values both legacy and innovation. Crafted with premium materials and 57+ years of expertise from SP & Their Sons.`,
      sizes,
      isTrending: Math.random() > 0.8,
      isFeatured: Math.random() > 0.9,
      discount,
    };
  });
};

export const products: Product[] = [
  ...generateProducts('Footwear', 'Men', 50, 100),
  ...generateProducts('Footwear', 'Women', 50, 200),
  ...generateProducts('Footwear', 'Kids', 20, 300),
  ...generateProducts('Clothing', 'Men', 50, 400),
  ...generateProducts('Clothing', 'Women', 50, 500),
  ...generateProducts('Clothing', 'Kids', 20, 600),
];
