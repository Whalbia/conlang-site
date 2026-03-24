import './globals.css'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'

const corgy = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: '500'
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={corgy.className}>
      <body className='overflow-y-auto overflow-x-hidden'>
        <nav className='sticky top-0 z-10 w-screen h-14 border-b border-[#E8E2DA] flex flex-row items-center px-12 bg-[#FAFAF8]'>
          <Link href='/' className="text-[22px] font-bold italic text-[#1A1A1A] hover:opacity-70 transition-opacity">Kagetw</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
