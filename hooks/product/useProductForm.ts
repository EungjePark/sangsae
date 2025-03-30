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
  shippingInfo: string;
  setShippingInfo: (info: string) => void;
  returnPolicy: string;
  setReturnPolicy: (policy: string) => void;
  // 액션
  addKeyword: (keyword: string) => void;
  removeKeyword: (index: number) => void;
  validateForm: () => boolean;
  getProductData: () => ProductData;
}

export const useProductForm = () => {
  const { toast } = useToast();
  
  // 제품 정보 상태
  const [productName, setProductName] = useState<string>('');
  const [productCategory, setProductCategory] = useState<ProductCategory | ''>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productKeywords, setProductKeywords] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [shippingInfo, setShippingInfo] = useState<string>('');
  const [returnPolicy, setReturnPolicy] = useState<string>('');

  // 키워드 추가/제거 함수
  const addKeyword = useCallback((keyword: string) => {
    if (productKeywords.includes(keyword)) return;
    setProductKeywords(prev => [...prev, keyword]);
  }, [productKeywords]);

  const removeKeyword = useCallback((index: number) => {
    setProductKeywords(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 유효성 검사 함수
  const validateForm = useCallback(() => {
    if (!productName.trim()) {
      toast({
        title: "상품명을 입력하세요",
        variant: "destructive",
      });
      return false;
    }

    if (!productCategory) {
      toast({
        title: "카테고리를 선택하세요",
        variant: "destructive",
      });
      return false;
    }

    if (!productDescription.trim()) {
      toast({
        title: "상품 설명을 입력하세요",
        variant: "destructive",
      });
      return false;
    }

    if (productKeywords.length === 0) {
      toast({
        title: "최소 1개 이상의 키워드를 추가하세요",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingInfo.trim()) {
      toast({
        title: "배송 정보를 입력하세요",
        variant: "destructive",
      });
      return false;
    }

    if (!returnPolicy.trim()) {
      toast({
        title: "교환/반품 정책을 입력하세요",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [productName, productCategory, productDescription, productKeywords, shippingInfo, returnPolicy, toast]);

  // 폼 데이터 반환 함수
  const getProductData = useCallback(() => {
    return {
      name: productName,
      category: productCategory,
      description: productDescription,
      keywords: productKeywords,
      targetAudience,
      additionalInfo,
      shippingInfo,
      returnPolicy,
    };
  }, [productName, productCategory, productDescription, productKeywords, targetAudience, additionalInfo, shippingInfo, returnPolicy]);

  return {
    productName,
    productCategory,
    productDescription,
    productKeywords,
    targetAudience,
    additionalInfo,
    shippingInfo,
    returnPolicy,
    setProductName,
    setProductCategory,
    setProductDescription,
    addKeyword,
    removeKeyword,
    setTargetAudience,
    setAdditionalInfo,
    setShippingInfo,
    setReturnPolicy,
    validateForm,
    getProductData
  };
}; 