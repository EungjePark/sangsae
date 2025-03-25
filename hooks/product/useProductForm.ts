import { useState, useCallback } from 'react';
import { ProductCategory, ProductData } from '@/types/product';
import { useToast } from "@/hooks/use-toast";

export interface ProductFormState {
  productName: string;
  productCategory: ProductCategory;
  productDescription: string;
  additionalInfo: string;
  showAdditionalFields: boolean;
  shippingInfo: string;
  returnPolicy: string;
  productKeywords: string[];
  keywordInput: string;
  targetCustomers: string;
  targetPrice: string;
  marketCompetitionLevel: string;
  targetAudience: string;
}

export interface ProductFormActions {
  setProductName: (value: string) => void;
  setProductCategory: (value: ProductCategory) => void;
  setProductDescription: (value: string) => void;
  setAdditionalInfo: (value: string) => void;
  setShowAdditionalFields: (value: boolean) => void;
  setShippingInfo: (value: string) => void;
  setReturnPolicy: (value: string) => void;
  setKeywordInput: (value: string) => void;
  setTargetCustomers: (value: string) => void;
  setTargetPrice: (value: string) => void;
  setMarketCompetitionLevel: (value: string) => void;
  setTargetAudience: (value: string) => void;
  addKeyword: (keyword?: string) => void;
  removeKeyword: (index: number) => void;
  validateForm: () => boolean;
  getProductData: () => {
    name: string;
    category: ProductCategory;
    description: string;
    additionalInfo: string;
    keywords: string[];
    price: string;
    competitionLevel: string;
    targetAudience: string;
    shippingInfo: string;
    returnPolicy: string;
  };
}

export interface ProductFormReturn {
  // 상태
  productName: string;
  setProductName: (name: string) => void;
  productCategory: ProductCategory;
  setProductCategory: (category: ProductCategory) => void;
  productDescription: string;
  setProductDescription: (description: string) => void;
  productKeywords: string[];
  targetPrice: string;
  setTargetPrice: (price: string) => void;
  marketCompetitionLevel: string;
  setMarketCompetitionLevel: (level: string) => void;
  targetAudience: string;
  setTargetAudience: (audience: string) => void;
  additionalInfo: string;
  setAdditionalInfo: (info: string) => void;
  // 액션
  addKeyword: (keyword: string) => void;
  removeKeyword: (index: number) => void;
  validateForm: () => boolean;
  getProductData: () => ProductData;
}

export function useProductForm(): ProductFormReturn {
  const { toast } = useToast();
  
  // 상품 정보 상태
  const [productName, setProductName] = useState<string>('');
  const [productCategory, setProductCategory] = useState<ProductCategory>('OTHER');
  const [productDescription, setProductDescription] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [showAdditionalFields, setShowAdditionalFields] = useState<boolean>(false);
  const [shippingInfo, setShippingInfo] = useState<string>('');
  const [returnPolicy, setReturnPolicy] = useState<string>('');
  const [productKeywords, setProductKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [targetCustomers, setTargetCustomers] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [marketCompetitionLevel, setMarketCompetitionLevel] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');

  // 키워드 추가 함수
  const addKeyword = useCallback((keyword: string) => {
    // 빈 키워드는 추가하지 않음
    if (!keyword.trim()) return;
    
    // 중복 키워드 방지
    if (productKeywords.includes(keyword.trim())) return;
    
    setProductKeywords([...productKeywords, keyword.trim()]);
  }, [productKeywords]);

  // 키워드 제거 함수
  const removeKeyword = useCallback((index: number) => {
    const newKeywords = [...productKeywords];
    newKeywords.splice(index, 1);
    setProductKeywords(newKeywords);
  }, [productKeywords]);

  // 폼 유효성 검사
  const validateForm = useCallback(() => {
    if (!productName || !productCategory) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [productName, productCategory, toast]);

  // 제품 데이터 반환 함수
  const getProductData = useCallback((): ProductData => ({
    name: productName,
    category: productCategory,
    description: productDescription,
    additionalInfo: `대상 고객층: ${targetAudience}\n\n${additionalInfo}`,
    keywords: productKeywords,
    price: targetPrice,
    competitionLevel: marketCompetitionLevel,
    targetAudience: targetAudience,
    shippingInfo: shippingInfo,
    returnPolicy: returnPolicy
  }), [
    productName, 
    productCategory, 
    productDescription, 
    productKeywords, 
    targetPrice, 
    marketCompetitionLevel, 
    targetAudience, 
    additionalInfo,
    shippingInfo,
    returnPolicy
  ]);

  return {
    productName,
    setProductName,
    productCategory,
    setProductCategory,
    productDescription,
    setProductDescription,
    productKeywords,
    targetPrice,
    setTargetPrice,
    marketCompetitionLevel,
    setMarketCompetitionLevel,
    targetAudience,
    setTargetAudience,
    additionalInfo,
    setAdditionalInfo,
    addKeyword,
    removeKeyword,
    validateForm,
    getProductData
  };
} 