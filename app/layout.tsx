import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Receipt Manager Pro',
  keywords: ['receipt', 'manager', 'pro', 'create', 'design', 'share', 'cloud storage'],
  authors: [{ name: 'untinosz', url: 'https://untinosz.com' }],
  openGraph: {
    title: 'Receipt Manager Pro',
    description: 'Create, design, and share professional receipts with cloud storage',
    url: 'https://receipt-manager-pro.v0.dev',
  },
  description: 'Create, design, and share professional receipts with cloud storage',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
