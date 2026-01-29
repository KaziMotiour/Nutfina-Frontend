"use client";
import React from "react";

import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { Order } from "@/store/reducers/orderSlice";
import { generateInvoiceHTML } from "@/lib/invoiceHtmlGenerator";
import { generatePDF } from "@/lib/pdfUtils";

interface PDFContentProps {
  children: React.ReactNode;
  title?: string;
  pageSize?: "A4" | "Letter";
  margins?: string;
  fileName?: string;
  order?: Order; // Optional order data for custom HTML invoice generation
}

export const PDFContent = ({
  children,
  title = "Content Title",
  pageSize = "A4",
  margins = "20mm",
  fileName = "document.pdf",
  order,
}: PDFContentProps) => {
  const { printRef, handlePrint, handleExport: defaultHandleExport } = usePDFGenerator({
    pageSize,
    margins,
    fileName,
  });

  // Custom export handler for invoices with HTML generation
  const handleExport = order 
    ? async () => {
        try {
          const htmlString = generateInvoiceHTML(order);
          await generatePDF({
            htmlString,
            fileName,
            pageSize: pageSize.toLowerCase() as "a4" | "letter",
            orientation: "portrait",
          });
        } catch (error) {
          console.error("Failed to export invoice PDF:", error);
          // Fallback to default export
          defaultHandleExport();
        }
      }
    : defaultHandleExport;

  return (
    <>
      <div className="gi-vendor-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ cursor: "pointer" }}
            onClick={() => {
              const buttons = document.querySelector('.gi-header-btn');
              if (buttons) {
                (buttons as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
          >
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "#6b7280" }}
            />
          </svg>
        </div>
        <div className="gi-header-btn">
          <a
            style={{ marginRight: "5px" }}
            className="gi-btn-1"
            href="#"
            onClick={handlePrint}
          >
            Print
          </a>
          <a className="gi-btn-2" href="#" onClick={handleExport}>
            Export
          </a>
        </div>
      </div>
      <div
        id="pdf-content"
        ref={printRef}
        className="bg-white p-8 rounded-lg shadow-md d-print-block"
      >
        {children}
      </div>
    </>
  );
};
