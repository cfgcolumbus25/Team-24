# 🔔 CLEP Alert Workflow - Automated Email Notifications

## Overview

This n8n workflow automatically sends personalized email notifications to students when they receive their CLEP scores, providing them with nearby colleges that accept their credits.

## What It Does

**When triggered:**
1. Receives student score data via webhook
2. Queries nearby colleges that accept the CLEP credit
3. Formats a beautiful HTML email with personalized recommendations
4. Sends email automatically via Gmail

**Result:** Students receive actionable college recommendations within seconds of getting their score.

---

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Gmail account
- Google Cloud Console project (for OAuth)

### Installation

```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start
```

Open: http://localhost:5678

### Import Workflow

1. In n8n, go to **Workflows** → **Import from File**
2. Select `clep-alert.json` from this folder
3. Workflow loads with all nodes configured

---

## Gmail OAuth Setup

### 1. Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create project: `n8n-clep-alerts`
3. Enable **Gmail API**

### 2. Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Type: **External**
3. Add your email as test user
4. Save

### 3. Create Credentials

1. Go to **Credentials** → **Create OAuth 2.0 Client ID**
2. Type: **Web application**
3. Add redirect URI:
   ```
   http://localhost:5678/rest/oauth2-credential/callback
   ```
4. Save **Client ID** and **Client Secret**

### 4. Connect in n8n

1. Click **Gmail node** in workflow
2. Create new credential
3. Enter Client ID and Secret
4. Click **Sign in with Google**
5. Authorize

---

## 🧪 Testing

### 1. Activate Workflow

Toggle **Active** switch (top right) to **ON**

### 2. Get Webhook URL

Click **Webhook node** → Copy production URL:
```
http://localhost:5678/webhook/clep-alert
```

### 3. Send Test Request

```bash
curl -X POST http://localhost:5678/webhook/clep-alert \
  -H "Content-Type: application/json" \
  -d '{
    "studentEmail": "your-email@gmail.com",
    "studentName": "Test Student",
    "exam": "Biology",
    "score": 65,
    "zip": "22030"
  }'
```

### 4. Check Email

You should receive a formatted email with 5 college recommendations!

---

## Workflow Architecture

```
Webhook → Code Node → Gmail
```

### Webhook Node
- Receives POST requests with student data
- Production URL: `/webhook/clep-alert`
- Returns 200 OK on success

### Code Node: "Process & Format Email"
- Processes student information
- Queries colleges (currently mock data)
- Formats HTML email template
- Returns email-ready data structure

### Gmail Node
- Sends HTML email via OAuth
- Uses expressions to populate fields:
  - To: `{{ $json.to }}`
  - Subject: `{{ $json.subject }}`
  - Body: `{{ $json.html }}`

---
## Email Template

The automated email includes:

- **Header:** Personalized greeting with student name
- **Score Display:** Exam name and score
- **College Table:** 
  - College names
  - Course codes
  - Credit amounts
  - Distances from student
- **Next Steps:** Actionable guidance
- **CTA Button:** Link to College Board transcript
- **Footer:** Modern States branding

**Example:**
```
Congratulations, Alex!
Your Biology CLEP Score: 65

5 Nearby Colleges Accept Your Score!

┌─────────────────────────────┬────────────┬─────────┬──────────┐
│ College                     │ Course     │ Credits │ Distance │
├─────────────────────────────┼────────────┼─────────┼──────────┤
│ George Mason University     │ BIOL 103   │ 4       │ 12 mi    │
│ NOVA Community College      │ BIO 101    │ 3       │ 8 mi     │
│ University of Maryland      │ BSCI 105   │ 4       │ 15 mi    │
│ Virginia Tech               │ BIOL 1105  │ 4       │ 45 mi    │
│ James Madison University    │ BIO 114    │ 4       │ 78 mi    │
└─────────────────────────────┴────────────┴─────────┴──────────┘

Next Steps:
1. Contact admissions offices
2. Request CLEP transcript
3. Ask about credit transfer
4. Verify major requirements
```

---

## Integration with Backend

To integrate with your application:

```javascript
// When student receives CLEP score
const scoreData = {
  studentEmail: student.email,
  studentName: student.fullName,
  exam: score.examName,
  score: score.value,
  zip: student.zipCode
};

// Trigger n8n workflow
await fetch('http://localhost:5678/webhook/clep-alert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(scoreData)
});
```

---

## Troubleshooting

### "Webhook not registered"
- **Cause:** Workflow is inactive or using test URL
- **Fix:** Toggle workflow to Active, use production URL

### "json.to not defined"
- **Cause:** Data not passing from Code node
- **Fix:** Verify Code node returns `[{json: {to, subject, html}}]`

### Gmail authentication failed
- **Cause:** OAuth credentials incorrect or expired
- **Fix:** Re-authenticate in Gmail node settings

### No email received
- **Cause:** Gmail blocked, spam filter, or wrong email
- **Fix:** Check spam folder, verify email address, check n8n logs

---

## Performance

**Current Capacity (Local):**
- Concurrent requests: 10+
- Email delivery time: < 5 seconds
- Webhook response time: < 2 seconds

**Production Recommendations:**
- n8n Cloud or clustered deployment
- SendGrid/AWS SES for higher volume
- Redis caching for college data
- Database connection pooling

---

## Security Considerations

**Current (Development):**
- OAuth tokens stored locally in `~/.n8n/`
- No webhook authentication
- HTTP only (localhost)

**Production Requirements:**
- HTTPS only
- Webhook signature verification
- Rate limiting
- IP whitelisting
- OAuth token encryption
- FERPA compliance
- Regular security audits

---

## Additional Documentation

- **VISION.md** - Complete roadmap and future features
- **test-data.json** - Sample test commands
- **clep-alert.json** - Exportable workflow file

---

## Future Enhancements

### Medium-term (MVP → Production)
- [ ] Multi-channel notifications (SMS, push)
- [ ] Parent/guardian emails
- [ ] Follow-up email sequences
- [ ] Application status tracking

### Long-term (Scale)
- [ ] ML-powered recommendations
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] College partnership API

---

## Support

**Questions or Issues?**
- Email: armaankokan22@gmail.com
- See main project README for full documentation
- Check n8n docs: https://docs.n8n.io

---