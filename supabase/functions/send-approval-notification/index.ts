import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  email: string;
  formType: 'stationery' | 'office-items' | 'volunteer';
}

async function sendEmailViaSMTP(
  to: string,
  subject: string,
  html: string,
  from: string,
  smtpUser: string,
  smtpPass: string
) {
  const boundary = `boundary_${Date.now()}`;
  const emailContent = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    html,
    `--${boundary}--`,
  ].join('\r\n');

  const conn = await Deno.connect({
    hostname: "smtp.gmail.com",
    port: 587,
  });

  const textDecoder = new TextDecoder();
  const textEncoder = new TextEncoder();

  async function read() {
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    if (n === null) return null;
    return textDecoder.decode(buffer.subarray(0, n));
  }

  async function write(data: string) {
    await conn.write(textEncoder.encode(data + '\r\n'));
  }

  try {
    await read();
    await write('EHLO localhost');
    await read();

    await write('STARTTLS');
    await read();

    const tlsConn = await Deno.startTls(conn, {
      hostname: "smtp.gmail.com",
    });

    async function tlsRead() {
      const buffer = new Uint8Array(1024);
      const n = await tlsConn.read(buffer);
      if (n === null) return null;
      return textDecoder.decode(buffer.subarray(0, n));
    }

    async function tlsWrite(data: string) {
      await tlsConn.write(textEncoder.encode(data + '\r\n'));
    }

    await tlsWrite('EHLO localhost');
    await tlsRead();

    await tlsWrite('AUTH LOGIN');
    await tlsRead();

    await tlsWrite(btoa(smtpUser));
    await tlsRead();

    await tlsWrite(btoa(smtpPass));
    const authResponse = await tlsRead();

    if (authResponse && !authResponse.includes('235')) {
      throw new Error('SMTP Authentication failed');
    }

    await tlsWrite(`MAIL FROM: <${smtpUser}>`);
    await tlsRead();

    await tlsWrite(`RCPT TO: <${to}>`);
    await tlsRead();

    await tlsWrite('DATA');
    await tlsRead();

    await tlsWrite(emailContent);
    await tlsWrite('.');
    await tlsRead();

    await tlsWrite('QUIT');
    tlsConn.close();

    return { success: true };
  } catch (error) {
    conn.close();
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, formType }: RequestBody = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const approvalMessage = formType === 'volunteer'
      ? 'We are pleased to inform you that your volunteer registration has been approved. Thank you for your interest in supporting our school community.'
      : 'We are pleased to inform you that your request has been approved. Kindly, collect the items from school office during the working hours.';

    const formTypeText = formType === 'office-items'
      ? 'Office Items Request'
      : formType === 'volunteer'
      ? 'Volunteer Registration'
      : 'Stationery Voucher Request';

    const GMAIL_USER = Deno.env.get('GMAIL_USER');
    const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD');

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.log(`[DEMO MODE] Would send email to ${email} for ${formTypeText}`);
      console.log(`Subject: ${formTypeText} - Approved`);
      console.log(`Message: ${approvalMessage}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Approval notification logged (demo mode - configure GMAIL_USER and GMAIL_APP_PASSWORD to send actual emails)',
          demo: true,
          emailData: {
            to: email,
            subject: `${formTypeText} - Approved`,
            message: approvalMessage
          }
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .message { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Faafu Atoll School</h1>
              <p style="margin: 10px 0 0 0;">Request Approval Notification</p>
            </div>
            <div class="content">
              <h2 style="color: #2563eb;">Request Approved!</h2>
              <p>Dear Applicant,</p>
              <div class="message">
                <strong>Your ${formTypeText} has been approved.</strong>
              </div>
              <p>${approvalMessage}</p>
              <p style="margin-top: 30px;">Best regards,<br><strong>Faafu Atoll School Administration</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmailViaSMTP(
      email,
      `${formTypeText} - Approved`,
      emailHtml,
      `Faafu Atoll School <${GMAIL_USER}>`,
      GMAIL_USER,
      GMAIL_APP_PASSWORD
    );

    console.log('Email sent successfully to:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Approval notification sent successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send notification', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});