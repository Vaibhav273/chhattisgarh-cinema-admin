import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { logger } from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';

// ═══════════════════════════════════════════════════════════════
// 🔐 SECRETS CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const emailUser = defineSecret('EMAIL_USER');
const emailPassword = defineSecret('EMAIL_PASSWORD');

// ═══════════════════════════════════════════════════════════════
// 📧 EMAIL TRANSPORTER
// ═══════════════════════════════════════════════════════════════

function getTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser.value(),
            pass: emailPassword.value(),
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// 🎨 BEAUTIFUL EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════

function getCriticalErrorEmailHtml(log: any, logId: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Critical Error Alert</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          line-height: 1.6;
        }
        
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding: 50px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: pulse 3s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        .icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          animation: shake 0.5s ease-in-out infinite;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .header h1 {
          color: white;
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          position: relative;
          z-index: 1;
        }
        
        .header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin-top: 8px;
          position: relative;
          z-index: 1;
        }
        
        .content {
          padding: 40px;
        }
        
        .alert-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 2px solid #ef4444;
          color: #dc2626;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 800;
          color: #1f2937;
          margin: 30px 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .info-card {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #e5e7eb;
        }
        
        .info-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 700;
          color: #6b7280;
          min-width: 120px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          color: #1f2937;
          font-weight: 600;
          flex: 1;
        }
        
        .level-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          color: #dc2626;
          border: 2px solid #ef4444;
        }
        
        .metadata-box {
          background: #1f2937;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
          overflow-x: auto;
        }
        
        .metadata-box pre {
          color: #10b981;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 800;
          font-size: 14px;
          margin-top: 30px;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
        }
        
        .footer {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          padding: 30px 40px;
          text-align: center;
          color: #9ca3af;
        }
        
        .footer-logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          border-radius: 16px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }
        
        .footer p {
          margin: 8px 0;
          font-size: 12px;
        }
        
        .footer-links {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #374151;
        }
        
        .footer-link {
          color: #a855f7;
          text-decoration: none;
          margin: 0 10px;
          font-weight: 600;
        }
        
        .timestamp {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          margin-top: 10px;
        }
        
        @media only screen and (max-width: 600px) {
          body {
            padding: 20px 10px;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .header {
            padding: 40px 20px;
          }
          
          .info-row {
            flex-direction: column;
          }
          
          .info-label {
            min-width: auto;
            margin-bottom: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <div class="icon-wrapper">
            🚨
          </div>
          <h1>Critical Error Detected</h1>
          <p>Immediate attention required</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <div class="alert-badge">
            ⚠️ High Priority Alert
          </div>
          
          <p style="color: #4b5563; font-size: 15px; margin-bottom: 25px;">
            A critical error has been logged in your <strong>Chhattisgarh Cinema</strong> system. 
            Please review the details below and take necessary action.
          </p>
          
          <!-- Error Details Card -->
          <div class="section-title">
            📋 Error Details
          </div>
          
          <div class="info-card">
            <div class="info-row">
              <div class="info-label">⏰ Time</div>
              <div class="info-value">
                ${log.timestamp?.toDate().toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'long',
        timeZone: 'Asia/Kolkata',
    }) || 'N/A'}
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">👤 User</div>
              <div class="info-value">
                <strong>${log.userName || 'Unknown User'}</strong><br>
                <span style="color: #6b7280; font-size: 13px;">${log.userEmail || 'No email'}</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">📦 Module</div>
              <div class="info-value">
                ${log.module || 'N/A'}${log.subModule ? ` → ${log.subModule}` : ''}
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">⚡ Action</div>
              <div class="info-value">${log.action || 'N/A'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">🎯 Level</div>
              <div class="info-value">
                <span class="level-badge">❌ ${log.level?.toUpperCase() || 'ERROR'}</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">📝 Status</div>
              <div class="info-value">
                <span style="color: #dc2626; font-weight: 700;">${log.status || 'Failed'}</span>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <div class="section-title">
            💬 Description
          </div>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; color: #991b1b; font-weight: 500;">
            ${log.description || 'No description provided'}
          </div>
          
          ${log.metadata && Object.keys(log.metadata).length > 0 ? `
          <!-- Metadata -->
          <div class="section-title">
            🔍 Additional Information
          </div>
          
          <div class="metadata-box">
            <pre>${JSON.stringify(log.metadata, null, 2)}</pre>
          </div>
          ` : ''}
          
          ${log.ipAddress ? `
          <div class="timestamp">
            🌐 IP Address: ${log.ipAddress}
          </div>
          ` : ''}
          
          <!-- CTA Button -->
          <center>
            <a href="https://your-admin-url.com/activity-logs" class="cta-button">
              👁️ View in Dashboard →
            </a>
          </center>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
            Log ID: <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; color: #1f2937;">${logId}</code>
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo">
            🎬
          </div>
          <p style="font-weight: 700; color: #d1d5db; font-size: 14px;">Chhattisgarh Cinema</p>
          <p>This is an automated alert from your admin system</p>
          <p style="margin-top: 15px;">
            <strong>Need help?</strong> Contact your system administrator
          </p>
          
          <div class="footer-links">
            <a href="https://your-admin-url.com/dashboard" class="footer-link">Dashboard</a>
            <a href="https://your-admin-url.com/activity-logs" class="footer-link">Activity Logs</a>
            <a href="https://your-admin-url.com/settings" class="footer-link">Settings</a>
          </div>
          
          <p style="margin-top: 20px; color: #6b7280; font-size: 11px;">
            © ${new Date().getFullYear()} Chhattisgarh Cinema. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getDailySummaryEmailHtml(
    errors: any[],
    errorsByModule: Record<string, number>,
    date: Date
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Error Summary</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          line-height: 1.6;
        }
        
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          padding: 50px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        
        .icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
        }
        
        .header h1 {
          color: white;
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          position: relative;
          z-index: 1;
        }
        
        .header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin-top: 8px;
          position: relative;
          z-index: 1;
        }
        
        .content {
          padding: 40px;
        }
        
        .stat-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 30px 0;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 2px solid #ef4444;
          border-radius: 16px;
          padding: 25px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 36px;
          font-weight: 900;
          color: #dc2626;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 13px;
          font-weight: 700;
          color: #991b1b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .module-list {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 16px;
          padding: 25px;
          margin: 20px 0;
        }
        
        .module-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .module-item:last-child {
          border-bottom: none;
        }
        
        .module-name {
          font-weight: 700;
          color: #1f2937;
        }
        
        .module-count {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 14px;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 800;
          font-size: 14px;
          margin-top: 30px;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }
        
        .footer {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          padding: 30px 40px;
          text-align: center;
          color: #9ca3af;
        }
        
        .footer-logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          border-radius: 16px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }
        
        @media only screen and (max-width: 600px) {
          .stat-cards {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <div class="icon-wrapper">
            📊
          </div>
          <h1>Daily Error Summary</h1>
          <p>${date.toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <p style="color: #4b5563; font-size: 15px; margin-bottom: 25px;">
            Here's your daily error report for <strong>Chhattisgarh Cinema</strong>. 
            Review the summary below to stay informed about system health.
          </p>
          
          <!-- Stats -->
          <div class="stat-cards">
            <div class="stat-card">
              <div class="stat-number">${errors.length}</div>
              <div class="stat-label">Total Errors</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${Object.keys(errorsByModule).length}</div>
              <div class="stat-label">Affected Modules</div>
            </div>
          </div>
          
          <!-- Errors by Module -->
          <h3 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px; font-weight: 800;">
            📦 Errors by Module
          </h3>
          
          <div class="module-list">
            ${Object.entries(errorsByModule)
            .sort(([, a], [, b]) => b - a)
            .map(
                ([module, count]) => `
                <div class="module-item">
                  <div class="module-name">${module}</div>
                  <div class="module-count">${count}</div>
                </div>
              `
            )
            .join('')}
          </div>
          
          <!-- CTA -->
          <center>
            <a href="https://your-admin-url.com/activity-logs" class="cta-button">
              📋 View Detailed Logs →
            </a>
          </center>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
            This is an automated daily report generated at ${new Date().toLocaleTimeString('en-IN')}
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo">
            🎬
          </div>
          <p style="font-weight: 700; color: #d1d5db; font-size: 14px;">Chhattisgarh Cinema</p>
          <p>Daily System Report</p>
          <p style="margin-top: 20px; color: #6b7280; font-size: 11px;">
            © ${new Date().getFullYear()} Chhattisgarh Cinema. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ═══════════════════════════════════════════════════════════════
// 🚨 SEND CRITICAL ERROR ALERTS
// ═══════════════════════════════════════════════════════════════

export const sendCriticalErrorAlert = onDocumentCreated(
    {
        document: 'activityLogs/{logId}',
        region: 'asia-south1',
        secrets: [emailUser, emailPassword],
    },
    async (event) => {
        try {
            const log = event.data?.data();
            if (!log) return;

            // Only send alerts for ERROR level logs
            if (log.level !== 'error') {
                return;
            }

            logger.info('🚨 Critical error detected, sending email alert...');

            const db = admin.firestore();

            // Get all Super Admins
            const superAdminsSnapshot = await db
                .collection('admins')
                .where('role', '==', 'super_admin')
                .get();

            if (superAdminsSnapshot.empty) {
                logger.warn('⚠️ No Super Admins found to send alert');
                return;
            }

            const superAdminEmails = superAdminsSnapshot.docs
                .map((doc) => doc.data().email)
                .filter((email) => email);

            if (superAdminEmails.length === 0) {
                logger.warn('⚠️ No Super Admin emails found');
                return;
            }

            // ✅ Use Beautiful Email Template
            const emailHtml = getCriticalErrorEmailHtml(log, event.params.logId);

            const transporter = getTransporter();

            // Send email to all Super Admins
            await transporter.sendMail({
                from: '"Chhattisgarh Cinema Alerts" <alerts@cgcinema.com>',
                to: superAdminEmails.join(', '),
                subject: `🚨 Critical Error Alert - ${log.module} - ${log.action}`,
                html: emailHtml,
            });

            logger.info('✅ Critical error alert sent to Super Admins');

            // Log the alert in system logs
            await db.collection('systemLogs').add({
                action: 'critical_error_alert_sent',
                module: 'system',
                subModule: 'alerts',
                performedBy: {
                    uid: 'system',
                    email: 'system@automated',
                    name: 'System',
                    role: 'system',
                },
                details: {
                    logId: event.params.logId,
                    recipientCount: superAdminEmails.length,
                    errorModule: log.module,
                    errorAction: log.action,
                },
                timestamp: admin.firestore.Timestamp.now(),
                status: 'success',
            });
        } catch (error) {
            logger.error('❌ Failed to send critical error alert:', error);
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// 📊 DAILY ERROR SUMMARY EMAIL (Runs at 9 AM IST)
// ═══════════════════════════════════════════════════════════════

export const sendDailyErrorSummary = onSchedule(
    {
        schedule: '0 9 * * *',
        timeZone: 'Asia/Kolkata',
        region: 'asia-south1',
        secrets: [emailUser, emailPassword],
    },
    async (event) => {
        try {
            logger.info('📊 Generating daily error summary...');

            const db = admin.firestore();

            // Get yesterday's errors
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const errorsQuery = db
                .collection('activityLogs')
                .where('level', '==', 'error')
                .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(yesterday))
                .where('timestamp', '<', admin.firestore.Timestamp.fromDate(today));

            const errorsSnapshot = await errorsQuery.get();

            if (errorsSnapshot.empty) {
                logger.info('✅ No errors yesterday - no summary needed');
                return;
            }

            const errors = errorsSnapshot.docs.map((doc) => doc.data());

            // Group errors by module
            const errorsByModule: Record<string, number> = {};
            errors.forEach((error) => {
                const module = error.module || 'Unknown';
                errorsByModule[module] = (errorsByModule[module] || 0) + 1;
            });

            // Get Super Admin emails
            const superAdminsSnapshot = await db
                .collection('admins')
                .where('role', '==', 'super_admin')
                .get();

            const superAdminEmails = superAdminsSnapshot.docs
                .map((doc) => doc.data().email)
                .filter((email) => email);

            if (superAdminEmails.length === 0) {
                logger.warn('⚠️ No Super Admin emails found');
                return;
            }

            // ✅ Use Beautiful Email Template
            const emailHtml = getDailySummaryEmailHtml(errors, errorsByModule, yesterday);

            const transporter = getTransporter();

            await transporter.sendMail({
                from: '"Chhattisgarh Cinema Reports" <reports@cgcinema.com>',
                to: superAdminEmails.join(', '),
                subject: `📊 Daily Error Summary - ${errors.length} errors on ${yesterday.toDateString()}`,
                html: emailHtml,
            });

            logger.info('✅ Daily error summary sent');
        } catch (error) {
            logger.error('❌ Failed to send daily summary:', error);
        }
    }
);
