import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';

export interface ConversionResult {
  success: boolean;
  data?: Blob;
  error?: string;
  filename?: string;
}

// Helper function to safely load docx-preview
const loadDocxPreview = async () => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Window is not available');
    }
    
    const docxPreview = await import('docx-preview');
    return docxPreview;
  } catch (error) {
    console.warn('Failed to load docx-preview:', error);
    return null;
  }
};

export const convertWordToPdfAdvanced = async (file: File): Promise<ConversionResult> => {
  try {
    const docxPreview = await loadDocxPreview();
    
    if (!docxPreview) {
      console.log('docx-preview not available, falling back to basic conversion');
      return await convertWordToPdfBasic(file);
    }

    const arrayBuffer = await file.arrayBuffer();
    
    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.width = '794px'; // A4 width in pixels at 96 DPI
    container.style.padding = '40px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12pt';
    container.style.lineHeight = '1.5';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.zIndex = '-1000';
    
    document.body.appendChild(container);
    
    try {
      // Use docx-preview for better rendering with safer options
      await docxPreview.renderAsync(arrayBuffer, container, undefined, {
        className: 'docx-wrapper',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true,
        debug: false,
        experimental: false
      });
      
      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convert the rendered HTML to image and then to PDF
      const dataUrl = await toPng(container, {
        width: 794,
        height: container.scrollHeight,
        backgroundColor: 'white',
        pixelRatio: 1.5,
        quality: 0.95,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      // Create PDF with the image
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgWidth = 595; // A4 width in points
      const imgHeight = (container.scrollHeight * imgWidth) / 794;
      
      if (imgHeight <= 800) { // Single page
        pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Multiple pages
        const pageHeight = 800;
        let remainingHeight = imgHeight;
        let position = 0;
        
        while (remainingHeight > 0) {
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(dataUrl, 'PNG', 0, -position, imgWidth, imgHeight);
          
          position += pageHeight;
          remainingHeight -= pageHeight;
        }
      }
      
      const pdfBlob = pdf.output('blob');
      const filename = file.name.replace(/\.(docx?|doc)$/i, '.pdf');
      
      return {
        success: true,
        data: pdfBlob,
        filename
      };
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  } catch (error) {
    console.error('Advanced conversion failed, falling back to basic conversion:', error);
    return await convertWordToPdfBasic(file);
  }
};

export const convertWordToPdfBasic = async (file: File): Promise<ConversionResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    const result = await mammoth.convertToHtml({ 
      arrayBuffer
    } as any);
    
    const html = result.value;
    
    if (!html || html.trim() === '') {
      return {
        success: false,
        error: 'Document appears to be empty or could not be processed'
      };
    }
    
    // Create a temporary div to measure content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.width = '650px'; // A4 width in points converted to pixels
    tempDiv.style.padding = '40px 30px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12pt';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.color = '#000';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.zIndex = '-1000';
    
    // Apply CSS styles to improve formatting
    const style = document.createElement('style');
    style.textContent = `
      .temp-doc-container * { box-sizing: border-box; }
      .temp-doc-container h1 { font-size: 20pt; font-weight: bold; margin: 24px 0 12px 0; line-height: 1.3; }
      .temp-doc-container h2 { font-size: 16pt; font-weight: bold; margin: 20px 0 10px 0; line-height: 1.3; }
      .temp-doc-container h3 { font-size: 14pt; font-weight: bold; margin: 16px 0 8px 0; line-height: 1.3; }
      .temp-doc-container p { margin: 10px 0; text-align: justify; hyphens: auto; }
      .temp-doc-container strong { font-weight: bold; }
      .temp-doc-container em { font-style: italic; }
      .temp-doc-container ul, .temp-doc-container ol { margin: 12px 0; padding-left: 24px; }
      .temp-doc-container li { margin: 6px 0; line-height: 1.5; }
      .temp-doc-container table { border-collapse: collapse; width: 100%; margin: 12px 0; }
      .temp-doc-container td, .temp-doc-container th { border: 1px solid #333; padding: 8px; vertical-align: top; }
      .temp-doc-container th { background-color: #f5f5f5; font-weight: bold; }
      .temp-doc-container img { max-width: 100%; height: auto; margin: 10px 0; }
      .temp-doc-container .title { font-size: 24pt; font-weight: bold; text-align: center; margin: 20px 0; }
    `;
    document.head.appendChild(style);
    
    tempDiv.className = 'temp-doc-container';
    document.body.appendChild(tempDiv);
    
    try {
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Convert to image with better quality
      const dataUrl = await toPng(tempDiv, {
        width: 650,
        height: tempDiv.scrollHeight,
        backgroundColor: 'white',
        pixelRatio: 2,
        quality: 0.95,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgWidth = 595;
      const imgHeight = (tempDiv.scrollHeight * imgWidth) / 650;
      
      if (imgHeight <= 800) {
        pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Split into multiple pages using canvas for better quality
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = dataUrl;
        });
        
        const pageHeight = 800;
        let y = 0;
        
        while (y < imgHeight) {
          if (y > 0) {
            pdf.addPage();
          }
          
          const currentPageHeight = Math.min(pageHeight, imgHeight - y);
          canvas.width = 595;
          canvas.height = currentPageHeight;
          
          // Calculate source dimensions
          const srcY = (y * 650) / imgWidth;
          const srcHeight = (currentPageHeight * 650) / imgWidth;
          
          ctx.drawImage(img, 0, srcY, 650, srcHeight, 0, 0, 595, currentPageHeight);
          
          const pageDataUrl = canvas.toDataURL('image/png', 0.95);
          pdf.addImage(pageDataUrl, 'PNG', 0, 0, imgWidth, currentPageHeight);
          
          y += pageHeight;
        }
      }
      
      const pdfBlob = pdf.output('blob');
      const filename = file.name.replace(/\.(docx?|doc)$/i, '.pdf');
      
      return {
        success: true,
        data: pdfBlob,
        filename
      };
    } finally {
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to convert document: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const convertTextToPdf = (text: string, filename: string): ConversionResult => {
  try {
    if (!text || text.trim() === '') {
      return {
        success: false,
        error: 'Text file is empty'
      };
    }

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 50;
    const lineHeight = 18;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    
    // Split text into lines that fit the page width
    const lines = pdf.splitTextToSize(text, pageWidth - (margin * 2));
    let y = margin + 20; // Start position
    
    lines.forEach((line: string) => {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin + 20;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    });
    
    const pdfBlob = pdf.output('blob');
    const pdfFilename = filename.replace(/\.(txt)$/i, '.pdf');
    
    return {
      success: true,
      data: pdfBlob,
      filename: pdfFilename
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to convert text to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const downloadFile = (blob: Blob, filename: string) => {
  try {
    saveAs(blob, filename);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback download method
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

export const detectFileType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type;
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
    return 'docx';
  } else if (mimeType === 'application/msword' || extension === 'doc') {
    return 'doc';
  } else if (mimeType === 'text/plain' || extension === 'txt') {
    return 'txt';
  } else if (mimeType === 'application/pdf' || extension === 'pdf') {
    return 'pdf';
  } else if (mimeType.startsWith('image/')) {
    return 'image';
  }
  
  return 'unknown';
};

export const canConvertToPdf = (fileType: string): boolean => {
  return ['docx', 'doc', 'txt', 'image'].includes(fileType);
};