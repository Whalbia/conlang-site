'use client'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Page() {
  let router = useRouter()

  function handleSubmit(formData) {
    const search = formData.get("search")
    router.push(`/searchresults/${search}`)
  }

  return (
    <div className="overflow-hidden">
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <p className="">EPIK CONLANG SITE</p>
        <Link href='/edit' className="hover:text-red-600">Edit The Conlang</Link>

        <form action={handleSubmit} id="SubmitForm">
          <div>
            <input className="border-black border-2" type="text" id="search" name="search"></input>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  )
}