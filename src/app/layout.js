import './globals.css'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'

const corgy = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: '400'
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={corgy.className}>
      <body>
        <div className='sticky top-0 z-10 w-screen h-24 border-b-[1px] border-black flex flex-row justify-start bg-white'>
          <Link href='/' className="h-full w-24 flex flex-row justify-center items-center text-xl hover:bg-slate-300">Home</Link>
          <Link href='/edit' className="h-full w-24 flex flex-row justify-center items-center text-xl hover:bg-slate-300">Edit</Link>
        </div>
        {children}
      </body>
    </html>
  )
}
