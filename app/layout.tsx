import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'ข่าวสดออนไลน์';
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'แหล่งข่าวออนไลน์ครบทุกมิติ';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  keywords: ['ข่าว', 'ข่าวไทย', 'สื่อออนไลน์', 'ข่าวด่วน'],
  authors: [{ name: siteName }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  verification: {
    google: 'Zx0iey9R6BWHUzsFhQ0NJN_2npbbam_wqJSp8YpNePA',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9250532329693433"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
