import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "한의원 보험 적용 확인 - 한방 첩약 보험 정보",
  description:
    "한의원명으로 보험 적용 여부를 쉽게 확인할 수 있는 서비스입니다. 한방 첩약 보험 적용 정보를 제공합니다.",
  keywords: ["한의원", "보험", "한방", "첩약", "건강보험", "한의원 찾기"],
  authors: [{ name: "한의원 보험 확인 시스템" }],
  verification: {
    other: {
      "naver-site-verification": "5dfcb574f5eb6ef626e6731a9652e955b7db142a",
    },
  },
  openGraph: {
    title: "한의원 보험 적용 확인",
    description: "한의원명으로 보험 적용 여부를 쉽게 확인할 수 있는 서비스",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          type="text/javascript"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}`}
        ></Script>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-N2DKZ2MX');
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N2DKZ2MX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {children}
      </body>
    </html>
  );
}
