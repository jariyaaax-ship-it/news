import nodemailer from 'nodemailer';

type RegistrationCodeEmail = {
  to: string;
  name: string;
  code: string;
};

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export async function sendRegistrationCode({ to, name, code }: RegistrationCodeEmail) {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !from || !user || !password) {
    throw new Error('SMTP is not configured');
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });

  const safeName = name.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[char];
  });
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'ข่าวสดออนไลน์';

  await transporter.sendMail({
    from,
    to,
    subject: `รหัสยืนยันการสมัครสมาชิก ${siteName}`,
    text: `สวัสดี ${name}\n\nรหัสยืนยันการสมัครสมาชิกของคุณคือ ${code}\nรหัสนี้ใช้ได้ 10 นาที และใช้ได้ครั้งเดียว\n\nหากคุณไม่ได้สมัครสมาชิก สามารถลบอีเมลฉบับนี้ได้`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1f2937"><h2>${siteName}</h2><p>สวัสดี ${safeName}</p><p>รหัสยืนยันการสมัครสมาชิกของคุณคือ</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;background:#eff6ff;padding:16px;text-align:center">${code}</p><p>รหัสนี้ใช้ได้ 10 นาทีและใช้ได้ครั้งเดียว</p><p style="color:#6b7280;font-size:13px">หากคุณไม่ได้สมัครสมาชิก สามารถลบอีเมลฉบับนี้ได้</p></div>`,
  });
}
