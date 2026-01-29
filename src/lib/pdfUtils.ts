import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface GeneratePDFOptions {
  element?: HTMLElement;
  htmlString?: string;
  fileName?: string;
  pageSize?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
}

export const generatePDF = async ({
  element,
  htmlString,
  fileName = "document.pdf",
  pageSize = "a4",
  orientation = "portrait",
}: GeneratePDFOptions): Promise<void> => {
  try {
    let targetElement: HTMLElement;

    // If HTML string is provided, create a temporary element
    if (htmlString) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlString;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = pageSize === "a4" ? "190mm" : "196mm"; // A4: 210mm - 20mm margins
      tempDiv.style.padding = "10mm";
      tempDiv.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempDiv);
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      targetElement = tempDiv;
    } else if (element) {
      targetElement = element;
    } else {
      throw new Error("Either element or htmlString must be provided");
    }

    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: targetElement.scrollWidth,
      height: targetElement.scrollHeight,
      windowWidth: targetElement.scrollWidth,
      windowHeight: targetElement.scrollHeight,
    });

    // Remove temporary element if created from HTML string
    if (htmlString && targetElement.parentNode) {
      document.body.removeChild(targetElement);
    }

    const imgData = canvas.toDataURL("image/png", 0.95);
    const pdf = new jsPDF(orientation, "mm", pageSize);

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const marginMM = 10;
    const imgWidth = pdfWidth - (marginMM * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Calculate page height available for content
    const pageContentHeight = pdfHeight - (marginMM * 2);
    
    // Handle multi-page PDF properly
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", marginMM, marginMM + position, imgWidth, imgHeight);
    heightLeft -= pageContentHeight;

    // Add additional pages if content exceeds one page
    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage(pageSize, orientation);
      pdf.addImage(imgData, "PNG", marginMM, marginMM + position, imgWidth, imgHeight);
      heightLeft -= pageContentHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
