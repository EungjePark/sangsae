declare module 'html2pdf.js' {
  function html2pdf(): any;
  export = html2pdf;
}

interface Window {
  html2pdf: any;
} 