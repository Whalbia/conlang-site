'use client'
import { useRouter } from "next/navigation"

export default function Page() {
  let router = useRouter()

  function handleSubmit(formData) {
    const search = formData.get("search")=='' ? "all_results": formData.get("search")
    formData.delete("search")
    let URL = `/searchresults/${search}`

    for (const key of formData.keys()){
      URL = URL.concat(`/${key}`)
    }

    router.push(URL)
  }

  return (
    <div className="overflow-hidden">
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <p className="text-7xl pb-8">Conlang Name</p>
        <div className="w-full">
          <form action={handleSubmit} id="SubmitForm" className="w-full flex flex-col items-center gap-y-5">
            <div className="border-black border-[1px] rounded-lg w-2/5 h-10 flex flex-row justify-start items-center pl-1">
              <button type="submit" className="hover:cursor-pointer" value={''}></button>
              <input className="focus:outline-none focus:placeholder:text-transparent w-full" type="text" id="search" name="search" placeholder="Search the conlang"></input>
            </div>

            <div className="flex flex-row w-2/5 h-[35vh] rounded-lg border-black border-[1px]">
              <div className="flex flex-col items-start justify-start gap-y-3 p-5 border-black border-r-[1px] w-1/4">
                <p className="text-2xl">Search In:</p>

                <div className="flex flex-row items-center gap-x-1 text-lg">
                  <input type="checkbox" id="words" name="words"></input>
                  <label htmlFor="words">Words</label>
                </div>

                <div className="flex flex-row items-center gap-x-1 text-lg">
                  <input type="checkbox" id="definitions" name="definitions"></input>
                  <label htmlFor="definitions">Definitions</label>
                </div>

                <div className="flex flex-row items-center gap-x-1 text-lg">
                  <input type="checkbox" id="rootsAffixes" name="rootsAffixes"></input>
                  <label htmlFor="rootsAffixes">Roots/Affixes</label>
                </div>
              </div>
              <div className="flex flex-col items-start justify-start gap-y-3 p-5 w-3/4">
                <p className="text-2xl">Filter By:</p>

                <div className="flex flex-row items-center gap-x-1 text-lg">
                  <input type="checkbox" id="ilAel" name="ilAel"></input>
                  <label htmlFor="ilAel">Has Il/Ael Contrast</label>
                </div>

                <div className="flex flex-row flex-wrap items-center gap-x-4 text-lg">
                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="noun" name="noun"></input>
                    <label htmlFor="noun">Noun</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="verb" name="verb"></input>
                    <label htmlFor="verb">Verb</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="adjective" name="adjective"></input>
                    <label htmlFor="adjective">Adjective</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="stative" name="stative"></input>
                    <label htmlFor="stative">Stative</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="pronoun" name="pronoun"></input>
                    <label htmlFor="pronoun">Pronoun</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="disc_part" name="disc_part"></input>
                    <label htmlFor="disc_part">Adjective</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="phrase" name="phrase"></input>
                    <label htmlFor="phrase">Phrase</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="misc" name="misc"></input>
                    <label htmlFor="misc">Miscellaneous</label>
                  </div>
                </div>

                <div className="flex flex-row flex-wrap w-4/6 items-center gap-x-4 text-lg">
                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="yt" name="yt"></input>
                    <label htmlFor="yt">-yt Verb</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="uk" name="uk"></input>
                    <label htmlFor="uk">-uk Verb</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="vu" name="vu"></input>
                    <label htmlFor="vu">-vu Verb</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="la" name="la"></input>
                    <label htmlFor="la">-la Verb</label>
                  </div>

                  <div className="flex flex-row items-center gap-x-1">
                    <input type="checkbox" id="misc_v" name="misc_v"></input>
                    <label htmlFor="misc_v">Miscellaneous</label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}