"use client"
import DictionaryCard from "@/app/components/dictionarycard"
import { useEffect } from "react"
import { useState } from "react"

export default function Page({params}) {
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        const search = params.search
        async function fetchData() {
            setLoading(true)
            const res = await fetch("http://localhost:3000/api/searchresults", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({search})
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
                    <div className="w-full h-auto flex flex-row justify-center items-start px-[20vw] gap-5 flex-wrap mt-20">
                        {searchResults.map((result)=>{
                            return <DictionaryCard data={result}></DictionaryCard>
                            {/*Turn into two flex colums */}
                        })}
                    </div>
                    :
                    <p>no result</p>
                :
                <p>loading</p>
            }
        </>
    )
}