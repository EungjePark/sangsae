import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming path
import { Settings } from 'lucide-react';
import { type ProductCategory } from '@/types/product'; // Assuming path

interface MobileInfoPanelProps {
  productName: string;
  productCategory: ProductCategory;
  productDescription: string;
  targetCustomers: string;
  productKeywords: string[];
  // Add other props if needed, e.g., additionalInfo, shippingInfo, returnPolicy
}

export const MobileInfoPanel: React.FC<MobileInfoPanelProps> = ({
  productName,
  productCategory,
  productDescription,
  targetCustomers,
  productKeywords,
}) => {

  const togglePanel = () => {
    const inputInfo = document.getElementById('mobile-input-info');
    if (inputInfo) {
      inputInfo.classList.toggle('translate-y-full');
      inputInfo.classList.toggle('translate-y-0');
    }
  };

  return (
    <>
      {/* Floating Action Button to toggle the panel */}
      <div className="fixed bottom-4 left-4 z-50 md:hidden">
        <Button
          onClick={togglePanel}
          size="icon" // Make it an icon button
          className="rounded-full h-12 w-12 p-0 bg-[#ff68b4] hover:bg-[#ff45a8] shadow-lg border border-[#ffddf0]" // Adjusted size and shadow
          aria-label="입력 정보 보기/숨기기" // Accessibility label
        >
          <Settings className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* The Sliding Panel */}
      <div
        id="mobile-input-info"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-xl shadow-lg border-t border-gray-200 md:hidden transform translate-y-full transition-transform duration-300 ease-in-out" // Start hidden
      >
        {/* Handle for dragging (visual only) and header */}
        <div className="p-4 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2 cursor-grab" onClick={togglePanel}></div> {/* Make handle clickable */}
          <h3 className="text-base font-semibold text-[#ff68b4] text-center">입력 정보</h3>
        </div>

        {/* Scrollable Content Area */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto p-4 pb-6"> {/* Added padding bottom */}
          {/* Product Name */}
          {productName && (
            <div>
              <h4 className="text-xs text-gray-500 mb-0.5 font-medium">상품명</h4>
              <p className="text-sm">{productName}</p>
            </div>
          )}

          {/* Category */}
          {productCategory && (
            <div>
              <h4 className="text-xs text-gray-500 mb-0.5 font-medium">카테고리</h4>
              <p className="text-sm">{productCategory}</p>
            </div>
          )}

          {/* Description */}
          {productDescription && (
            <div>
              <h4 className="text-xs text-gray-500 mb-0.5 font-medium">상품 설명</h4>
              <p className="text-sm max-h-20 overflow-y-auto bg-gray-50 p-2 rounded border border-gray-100">{productDescription}</p>
            </div>
          )}

          {/* Target Customers */}
          {targetCustomers && (
            <div>
              <h4 className="text-xs text-gray-500 mb-0.5 font-medium">타겟 고객</h4>
              <p className="text-sm">{targetCustomers}</p>
            </div>
          )}

          {/* Keywords */}
          {productKeywords && productKeywords.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-500 mb-0.5 font-medium">키워드</h4>
              <div className="flex flex-wrap gap-1.5">
                {productKeywords.map((keyword, index) => (
                  <span key={index} className="bg-[#fff0f8] text-[#ff68b4] text-xs px-2 py-0.5 rounded-md border border-[#ffddf0]">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add other fields like additionalInfo, shippingInfo, returnPolicy if needed */}

        </div>
      </div>
    </>
  );
};
