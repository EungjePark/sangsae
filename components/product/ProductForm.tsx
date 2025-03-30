import React, { useState } from 'react';
import { useProductForm } from '@/hooks/product/useProductForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, HelpCircle, Tag, Package, Info, FileText, CreditCard, Users, Truck, RefreshCcw } from 'lucide-react';
import { ProductCategory } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useProductStore } from '@/lib/store/productStore';

// 제품 카테고리 옵션 (types/product.ts의 ProductCategory 타입과 일치)
const CATEGORY_OPTIONS = [
  { value: 'fashion', label: '패션의류/잡화' },
  { value: 'cosmetics', label: '뷰티' },
  { value: 'baby', label: '출산/유아동' },
  { value: 'food', label: '식품' }, 
  { value: 'home', label: '홈인테리어/주방용품' },
  { value: 'electronics', label: '가전디지털' },
  { value: 'sports', label: '스포츠/레저' },
  { value: 'furniture', label: '가구' },
  { value: 'pet', label: '반려동물용품' }, 
  { value: 'health', label: '헬스/건강식품' },
  { value: 'outdoor', label: '아웃도어/여행' },
  { value: 'books', label: '도서/음반/DVD' },
  { value: 'toys', label: '취미/완구/문구' },
  { value: 'digital', label: '디지털/IT' },
  { value: 'stationery', label: '문구/사무용품' },
  { value: 'etc', label: '기타' }
];

interface ProductFormProps {
  onGenerateContent: (productData: any) => void;
  isGenerating: boolean;
}

export default function ProductForm({ onGenerateContent, isGenerating }: ProductFormProps) {
  const { toast } = useToast();
  
  // useProductForm 훅 사용
  const productForm = useProductForm();
  const {
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
  } = productForm;

  // productKeywords가 undefined일 경우를 대비한 안전한 참조
  const keywords = productKeywords || [];

  const [keywordInput, setKeywordInput] = useState('');
  
  const productStore = useProductStore();

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    
    if (keywords.length >= 5) {
      toast({
        title: "키워드 제한",
        description: "키워드는 최대 5개까지 추가할 수 있습니다.",
      });
      return;
    }
    
    // 키워드에 스페이스가 있으면 별도의 키워드로 처리하지 않고, 하나의 키워드로 취급
    addKeyword(keywordInput.trim());
    setKeywordInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSubmit = () => {
    const isValid = validateForm();
    
    if (isValid) {
      const productData = getProductData();
      
      // Zustand 스토어에 targetCustomers와 productCategory 설정
      productStore.setTargetCustomers(productData.targetAudience || '');
      productStore.setProductCategory(productData.category);
      
      onGenerateContent(productData);
    }
  };

  return (
    <div className="w-full max-h-full p-8 pb-4">
      <div className="pb-8">
        <div className="space-y-8">
          {/* 상품 정보 입력 섹션 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 bg-gradient-to-r from-[#ff68b4] to-[#ff8ac6] bg-clip-text text-transparent">상품 정보 입력</h2>
            
            {/* 기본 정보 섹션 */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#ff68b4] to-[#ff8ac6] flex items-center justify-center mr-3 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-800">기본 정보</h3>
              </div>
              
              <div className="space-y-8 pl-2">
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <Label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    상품명 <span className="text-[#ff68b4] ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-400">(필수)</span>
                  </Label>
                  <Input
                    id="productName"
                    placeholder="상품명을 입력하세요"
                    className="w-full h-12 px-4 border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#ff68b4] focus-visible:border-transparent shadow-sm"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <Label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    카테고리 <span className="text-[#ff68b4] ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-400">(필수)</span>
                  </Label>
                  <Select value={productCategory} onValueChange={(value) => setProductCategory(value as ProductCategory)}>
                    <SelectTrigger className="w-full h-12 px-4 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff68b4] focus:border-transparent shadow-sm">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200 shadow-lg">
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="focus:bg-[#fff4f9] hover:bg-[#fff4f9] cursor-pointer py-2.5">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <Label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    상품 설명 <span className="text-[#ff68b4] ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-400">(필수)</span>
                  </Label>
                  <Textarea
                    id="productDescription"
                    placeholder="제품에 대한 상세 설명을 입력하세요"
                    className="w-full min-h-[150px] px-4 py-3 border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#ff68b4] focus-visible:border-transparent shadow-sm resize-y"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    required
                  />
                </div>
                     
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="keywordInput" className="block text-sm font-medium text-gray-700 flex items-center">
                      키워드 <span className="text-[#ff68b4] ml-1">*</span>
                      <span className="ml-2 text-xs text-gray-400">(필수)</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip content="제품의 특징을 나타내는 키워드를 입력하세요. 최대 5개까지 추가 가능합니다.">
                        <TooltipTrigger>
                          <div className="flex items-center text-xs text-gray-500 cursor-help">
                            <HelpCircle className="h-3.5 w-3.5 mr-1" />
                            도움말
                          </div>
                        </TooltipTrigger>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="relative mb-4">
                    <Input
                      id="keywordInput"
                      className="w-full h-12 px-4 pr-[110px] border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#ff68b4] focus-visible:border-transparent shadow-sm transition-all duration-200"
                      placeholder="제품 특징 키워드 입력 (예: 고급소재, 편안함)"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button
                      type="button"
                      onClick={handleAddKeyword}
                      className="absolute right-1 top-1 bottom-1 rounded-lg bg-gradient-to-r from-[#ff68b4] to-[#ff8ac6] hover:from-[#ff5aa8] hover:to-[#ff78b8] text-white transition-all duration-300 px-4 font-medium shadow-sm"
                    >
                      추가하기
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 min-h-[4rem] bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
                    {keywords.length > 0 ? (
                      keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          className="px-3 py-2 bg-[#fff0f7] hover:bg-[#ffeaf4] text-[#ff68b4] border border-pink-100 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm transform hover:translate-y-[-2px]"
                        >
                          {keyword}
                          <button
                            type="button"
                            className="ml-2 text-[#ff68b4] hover:text-[#ff4daa] transition-colors"
                            onClick={() => removeKeyword(index)}
                            aria-label={`${keyword} 키워드 삭제`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <p className="text-gray-400 text-sm italic">키워드를 추가해주세요 (최대 5개)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <Label htmlFor="shippingInfo" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    배송 정보 <span className="text-[#ff68b4] ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-400">(필수)</span>
                  </Label>
                  <Textarea
                    id="shippingInfo"
                    placeholder="예: 무료배송, 당일출고, 3일 이내 배송 등"
                    className="w-full min-h-[100px] px-4 py-3 border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#ff68b4] focus-visible:border-transparent shadow-sm resize-y"
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    required
                  />
                </div>

                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <Label htmlFor="returnPolicy" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    교환/반품 정책 <span className="text-[#ff68b4] ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-400">(필수)</span>
                  </Label>
                  <Textarea
                    id="returnPolicy"
                    placeholder="예: 구매 후 7일 이내 교환/반품 가능, 변심으로 인한 교환/반품 시 배송비 고객 부담 등"
                    className="w-full min-h-[100px] px-4 py-3 border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#ff68b4] focus-visible:border-transparent shadow-sm resize-y"
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* 구분선 추가 */}
            <div className="border-t border-gray-100 my-10"></div>
            
            {/* 추가 정보 섹션 */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#4d8dff] to-[#6fa5ff] flex items-center justify-center mr-3 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-800">추가 정보 (선택사항)</h3>
              </div>
              
              <div className="space-y-8 pl-2">
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <Label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                    타겟 고객층
                  </Label>
                  <Input
                    id="targetAudience"
                    className="w-full h-12 px-4 border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#4d8dff] focus-visible:border-transparent shadow-sm"
                    placeholder="예: 20-30대 여성, 육아맘, 직장인 등"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <Label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                    추가 정보
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    className="w-full min-h-[120px] px-4 py-3 border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#4d8dff] focus-visible:border-transparent shadow-sm resize-y"
                    placeholder="제품에 대한 추가 정보를 입력하세요"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            className={`w-full h-16 rounded-2xl text-white font-medium text-base mb-12 transition-all duration-300 transform hover:scale-[1.02] ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 hover:scale-100' 
                : 'bg-gradient-to-r from-[#ff68b4] to-[#ff8ac6] hover:from-[#ff5aa8] hover:to-[#ff78b8] shadow-md hover:shadow-lg'
            }`}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                콘텐츠 생성 중...
              </div>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">콘텐츠 생성하기</span>
                <span className="text-xl animate-pulse">✨</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 