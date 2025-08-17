import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export interface ConversionResult {
  success: boolean;
  data?: Blob;
  error?: string;
  filename?: string;
}

export const convertWordToPdf = async (file: File): Promise<ConversionResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.width = `${pageWidth * 3.7795}px`;
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12pt';
    tempDiv.style.lineHeight = '1.5';
    document.body.appendChild(tempDiv);
    
    const lines = html.split('\n');
    let y = 20;
    
    lines.forEach((line) => {
      const cleanLine = line.replace(/<[^>]*>/g, '');
      if (cleanLine.trim()) {
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(cleanLine, 15, y, { maxWidth: pageWidth - 30 });
        y += 7;
      }
    });
    
    document.body.removeChild(tempDiv);
    
    const pdfBlob = pdf.output('blob');
    const filename = file.name.replace(/\.(docx?|doc)$/i, '.pdf');
    
    return {
      success: true,
      data: pdfBlob,
      filename
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to convert document: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const convertTextToPdf = (text: string, filename: string): ConversionResult => {
  try {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    const lines = pdf.splitTextToSize(text, pageWidth - 30);
    let y = 20;
    
    lines.forEach((line: string) => {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 15, y);
      y += 7;
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
  saveAs(blob, filename);
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