import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Loader2, Copy, Check, RefreshCw } from 'lucide-react';

interface ProductPreviewProps {
  content: {
    html: string;
    markdown: string;
    sections: Record<string, any>;
  } | null;
  isLoading?: boolean;
  onRegenerateSection?: (sectionId: string) => Promise<void>;
  isRegenerating?: Record<string, boolean>;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  content,
  isLoading = false,
  onRegenerateSection,
  isRegenerating = {}
}) => {
  const [activeTab, setActiveTab] = useState('sections');
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus({ ...copyStatus, [key]: true });
      setTimeout(() => {
        setCopyStatus({ ...copyStatus, [key]: false });
      }, 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-full border rounded-lg bg-gray-50">
        <Loader2 className="h-10 w-10 text-[#ff68b4] animate-spin mb-4" />
        <p className="text-gray-600">상세페이지를 생성 중입니다...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-full border rounded-lg bg-gray-50">
        <p className="text-gray-600 mb-2">상품 정보를 입력하고 생성 버튼을 클릭하세요.</p>
        <p className="text-gray-400 text-sm">상세페이지가 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections">섹션별 보기</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sections" className="border rounded-lg p-4 min-h-[500px]">
          <ScrollArea className="h-[65vh] pr-4">
            <div className="space-y-6">
              {Object.entries(content.sections).map(([sectionId, section], index) => (
                <Card key={sectionId} className="p-4 relative">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">{section.title || getKoreanTitle(sectionId)}</h3>
                    <div className="flex space-x-2">
                      {onRegenerateSection && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onRegenerateSection(sectionId)}
                          disabled={isRegenerating[sectionId]}
                          className="h-7 px-2"
                        >
                          {isRegenerating[sectionId] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          )}
                          <span className="text-xs">재생성</span>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopy(section.content, sectionId)}
                        className="h-7 px-2"
                      >
                        {copyStatus[sectionId] ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="whitespace-pre-line text-gray-600 text-sm">
                    {section.content}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="html" className="border rounded-lg p-4 min-h-[500px]">
          <div className="flex justify-end mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleCopy(content.html, 'html')}
              className="h-8"
            >
              {copyStatus['html'] ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                  <span>복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  <span>복사</span>
                </>
              )}
            </Button>
          </div>
          <ScrollArea className="h-[60vh] w-full rounded border bg-gray-50 p-4">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{content.html}</pre>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="markdown" className="border rounded-lg p-4 min-h-[500px]">
          <div className="flex justify-end mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleCopy(content.markdown, 'markdown')}
              className="h-8"
            >
              {copyStatus['markdown'] ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                  <span>복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  <span>복사</span>
                </>
              )}
            </Button>
          </div>
          <ScrollArea className="h-[60vh] w-full rounded border bg-gray-50 p-4">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{content.markdown}</pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 섹션 ID에 대한 한글 제목 가져오기
const getKoreanTitle = (sectionId: string): string => {
  const titleMap: Record<string, string> = {
    'title_block': '제품 타이틀',
    'hero_section': '제품 소개',
    'main_feature': '주요 특징',
    'sub_features': '추가 기능',
    'how_to_use': '사용 방법',
    'specifications': '제품 사양',
    'warranty_info': '보증 정보',
    'faq': '자주 묻는 질문',
    'hook_intro': '도입부',
    'shipping_return': '배송 및 반품 정보',
    'care_instructions': '관리 방법',
    'style_guide': '스타일 가이드',
    'material_details': '소재 정보',
    'size_chart': '사이즈 정보',
  };
  
  return titleMap[sectionId] || sectionId;
};

export default ProductPreview; 