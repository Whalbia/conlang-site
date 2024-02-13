'use client'
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
        <p className="text-7xl pb-8">Conlang Name</p>
        <div>
          <form action={handleSubmit} id="SubmitForm">
            <div>
              {/* Search Icon */}
              <input className="border-black border-[1px] rounded-lg w-96 h-8" type="text" id="search" name="search" placeholder="Search the conlang"></input>
            </div>

            <input type="submit" className="hover:cursor-pointer"></input>

            {/* <div>
              <div>
                <p>Search In:</p>

                <input type="checkbox" id="words" name="words"></input>
                <label htmlFor="words">Words</label>

                <input type="checkbox" id="definitions" name="definitions"></input>
                <label htmlFor="definitions">Definitions</label>

                <input type="checkbox" id="rootsAffixes" name="rootsAffixes"></input>
                <label htmlFor="rootsAffixes">Roots/Affixes</label>
              </div>
              <div>
                <p>Filter By:</p>

                <div>
                  <input type="checkbox" id="ilAel" name="ilAel"></input>
                  <label htmlFor="ilAel">Has Il/Ael Contrast</label>
                </div>

                <div>
                  <input type="checkbox" id="noun" name="noun"></input>
                  <label htmlFor="noun">Noun</label>

                  <input type="checkbox" id="verb" name="verb"></input>
                  <label htmlFor="verb">Verb</label>

                  <input type="checkbox" id="adjective" name="adjective"></input>
                  <label htmlFor="adjective">Adjective</label>
                </div>

                <div>
                  <input type="checkbox" id="yt" name="yt"></input>
                  <label htmlFor="yt">-yt Verb</label>

                  <input type="checkbox" id="uk" name="uk"></input>
                  <label htmlFor="uk">-uk Verb</label>
                </div>
              </div>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  )
}