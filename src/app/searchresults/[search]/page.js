// const res = await fetch("http://localhost:3000/api/searchresults", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({search})
//     })

"use client"
import { useEffect } from "react"

export default function Page({params}) {
    console.log("component rendered")

    useEffect(()=>{
        const search = params.search
        async function fetchData() {
            const res = await fetch("http://localhost:3000/api/searchresults", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({search})
            })
            const result = await res.json() 
            console.log(result[0].word)
            console.log(result[0].definitions)
            console.log(result[0].similar_words)
        }
        fetchData()
    }, [])

    return (
        <p>you are in search results congrats </p>
    )
}