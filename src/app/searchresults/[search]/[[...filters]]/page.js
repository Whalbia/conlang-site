"use client"
import DictionaryCard from "@/app/components/dictionarycard"
import { useEffect } from "react"
import { useState } from "react"

export default function Page({params}) {
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        const search = params.search
        const filters = params.filters || []

        // separate searchIn vs filter params
        const searchInOptions = ["words", "definitions", "rootsAffixes", "etymologically"]
        const searchIn = filters.filter(f => searchInOptions.includes(f))
        const filterBy = filters.filter(f => !searchInOptions.includes(f))

        // if no searchIn specified, default to words
        if (searchIn.length === 0) searchIn.push("words")

        async function fetchData() {
            setLoading(true)
            const queryParams = new URLSearchParams()
            queryParams.set("search", search)
            searchIn.forEach(s => queryParams.append("searchIn", s))
            filterBy.forEach(f => queryParams.append("filter", f))

            const res = await fetch(`/api/words?${queryParams.toString()}`)
            const result = await res.json()
            setSearchResults(result)
            setLoading(false)
        }
        fetchData()

    }, [])

    return (
        <>
            {!loading ?
                searchResults.length > 0 ?
                    <div className="w-full h-auto flex flex-row justify-center items-start px-[10vw] gap-x-7 flex-wrap mt-20">
                        <div className="w-[30vw] h-auto flex flex-col justify-start gap-5">
                            {searchResults.map((result, index)=>{
                                return index % 2 == 0 ? <DictionaryCard key={result.wordId} data={result}></DictionaryCard> : ''
                            })}
                        </div>
                        {searchResults.length > 1 ?
                            <div className="w-[30vw] h-auto flex flex-col justify-start gap-5">
                            {searchResults.map((result, index)=>{
                                return index % 2 == 1 ? <DictionaryCard key={result.wordId} data={result}></DictionaryCard> : ''
                            })}
                        </div>
                        : ''}
                    </div>
                    :
                    <p>no result</p>
                :
                <p>loading</p>
            }
        </>
    )
}
