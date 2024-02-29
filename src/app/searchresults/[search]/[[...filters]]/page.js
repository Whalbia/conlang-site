"use client"
import DictionaryCard from "@/app/components/dictionarycard"
import { useEffect } from "react"
import { useState } from "react"

export default function Page({params}) {
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        const search = params.search
        const filters = params.filters
        console.log("filters", filters)
        async function fetchData() {
            setLoading(true)
            const res = await fetch("http://localhost:3000/api/searchresults", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({search, filters})
            })
            const result = await res.json()
            setSearchResults(result)
            setLoading(false)
        }
        fetchData()
        
    }, [])

    useEffect(()=>{
        if(searchResults){
            console.log(searchResults)
            if(searchResults[0]){
                console.log(searchResults[0])
                console.log(searchResults[0].word)
                console.log(searchResults[0].definitions)
            }
        }
    }, [searchResults])


    return (
        <>
            {!loading ?
                searchResults.length > 0 ? 
                    <div className="w-full h-auto flex flex-row justify-center items-start px-[10vw] gap-x-7 flex-wrap mt-20">
                        <div className="w-[30vw] h-auto flex flex-col justify-start gap-5">
                            {searchResults.map((result, index)=>{
                                return index % 2 == 0 ? <DictionaryCard data={result}></DictionaryCard> : ''
                            })}
                        </div>
                        <div className="w-[30vw] h-auto flex flex-col justify-start gap-5">
                            {searchResults.map((result, index)=>{
                                return index % 2 == 1 ? <DictionaryCard data={result}></DictionaryCard> : ''
                            })}
                        </div>
                    </div>
                    :
                    <p>no result</p>
                :
                <p>loading</p>
            }
        </>
    )
}