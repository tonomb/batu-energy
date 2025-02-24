import { Providers } from "./providers"
import { Raleway } from 'next/font/google'

const raleway = Raleway({ subsets: ['latin'] })
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={raleway.className}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}