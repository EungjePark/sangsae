import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy, Code } from 'lucide-react';
import { type ProductDetailContent } from '@/types/product';
import { toast } from '@/hooks/use-toast';

interface ExportPanelProps {
  content: ProductDetailContent;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ content }) => {
  // 콘텐츠 상태 로깅
  console.log('[ExportPanel] 받은 콘텐츠:', content);
  
  // 데이터 준비 검증
  const isDataValid = !!content && !!content.sections;
  const hasRawContent = isDataValid && !!content.rawContent && content.rawContent.length > 10;
  const hasHtmlContent = isDataValid && !!content.html && content.html.length > 10;
  const hasMarkdownContent = isDataValid && !!content.markdown && content.markdown.length > 10;
  
  console.log('[ExportPanel] 콘텐츠 검증 결과:', { 
    isDataValid, hasRawContent, hasHtmlContent, hasMarkdownContent 
  });
  
  // 내용이 없을 경우 대체할 메시지
  const placeholderMessage = "내용이 준비되지 않았습니다. 상세페이지 생성을 완료해주세요.";
  
  // 컨텐츠 백업 생성 (필요한 경우)
  let backupRawContent = '';
  
  if (isDataValid && content.sections.length > 0 && (!hasRawContent || !content.rawContent)) {
    // rawContent가 없는 경우 섹션 내용을 조합하여 대체
    backupRawContent = content.sections.map(s => 
      `---섹션시작:${s.id}---\n${s.content}\n---섹션끝---`
    ).join('\n\n');
    console.log('[ExportPanel] 백업 rawContent 생성:', backupRawContent.length);
  }
  
  // 원시 콘텐츠 가져오기 (없을 경우 대체 텍스트)
  // 문자열이 항상 있도록 기본값 설정
  const rawContent: string = hasRawContent ? content.rawContent! 
    : (backupRawContent || placeholderMessage);
  
  const htmlContent: string = hasHtmlContent ? content.html! 
    : `<div>${placeholderMessage}</div>`;
  
  const markdownContent: string = hasMarkdownContent ? content.markdown! 
    : `# ${placeholderMessage}`;
  
  // 기본 파일명 설정
  const defaultFilename = '상세페이지_내보내기';
  const filename = (content.cacheName || defaultFilename).toString();
  
  // 클립보드에 복사하는 함수
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "복사 완료",
        description: `${type} 형식으로 클립보드에 복사되었습니다.`,
      });
    }).catch(err => {
      console.error('클립보드 복사 오류:', err);
      toast({
        title: "복사 실패",
        description: "클립보드에 복사하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    });
  };
  
  // 파일 다운로드 함수
  const downloadAsFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "다운로드 완료",
      description: `${filename} 파일이 다운로드되었습니다.`,
    });
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Tabs defaultValue="raw">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="raw" className="flex-1">원본 텍스트</TabsTrigger>
            <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
            <TabsTrigger value="markdown" className="flex-1">Markdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="raw" className="mt-2">
            <div className="bg-gray-50 p-4 rounded-md text-sm font-mono overflow-auto max-h-80 whitespace-pre-wrap">
              {rawContent}
            </div>
            <div className="flex mt-4 gap-2">
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(rawContent, '원본 텍스트')}>
                <Copy className="h-4 w-4 mr-1" /> 복사
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadAsFile(rawContent, `${filename}_raw.txt`, '원본 텍스트')}>
                <Download className="h-4 w-4 mr-1" /> 다운로드
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="html" className="mt-2">
            <div className="bg-gray-50 p-4 rounded-md text-sm font-mono overflow-auto max-h-80 whitespace-pre-wrap">
              <code className="text-xs">{htmlContent}</code>
            </div>
            <div className="flex mt-4 gap-2">
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(htmlContent, 'HTML')}>
                <Copy className="h-4 w-4 mr-1" /> 복사
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadAsFile(htmlContent, `${filename}.html`, 'HTML')}>
                <Download className="h-4 w-4 mr-1" /> 다운로드
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="markdown" className="mt-2">
            <div className="bg-gray-50 p-4 rounded-md text-sm font-mono overflow-auto max-h-80 whitespace-pre-wrap">
              <code className="text-xs">{markdownContent}</code>
            </div>
            <div className="flex mt-4 gap-2">
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(markdownContent, 'Markdown')}>
                <Copy className="h-4 w-4 mr-1" /> 복사
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadAsFile(markdownContent, `${filename}.md`, 'Markdown')}>
                <Download className="h-4 w-4 mr-1" /> 다운로드
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExportPanel; 