// Gemini API로 전송하는 상품 데이터 타입
export interface ProductData {
  name: string;
  category: ProductCategory;
  price?: string;
  description?: string;
  additionalInfo?: string;
  keywords?: string;
  shippingInfo?: string;
  returnPolicy?: string;
}

// 카테고리 타입
export type ProductCategory = 
  | 'electronics' 
  | 'fashion' 
  | 'beauty' 
  | 'home_living'
  | 'food'
  | 'sports'
  | 'digital_content'
  | 'books'
  | 'toys'; 