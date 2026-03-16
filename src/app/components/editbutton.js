'use client'
import { useRouter } from "next/navigation"

export default function EditButton({wordID}){
    let router = useRouter()
    
    function handleClick() {
        router.push(`/edit/${wordID}`)
    }

    return (
        <button onClick={handleClick} className="border-black border-[1px] rounded-lg w-2/5 hover:bg-slate-300">Edit Word</button>
    )
}