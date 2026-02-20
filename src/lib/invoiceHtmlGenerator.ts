import { Order, OrderItem } from "@/store/reducers/orderSlice";

export const generateInvoiceHTML = (order: Order): string => {
  const shippingAddress = order.shipping_address_detail;
  const subtotal = parseFloat(order.subtotal || "0");
  const discount = parseFloat(order.discount || "0");
  const shippingFee = parseFloat(order.shipping_fee || "0");
  const totalAmount = parseFloat(order.total_amount || "0");

  // Get backend base URL for absolute image URLs
  const getBackendBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    return apiUrl.replace(/\/api$/, "");
  };

  const backendBaseUrl = getBackendBaseUrl();

  // HTML escape function to prevent XSS and display issues
  const escapeHtml = (text: string | null | undefined): string => {
    if (!text) return "";
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2);
  };

  const formatWeight = (weightGrams: number | null | undefined): string => {
    if (!weightGrams) return "N/A";
    const weight = typeof weightGrams === 'string' ? parseFloat(weightGrams) : weightGrams;
    return weight < 1000 
      ? `${weight}g` 
      : `${(weight / 1000).toFixed(1)}kg`;
  };

  // Convert relative image URL to absolute URL for PDF
  const makeAbsoluteUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) {
      return `${process.env.NEXT_PUBLIC_URL || backendBaseUrl}/assets/img/common/placeholder.png`;
    }

    // If already a full URL (http/https or data URI), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
      return imagePath;
    }

    // If it's a relative path starting with /, prepend backend base URL
    if (imagePath.startsWith("/")) {
      return `${backendBaseUrl}${imagePath}`;
    }

    // Otherwise, assume it's a relative path and prepend backend base URL with /
    return `${backendBaseUrl}/${imagePath}`;
  };

  // Extract image URL from image object - prioritize image_url (already absolute) over image (might be relative)
  const extractImageUrl = (imageObj: any): string | null => {
    if (!imageObj) return null;
    
    // Prioritize image_url as it's already an absolute URL from backend serializer
    if (imageObj.image_url && typeof imageObj.image_url === 'string' && imageObj.image_url.trim() !== '') {
      return imageObj.image_url;
    }
    
    // Fallback to image field
    if (imageObj.image && typeof imageObj.image === 'string' && imageObj.image.trim() !== '') {
      return imageObj.image;
    }
    
    // Fallback to url field
    if (imageObj.url && typeof imageObj.url === 'string' && imageObj.url.trim() !== '') {
      return imageObj.url;
    }
    
    return null;
  };

  const getItemImage = (item: OrderItem): string => {
    console.log(item);
    
    // Try variant images first
    if (item.variant_detail?.images && Array.isArray(item.variant_detail.images) && item.variant_detail.images.length > 0) {
      const activeImage = item.variant_detail.images.find((img: any) => img?.is_active !== false);
      const firstImage = activeImage || item.variant_detail.images[0];
      if (firstImage) {
        const imageUrl = extractImageUrl(firstImage);
        if (imageUrl) {
          return makeAbsoluteUrl(imageUrl);
        }
      }
    }
    
    // Fallback to product images from variant
    if (item.variant_detail?.product_images && Array.isArray(item.variant_detail.product_images) && item.variant_detail.product_images.length > 0) {
      const activeImage = item.variant_detail.product_images.find((img: any) => img?.is_active !== false);
      const firstImage = activeImage || item.variant_detail.product_images[0];
      if (firstImage) {
        console.log(firstImage);
        const imageUrl = extractImageUrl(firstImage);
        if (imageUrl) {
          return makeAbsoluteUrl(imageUrl);
        }
      }
    }
    
    // Fallback to product_detail images
    if (item.product_detail?.images && Array.isArray(item.product_detail.images) && item.product_detail.images.length > 0) {
      const activeImage = item.product_detail.images.find((img: any) => img?.is_active !== false);
      const firstImage = activeImage || item.product_detail.images[0];
      if (firstImage) {
        const imageUrl = extractImageUrl(firstImage);
        if (imageUrl) {
          return makeAbsoluteUrl(imageUrl);
        }
      }
    }
    
    return makeAbsoluteUrl("/assets/img/common/placeholder.png");
  };

  const getItemName = (item: OrderItem): string => {
    // Try product_name first (from order item)
    if (item.product_name && item.product_name.trim() !== '') {
      return item.product_name;
    }
    
    // Fallback to product_detail name
    if (item.product_detail?.name && item.product_detail.name.trim() !== '') {
      return item.product_detail.name;
    }
    
    // Fallback to variant name
    if (item.variant_detail?.name && item.variant_detail.name.trim() !== '') {
      return item.variant_detail.name;
    }
    
    // Fallback to variant SKU
    if (item.variant_detail?.sku && item.variant_detail.sku.trim() !== '') {
      return item.variant_detail.sku;
    }
    
    return "Product";
  };

  const getItemWeight = (item: OrderItem): string => {
    const weightGrams = item.variant_detail?.weight_grams;
    return formatWeight(weightGrams);
  };

  const itemsHTML = order.items && order.items.length > 0
    ? order.items.map((item: OrderItem, index: number) => {
        const productName = getItemName(item);
        const escapedName = escapeHtml(productName);
        const imageUrl = getItemImage(item);
        const weight = getItemWeight(item);
        
        return `
      <tr>
        <td style="text-align: center; color: #6b7280; padding: 4px 5px; font-size: 8px;">${index + 1}</td>
        <td style="padding: 4px 5px; font-size: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div>
              <div style="font-weight: 500; color: #1f2937; font-size: 8px;">${escapedName}</div>
            </div>
          </div>
        </td>
        <td style="text-align: center; padding: 4px 5px; font-size: 8px;">
          <span style="font-size: 8px; color: #6b7280; font-weight: 500;">${weight}</span>
        </td>
        <td style="text-align: center; padding: 4px 5px; font-size: 8px;">
          <span style="display: inline-block; padding: 3px 8px; background-color: #f3f4f6; border-radius: 3px; font-size: 8px; font-weight: 500;">${item.quantity}</span>
        </td>
        <td style="text-align: right; font-weight: 500; color: #1f2937; padding: 4px 5px; font-size: 8px;">${formatCurrency(item.unit_price)} BDT</td>
        <td style="text-align: right; font-weight: 600; color: #1f2937; padding: 4px 5px; font-size: 8px;">${formatCurrency(item.total_price)} BDT</td>
      </tr>
    `;
      }).join('')
    : '<tr><td colspan="6" style="text-align: center; padding: 15px; color: #6b7280; font-size: 8px;">No items found</td></tr>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 8px;
          line-height: 1.4;
          color: #1f2937;
          background: #ffffff;
          padding: 10mm;
        }
        .invoice-container {
          max-width: 100%;
          margin: 0 auto;
        }
        .invoice-header {
          text-align: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .invoice-header h2 {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .invoice-info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .invoice-section-title {
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #111827;
        }
        .invoice-info-card {
          background: #f9fafb;
          border-radius: 4px;
          padding: 8px;
          margin-bottom: 6px;
        }
        .invoice-info-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 8px;
        }
        .invoice-info-row:last-child {
          border-bottom: none;
        }
        .invoice-info-label {
          color: #6b7280;
          font-weight: 500;
        }
        .invoice-info-value {
          color: #1f2937;
          font-weight: 600;
          text-align: right;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 8px;
        }
        .invoice-table th {
          background: #f9fafb;
          padding: 5px 6px;
          text-align: left;
          font-weight: 600;
          font-size: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .invoice-table th:nth-child(3),
        .invoice-table th:nth-child(4) {
          text-align: center;
        }
        .invoice-table th:nth-child(5),
        .invoice-table th:nth-child(6) {
          text-align: right;
        }
        .invoice-table td {
          padding: 4px 5px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 8px;
        }
        .invoice-table tfoot td {
          border-top: 1px solid #e5e7eb;
          padding: 5px;
          font-size: 8px;
        }
        .invoice-table tfoot tr:last-child {
          background: #f9fafb;
          font-weight: 700;
        }
        .invoice-table tfoot tr:last-child td:last-child {
          font-size: 10px;
          color: #5caf90;
        }
        .invoice-note {
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
          border-radius: 3px;
          padding: 6px;
          margin-top: 10px;
          font-size: 7px;
          color: #1e40af;
          line-height: 1.5;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <h2>Invoice</h2>
        </div>

        <div class="invoice-info-section">
          <div>
            <h3 class="invoice-section-title">Bill To</h3>
            <div class="invoice-info-card">
              <div style="font-size: 10px; font-weight: 600; margin-bottom: 6px; color: #1f2937;">
                ${shippingAddress?.name || "N/A"}
              </div>
              <div style="font-size: 8px; color: #6b7280; line-height: 1.5;">
                <div style="margin-bottom: 4px;">${shippingAddress?.full_address || "N/A"}</div>
                <div style="margin-bottom: 4px;">
                  ${shippingAddress?.district || "N/A"}${shippingAddress?.postal_code ? `, ${shippingAddress.postal_code}` : ""}
                </div>
                <div style="margin-bottom: 6px;">${shippingAddress?.country_name || shippingAddress?.country || "N/A"}</div>
                ${shippingAddress?.phone ? `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #e5e7eb;">
                  <span style="color: #6b7280;">Phone:</span> <span style="font-weight: 500; color: #1f2937;">${shippingAddress.phone}</span>
                </div>` : ''}
                ${shippingAddress?.email ? `<div style="margin-top: 3px;">
                  <span style="color: #6b7280;">Email:</span> <span style="font-weight: 500; color: #1f2937;">${shippingAddress.email}</span>
                </div>` : ''}
              </div>
            </div>
          </div>

          <div>
            <h3 class="invoice-section-title">Order Details</h3>
            <div class="invoice-info-card">
              <div class="invoice-info-row">
                <span class="invoice-info-label">Order Number</span>
                <span class="invoice-info-value">${order.order_number || `#${order.id}`}</span>
              </div>
              <div class="invoice-info-row">
                <span class="invoice-info-label">Order Date</span>
                <span class="invoice-info-value">${formatDate(order.placed_at || order.created)}</span>
              </div>
              <div class="invoice-info-row">
                <span class="invoice-info-label">Status</span>
                <span class="invoice-info-value" style="color: #5caf90; text-transform: capitalize;">${order.status?.replace('_', ' ') || "N/A"}</span>
              </div>
              ${order.payment?.method ? `
              <div class="invoice-info-row">
                <span class="invoice-info-label">Payment Method</span>
                <span class="invoice-info-value">${order.payment.method}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>

        <h3 class="invoice-section-title" style="margin-top: 10px;">Order Items</h3>
        <table class="invoice-table">
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 40%;">Product</th>
              <th style="width: 12%; text-align: center;">Weight</th>
              <th style="width: 13%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Price</th>
              <th style="width: 15%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4"></td>
              <td style="font-weight: 600; text-align: right; font-size: 8px;">Sub Total</td>
              <td style="text-align: right; font-weight: 500; font-size: 8px;">${formatCurrency(subtotal)} BDT</td>
            </tr>
            ${discount > 0 ? `
            <tr>
              <td colspan="4"></td>
              <td style="font-weight: 600; text-align: right; font-size: 8px;">
                Discount${order.coupon_code ? `<br><span style="font-size: 7px; color: #6b7280; font-weight: 400;">(${escapeHtml(order.coupon_code)})</span>` : ''}
              </td>
              <td style="text-align: right; color: #10b981; font-weight: 500; font-size: 8px;">-${formatCurrency(discount)} BDT</td>
            </tr>
            ` : ''}
            ${shippingFee > 0 ? `
            <tr>
              <td colspan="4"></td>
              <td style="font-weight: 600; text-align: right; font-size: 8px;">Shipping Fee</td>
              <td style="text-align: right; font-weight: 500; font-size: 8px;">${formatCurrency(shippingFee)} BDT</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="4" style="padding: 5px; font-size: 7px; color: #6b7280;">
                ${escapeHtml(order.notes || "Thank you for your order!")}
              </td>
              <td style="font-weight: 700; text-align: right; padding: 5px; font-size: 9px;">Total</td>
              <td style="text-align: right; font-weight: 700; padding: 5px; font-size: 10px;">${formatCurrency(totalAmount)} BDT</td>
            </tr>
          </tfoot>
        </table>

        ${order.notes ? `
        <div class="invoice-note">
          <strong>Note:</strong> ${escapeHtml(order.notes)}
        </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
};
