import Link from "next/link"

export default function Page() {
  return (
    <div className="overflow-hidden">
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <p className="">EPIK CONLANG SITE</p>
        <Link href='/edit' className="hover:text-red-600">Edit The Conlang</Link> 
      </div>
    </div>
  )
}