import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, Download, Loader2, FileText } from 'lucide-react';
import { type ProductDetailContent } from '@/types/product';
import { toast } from '@/hooks/use-toast'; // toast 함수 임포트

interface ActionToolbarProps {
  handleRegenerate: () => void;
  handleOpenPreview: () => void;
  handleExportPdf: () => void;
  isExporting: boolean;
  generatedContent: ProductDetailContent;
  toast: typeof toast; // toast 함수의 타입으로 정의
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  handleRegenerate,
  handleOpenPreview,
  handleExportPdf,
  isExporting,
  generatedContent,
  toast
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Button 
          onClick={handleRegenerate} 
          size="sm" 
          variant="ghost"
          disabled={!generatedContent}
          className="text-sm flex items-center gap-1.5 text-gray-600 hover:text-pink-600 hover:bg-pink-50/50 rounded-lg px-3 h-9 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 text-pink-500" />
          재생성
        </Button>
        
        <div className="h-6 border-r border-gray-200/80"></div>
        
        <Button 
          onClick={handleOpenPreview} 
          size="sm" 
          variant="ghost"
          disabled={!generatedContent}
          className="text-sm flex items-center gap-1.5 text-gray-600 hover:text-pink-600 hover:bg-pink-50/50 rounded-lg px-3 h-9 transition-all duration-200"
        >
          <Eye className="h-4 w-4 text-pink-500" />
          미리보기
        </Button>
      </div>
      
      <Button 
        onClick={handleExportPdf} 
        size="sm" 
        variant={!generatedContent || isExporting ? "ghost" : "outline"}
        disabled={!generatedContent || isExporting}
        className={`text-sm flex items-center gap-1.5 rounded-lg px-3 h-9 transition-all duration-200 
          ${!generatedContent || isExporting 
            ? "text-gray-400" 
            : "text-pink-600 border-pink-200 hover:bg-pink-50/80 hover:border-pink-300"}`}
      >
        {isExporting ? 
          <><Loader2 className="h-4 w-4 animate-spin text-pink-400" /> 변환 중...</> : 
          <><FileText className="h-4 w-4 text-pink-500" /> PDF 내보내기</>
        }
      </Button>
    </div>
  );
};
