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
import { X, Info, HelpCircle } from 'lucide-react';
import { ProductCategory } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

// 제품 카테고리 옵션
const CATEGORY_OPTIONS = [
  { value: 'ELECTRONICS', label: '전자제품' },
  { value: 'FASHION', label: '패션의류' },
  { value: 'BEAUTY', label: '뷰티' },
  { value: 'FOOD', label: '식품' },
  { value: 'HOME', label: '홈/리빙' },
  { value: 'SPORTS', label: '스포츠/레저' },
  { value: 'TOYS', label: '장난감/취미' },
  { value: 'BOOKS', label: '도서/음반' },
  { value: 'HEALTH', label: '건강/의료' },
  { value: 'OTHER', label: '기타' }
];

// 경쟁 수준 옵션
const COMPETITION_LEVEL_OPTIONS = [
  { value: 'LOW', label: '낮음' },
  { value: 'MEDIUM', label: '중간' },
  { value: 'HIGH', label: '높음' }
];

interface ProductFormProps {
  onGenerateContent: (productData: any) => void;
  isGenerating: boolean;
}

export default function ProductForm({ onGenerateContent, isGenerating }: ProductFormProps) {
  const { toast } = useToast();
  
  // useProductForm 훅 사용 방법 수정
  const productForm = useProductForm();
  const {
    productName,
    productCategory,
    productDescription,
    productKeywords,
    targetPrice,
    marketCompetitionLevel,
    targetAudience,
    additionalInfo,
    setProductName,
    setProductCategory,
    setProductDescription,
    addKeyword,
    removeKeyword,
    setTargetPrice,
    setMarketCompetitionLevel,
    setTargetAudience,
    setAdditionalInfo,
    validateForm,
    getProductData
  } = productForm;

  // productKeywords가 undefined일 경우를 대비한 안전한 참조
  const keywords = productKeywords || [];

  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    
    if (keywords.length >= 5) {
      toast({
        title: "키워드 제한",
        description: "키워드는 최대 5개까지 추가할 수 있습니다.",
      });
      return;
    }
    
    addKeyword(keywordInput);
    setKeywordInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    
    if (isValid) {
      onGenerateContent(getProductData());
    }
  };

  return (
    <div className="w-full md:px-4 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 gap-4">
          <div className="col-span-1">
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
              상품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              placeholder="상품명을 입력하세요"
              className="w-full p-2 border border-gray-300 rounded-md focus:border-[#ff68b4] focus:ring-[#ff68b4]"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          
          <div className="col-span-1">
            <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 mb-1">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="productCategory"
              className="w-full p-2 border border-gray-300 rounded-md focus:border-[#ff68b4] focus:ring-[#ff68b4]"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value as ProductCategory)}
              required
            >
              <option value="">카테고리 선택</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
              상품 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="productDescription"
              placeholder="제품에 대한 상세 설명을 입력하세요"
              className="w-full p-2 border border-gray-300 rounded-md focus:border-[#ff68b4] focus:ring-[#ff68b4]"
              rows={4}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="col-span-1">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="keywordInput" className="block text-sm font-medium text-gray-700">
                키워드
              </label>
              <Tooltip content="제품의 특징을 나타내는 키워드를 입력하세요. 최대 5개까지 추가 가능합니다.">
                <span className="flex items-center text-xs text-gray-500 cursor-help">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  도움말
                </span>
              </Tooltip>
            </div>
            <div className="flex">
              <input
                type="text"
                id="keywordInput"
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:border-[#ff68b4] focus:ring-[#ff68b4]"
                placeholder="키워드를 입력하세요"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="bg-[#ff68b4] text-white px-4 py-2 rounded-r-md hover:bg-[#ff4daa]"
                onClick={handleAddKeyword}
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-[#fff4f9] text-[#ff68b4] text-sm px-2 py-1 rounded-md"
                >
                  {keyword}
                  <button
                    type="button"
                    className="ml-1 text-[#ff68b4] hover:text-[#ff4daa]"
                    onClick={() => removeKeyword(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-1">
              예상 판매가
            </label>
            <div className="relative">
              <input
                type="text"
                id="targetPrice"
                className="w-full p-2 border border-gray-300 rounded-md focus:border-[#ff68b4] focus:ring-[#ff68b4]"
                placeholder="예: 10000"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">원</span>
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <label htmlFor="marketCompetitionLevel" className="block text-sm font-medium text-gray-700 mb-1">
              시장 경쟁 수준
            </label>
            <select
              id="marketCompetitionLevel"
              className="w-full p-2 border border-gray-300 rounded-md focus:border-[#ff68b4] focus:ring-[#ff68b4]"
              value={marketCompetitionLevel}
              onChange={(e) => setMarketCompetitionLevel(e.target.value)}
            >
              <option value="">선택하세요</option>
              {COMPETITION_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
              타겟 고객층
            </label>
            <input
              type="text"
              id="targetAudience"
              className="w-full p-2 border border-gray-300 rounded-md focus:border-[#ff68b4] focus:ring-[#ff68b4]"
              placeholder="예: 20-30대 여성, 육아맘, 직장인 등"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
              추가 정보
            </label>
            <textarea
              id="additionalInfo"
              className="w-full p-2 border border-gray-300 rounded-md focus:border-[#ff68b4] focus:ring-[#ff68b4]"
              placeholder="제품에 대한 추가 정보를 입력하세요"
              rows={3}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            ></textarea>
          </div>

          <div className="col-span-1 mt-4">
            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isGenerating ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#ff68b4] hover:bg-[#ff4daa]'
              }`}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  콘텐츠 생성 중...
                </div>
              ) : (
                '콘텐츠 생성하기'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 