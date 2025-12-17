import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '五险一金计算器',
  description: '企业五险一金费用计算工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}