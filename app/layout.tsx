import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { CSRFProvider } from '@/components/CSRFProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AutoAZ',
  description: 'Găsește mașina perfectă pentru tine.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CSRFProvider>
          {children}
        </CSRFProvider>
        <Script strategy="afterInteractive" id="crisp-widget">
          {`
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="d1a55aab-70bd-4e87-9865-0bb3ea362f24";
            (function(){
              d=document;
              s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `}
        </Script>
      </body>
    </html>
  )
}