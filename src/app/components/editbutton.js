'use client'
import { useRouter } from "next/navigation"

export default function EditButton({wordID}){
    let router = useRouter()
    
    function handleClick() {
        router.push(`/edit/${wordID}`)
    }

    return (
        <button onClick={handleClick}>click me</button>
    )
}