# Email Configuration Setup Guide

## For New Client - Email Setup Instructions

### Step 1: Choose Your Email Method

#### Option A: Use Your Gmail Business Account (Easiest)
1. Go to your Google Account: https://myaccount.google.com/
2. Click "Security" → "2-Step Verification" → "App passwords"
3. Generate an app password for "Mail"
4. Copy the 16-character password

#### Option B: Use Professional Email Service (Recommended for Business)
- **SendGrid**: Professional email delivery service
- **Mailgun**: Reliable email API service
- **Your hosting provider**: If you have business hosting

### Step 2: Update Environment Variables

Open your `.env.local` file and replace these values:

```bash
# Replace with YOUR email settings
SMTP_HOST=smtp.gmail.com                    # Your SMTP server
SMTP_PORT=465                               # Your SMTP port
SMTP_USER=your-business-email@gmail.com     # Your email address
SMTP_PASS=your-app-password-here            # Your app password (NOT regular password)
```

### Step 3: Update Email Branding

In the file `src/app/api/orders/route.ts`, find this line and update:

```javascript
from: 'Your Business Name <no-reply@yourdomain.com>',
```

Replace with your business name and domain.

### Step 4: Test Email Functionality

1. Start your application: `npm run dev`
2. Create a test order
3. Check if confirmation email arrives
4. If issues, check the server console for error messages

### Email Template Customization

The order confirmation email can be customized in:
- File: `src/app/api/orders/route.ts`
- Look for the `sendMail` function
- Modify the `subject`, `text`, and `html` content

### Common Email Providers Settings:

**Gmail:**
```
Host: smtp.gmail.com
Port: 465
User: your-email@gmail.com
Pass: app-password (16 characters)
```

**Outlook/Hotmail:**
```
Host: smtp-mail.outlook.com
Port: 587
User: your-email@outlook.com
Pass: your-password
```

**Yahoo:**
```
Host: smtp.mail.yahoo.com
Port: 465
User: your-email@yahoo.com
Pass: app-password
```

### Security Notes:
- Never use your regular email password
- Always use app passwords or API keys
- Keep your `.env.local` file private
- Don't commit `.env.local` to version control

### Support:
If you need help setting up emails, contact your developer with:
1. Your chosen email provider
2. Any error messages from the console
3. Screenshots of the issue
