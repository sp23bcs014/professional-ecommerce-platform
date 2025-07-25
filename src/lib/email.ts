import nodemailer from 'nodemailer';

// Create email transporter using your Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Welcome email template
export const sendWelcomeEmail = async (email: string, name: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to FrazModern!</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to FrazModern! 🎉</h1>
          <p>Your premium shopping experience starts here</p>
        </div>
        <div class="content">
          <h2>Hi ${name || 'there'}! 👋</h2>
          <p>Thank you for joining the FrazModern family! We're excited to have you on board.</p>
          
          <p>With your new account, you can:</p>
          <ul>
            <li>🛍️ Browse our premium product collection</li>
            <li>❤️ Save items to your wishlist</li>
            <li>🛒 Enjoy seamless checkout experience</li>
            <li>📦 Track your orders in real-time</li>
            <li>👤 Manage your profile and preferences</li>
          </ul>
          
          <p>Ready to start shopping?</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" class="button">
            Start Shopping Now! 🛍️
          </a>
          
          <p>If you have any questions, feel free to contact our support team at any time.</p>
          
          <div class="footer">
            <p>Happy Shopping! 🎊</p>
            <p>The FrazModern Team</p>
            <p><em>This email was sent from FrazModern - Your Premium Shopping Destination</em></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to FrazModern! 🎉
    
    Hi ${name || 'there'}!
    
    Thank you for joining the FrazModern family! We're excited to have you on board.
    
    With your new account, you can:
    • Browse our premium product collection
    • Save items to your wishlist
    • Enjoy seamless checkout experience
    • Track your orders in real-time
    • Manage your profile and preferences
    
    Ready to start shopping? Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products
    
    If you have any questions, feel free to contact our support team at any time.
    
    Happy Shopping! 🎊
    The FrazModern Team
  `;

  try {
    const info = await transporter.sendMail({
      from: `"FrazModern Store" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to FrazModern! 🎉 Your Premium Shopping Journey Begins",
      text: textContent,
      html: htmlContent,
    });

    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Order confirmation email template
export const sendOrderConfirmationEmail = async (email: string, name: string, orderId: number, items: any[], total: number) => {
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; text-align: left;">${item.name}</td>
      <td style="padding: 12px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px; text-align: right; font-weight: bold;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - FrazModern</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .order-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total-row { background: #e3f2fd; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f1f3f4; padding: 12px; text-align: left; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed! 🎉</h1>
          <p>Thank you for your purchase</p>
        </div>
        <div class="content">
          <h2>Hi ${name || 'there'}! 👋</h2>
          <p>Great news! Your order has been confirmed and is being processed.</p>
          
          <div class="order-summary">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> #${orderId}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> <span style="color: #2e7d32; font-size: 1.2em; font-weight: bold;">$${total.toFixed(2)}</span></p>
          </div>

          <h3>Items Ordered:</h3>
          <table style="border: 1px solid #ddd;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd;">Product</th>
                <th style="border: 1px solid #ddd; text-align: center;">Quantity</th>
                <th style="border: 1px solid #ddd; text-align: right;">Unit Price</th>
                <th style="border: 1px solid #ddd; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="3" style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">Grand Total:</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold; font-size: 1.1em;">$${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <p>🚚 <strong>What's Next?</strong></p>
          <ul>
            <li>We'll process your order within 1-2 business days</li>
            <li>You'll receive a shipping confirmation with tracking details</li>
            <li>Your order will be delivered within 3-7 business days</li>
          </ul>

          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders" class="button">
            Track Your Order 📦
          </a>

          <p>Need help? Contact our customer support team - we're here to help!</p>
          
          <div class="footer">
            <p>Thank you for choosing FrazModern! 🛍️</p>
            <p>The FrazModern Team</p>
            <p><em>This is an automated confirmation email for Order #${orderId}</em></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Order Confirmed! 🎉
    
    Hi ${name || 'there'}!
    
    Great news! Your order has been confirmed and is being processed.
    
    Order Details:
    Order Number: #${orderId}
    Order Date: ${new Date().toLocaleDateString()}
    Total Amount: $${total.toFixed(2)}
    
    Items Ordered:
    ${items.map(item => `• ${item.name} (Qty: ${item.quantity}) - $${(item.quantity * item.price).toFixed(2)}`).join('\n')}
    
    Grand Total: $${total.toFixed(2)}
    
    What's Next?
    • We'll process your order within 1-2 business days
    • You'll receive a shipping confirmation with tracking details
    • Your order will be delivered within 3-7 business days
    
    Track your order: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders
    
    Thank you for choosing FrazModern! 🛍️
    The FrazModern Team
  `;

  try {
    const info = await transporter.sendMail({
      from: `"FrazModern Store" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Order Confirmation #${orderId} - Thank you for your purchase! 🎉`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Order confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};
