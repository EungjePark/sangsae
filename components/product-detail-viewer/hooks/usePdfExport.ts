import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// html2pdf.js는 클라이언트 사이드에서만 로드 (필요시)
// let html2pdf: any = null;
// if (typeof window !== 'undefined') {
//   import('html2pdf.js').then((module) => {
//     html2pdf = module.default;
//   });
// }

interface UsePdfExportOptions {
  toast?: (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => void; // Optional toast function
  fileName?: string; // Optional file name
}

export function usePdfExport({ toast, fileName = 'generated_content.pdf' }: UsePdfExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);

  const exportElementToPdf = async (element: HTMLElement | null) => {
    if (!element) {
      console.error("PDF 내보내기 오류: 대상 요소를 찾을 수 없습니다.");
      toast?.({
        title: "오류",
        description: "PDF를 생성할 콘텐츠 요소를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Use html2canvas to capture the element
      const canvas = await html2canvas(element, {
        scale: 2, // Increase resolution
        useCORS: true, // Enable cross-origin images if needed
        // Allow taint might be needed for some external resources, but use with caution
        // allowTaint: true,
        logging: false, // Disable html2canvas logging if desired
      });

      const imgData = canvas.toDataURL('image/png');

      // Use jsPDF to create the PDF
      const pdf = new jsPDF({
        orientation: 'p', // portrait
        unit: 'mm', // millimeters
        format: 'a4', // A4 size
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth; // Fit image to page width
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width; // Calculate proportional height

      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if content exceeds one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Adjust position for the next page
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Save the PDF
      pdf.save(fileName);

      toast?.({
        title: "성공",
        description: "PDF 다운로드가 완료되었습니다.",
      });

    } catch (err) {
      console.error("PDF 내보내기 오류:", err);
      toast?.({
        title: "오류",
        description: "PDF 생성 중 오류가 발생했습니다. 콘솔을 확인해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportElementToPdf,
  };
}
