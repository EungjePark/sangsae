import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming path
import { AlertCircle } from 'lucide-react';
import { type ProductCategory } from '@/types/product'; // Assuming path

interface ProductInfoSidebarProps {
  productName: string;
  productCategory: ProductCategory;
  productDescription: string;
  targetCustomers: string;
  productKeywords: string[];
  additionalInfo: string;
  shippingInfo: string;
  returnPolicy: string;
}

// Helper component for rendering info items
const InfoItem: React.FC<{ label: string; value: string | string[] | undefined | null; isList?: boolean; maxHeight?: string }> = ({
  label,
  value,
  isList = false,
  maxHeight = 'max-h-24' // Default max height for scrollable content
}) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    // Optionally render a placeholder or return null if value is empty
    // return (
    //   <div>
    //     <h3 className="font-semibold text-gray-600 mb-1 text-xs">{label}</h3>
    //     <p className="text-gray-400 italic text-xs">정보 없음</p>
    //   </div>
    // );
     return null; // Don't render if no value
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-600 mb-1 text-xs">{label}</h3>
      {isList && Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, index) => (
            <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className={`text-gray-800 bg-gray-50 p-2.5 rounded text-xs border border-gray-100 ${maxHeight} overflow-y-auto whitespace-pre-line`}>
          {value}
        </p>
      )}
    </div>
  );
};


export const ProductInfoSidebar: React.FC<ProductInfoSidebarProps> = ({
  productName,
  productCategory,
  productDescription,
  targetCustomers,
  productKeywords,
  additionalInfo,
  shippingInfo,
  returnPolicy,
}) => {
  return (
    // Sidebar container - hidden on mobile, sticky on desktop
    <div className="hidden md:block md:w-1/4 lg:w-1/5 md:sticky md:top-4 md:self-start md:h-[calc(100vh-2rem)] md:overflow-y-auto">
      <Card className="border border-gray-200 shadow-sm h-full overflow-hidden bg-white rounded-lg">
        {/* Card Header */}
        <CardHeader className="border-b border-gray-200 px-4 py-3">
          <CardTitle className="text-sm text-gray-700 flex items-center font-semibold">
            <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
            입력 정보
          </CardTitle>
        </CardHeader>
        {/* Card Content - Scrollable */}
        <CardContent className="p-4 text-sm overflow-y-auto max-h-[calc(100vh-8rem)] bg-white">
          <div className="space-y-3">
            <InfoItem label="상품명" value={productName} />
            <InfoItem label="카테고리" value={productCategory} />
            <InfoItem label="상품 설명" value={productDescription} maxHeight="max-h-32"/> {/* Increased height */}
            <InfoItem label="타겟 고객" value={targetCustomers} />
            <InfoItem label="키워드" value={productKeywords} isList />
            <InfoItem label="추가 정보" value={additionalInfo} maxHeight="max-h-32"/> {/* Increased height */}
            <InfoItem label="배송 정보" value={shippingInfo} />
            <InfoItem label="반품 정책" value={returnPolicy} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
