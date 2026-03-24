"use client"
import DictionaryCard from "@/app/components/dictionarycard"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const searchInOptions = ["words", "definitions", "rootsAffixes", "etymologically"]
const allFilterKeys = [
    "noun", "verb", "adjective", "stative", "pronoun",
    "disc_part", "phrase", "misc", "yt", "uk", "vu", "la", "misc_v", "ilAel"
]

const mainFilters = [
    { key: 'noun', label: 'Noun' },
    { key: 'verb', label: 'Verb' },
    { key: 'adjective', label: 'Adj.' },
    { key: 'stative', label: 'Stative' },
]
const moreFilters = [
    { key: 'pronoun', label: 'Pronoun' },
    { key: 'disc_part', label: 'Disc. Particle' },
    { key: 'phrase', label: 'Phrase' },
    { key: 'misc', label: 'Misc.' },
    { key: 'ilAel', label: 'Il/Ael Contrast' },
]
const verbFilters = [
    { key: 'yt', label: '-yt' },
    { key: 'uk', label: '-uk' },
    { key: 'vu', label: '-vu' },
    { key: 'la', label: '-la' },
    { key: 'misc_v', label: 'Misc. Verb' },
]

export default function Page({params}) {
    const router = useRouter()
    const urlFilters = params.filters || []

    // Initialize state from URL params
    const initialSearchIn = {}
    for (const key of searchInOptions) {
        initialSearchIn[key] = urlFilters.includes(key)
    }
    // If none were in URL, default to words
    if (!Object.values(initialSearchIn).some(v => v)) initialSearchIn.words = true

    const initialFilters = {}
    for (const key of allFilterKeys) {
        initialFilters[key] = urlFilters.includes(key)
    }

    const searchTerm = decodeURIComponent(params.search)
    const isAllResults = searchTerm === 'all_results'

    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [visibleCount, setVisibleCount] = useState(0)
    const [newSearch, setNewSearch] = useState(isAllResults ? '' : searchTerm)
    const [searchIn, setSearchIn] = useState(initialSearchIn)
    const [filters, setFilters] = useState(initialFilters)
    const [showMoreFilters, setShowMoreFilters] = useState(
        moreFilters.some(f => initialFilters[f.key])
    )

    function toggleSearchIn(key) {
        setSearchIn(prev => ({ ...prev, [key]: !prev[key] }))
    }
    function toggleFilter(key) {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }))
    }

    function handleNewSearch(e) {
        e.preventDefault()
        const term = newSearch.trim() === '' ? 'all_results' : newSearch.trim()
        let URL = `/searchresults/${term}`
        Object.entries(searchIn).forEach(([key, val]) => { if (val) URL += `/${key}` })
        Object.entries(filters).forEach(([key, val]) => { if (val) URL += `/${key}` })
        router.push(URL)
    }

    const pillBase = "px-3.5 py-1 rounded-full text-[13px] cursor-pointer transition-all select-none"
    const pillActive = `${pillBase} bg-[#C4725A] text-white`
    const pillInactive = `${pillBase} border border-[#D5CEC6] text-[#5C5047] hover:border-[#B0A89E]`
    const hasVerbFilter = filters.verb

    useEffect(() => {
        const search = params.search
        const searchInActive = Object.entries(initialSearchIn).filter(([,v]) => v).map(([k]) => k)
        const filterByActive = Object.entries(initialFilters).filter(([,v]) => v).map(([k]) => k)

        async function fetchData() {
            setLoading(true)
            const queryParams = new URLSearchParams()
            queryParams.set("search", search)
            searchInActive.forEach(s => queryParams.append("searchIn", s))
            filterByActive.forEach(f => queryParams.append("filter", f))

            const res = await fetch(`/api/words?${queryParams.toString()}`)
            const result = await res.json()
            setSearchResults(result)
            setLoading(false)

            let count = 0
            const interval = setInterval(() => {
                count += 4
                setVisibleCount(count)
                if (count >= result.length) clearInterval(interval)
            }, 60)
            return () => clearInterval(interval)
        }
        fetchData()
    }, [])

    const searchArea = (
        <form onSubmit={handleNewSearch} className="w-full max-w-[560px] flex flex-col gap-3">
            <div className="w-full h-11 flex items-center gap-2.5 px-4 rounded-md border border-[#D5CEC6] bg-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4725A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                </svg>
                <input
                    className="focus:outline-none w-full text-[15px] text-[#1A1A1A] placeholder:text-[#B0A89E] bg-transparent"
                    type="text"
                    value={newSearch}
                    onChange={e => setNewSearch(e.target.value)}
                    placeholder="Search words, definitions, roots..."
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-[#8A7E74] tracking-wide">Search in</span>
                <span onClick={() => toggleSearchIn('words')} className={searchIn.words ? pillActive : pillInactive}>Words</span>
                <span onClick={() => toggleSearchIn('definitions')} className={searchIn.definitions ? pillActive : pillInactive}>Definitions</span>
                <span onClick={() => toggleSearchIn('rootsAffixes')} className={searchIn.rootsAffixes ? pillActive : pillInactive}>Roots</span>
                <span onClick={() => toggleSearchIn('etymologically')} className={searchIn.etymologically ? pillActive : pillInactive}>Etymology</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-[#8A7E74] tracking-wide">Filter</span>
                {mainFilters.map(f => (
                    <span key={f.key} onClick={() => toggleFilter(f.key)} className={filters[f.key] ? pillActive : pillInactive}>{f.label}</span>
                ))}
                <span
                    onClick={() => setShowMoreFilters(!showMoreFilters)}
                    className={`${pillBase} border border-[#D5CEC6] text-[#8A7E74] hover:border-[#B0A89E]`}
                >
                    {showMoreFilters ? 'Less' : 'More...'}
                </span>
            </div>

            {showMoreFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    {moreFilters.map(f => (
                        <span key={f.key} onClick={() => toggleFilter(f.key)} className={filters[f.key] ? pillActive : pillInactive}>{f.label}</span>
                    ))}
                </div>
            )}

            {hasVerbFilter && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#8A7E74] tracking-wide">Conjugation</span>
                    {verbFilters.map(f => (
                        <span key={f.key} onClick={() => toggleFilter(f.key)} className={filters[f.key] ? pillActive : pillInactive}>{f.label}</span>
                    ))}
                </div>
            )}

            <button type="submit" className="hidden" />
        </form>
    )

    if (loading) {
        return (
            <div className="w-full min-h-[calc(100vh-56px)] flex flex-col items-center justify-center bg-[#FAFAF8] gap-4">
                <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C4725A] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#C4725A] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#C4725A] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-lg text-[#8A7E74] italic">
                    {isAllResults ? 'Loading dictionary...' : `Searching for \u201c${searchTerm}\u201d...`}
                </p>
            </div>
        )
    }

    if (searchResults.length === 0) {
        return (
            <div className="w-full min-h-[calc(100vh-56px)] flex flex-col items-center bg-[#FAFAF8] pt-10 sm:pt-16 px-4">
                <div className="mb-10">{searchArea}</div>
                <p className="text-3xl sm:text-4xl italic text-[#2A3441] text-center">
                    No results for &ldquo;{searchTerm}&rdquo;
                </p>
                <p className="text-base text-[#8A7E74] text-center max-w-md mt-3">
                    Try a different search term, broaden your filters, or browse the full dictionary.
                </p>
                <button
                    onClick={() => router.push('/searchresults/all_results/words')}
                    className="mt-4 px-5 py-2 text-sm bg-[#C4725A] text-white rounded hover:bg-[#B0634E] transition-colors"
                >
                    Browse all words
                </button>
            </div>
        )
    }

    return (
        <div className="w-full min-h-[calc(100vh-56px)] bg-[#FAFAF8] px-4 sm:px-8 lg:px-[10vw] py-10 sm:py-16">
            <div className="w-full max-w-[1000px] mx-auto">
                <div className="mb-8">{searchArea}</div>

                <p className="text-sm text-[#8A7E74] mb-6">
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                    {!isAllResults && <> for &ldquo;{searchTerm}&rdquo;</>}
                </p>

                <div className="columns-1 md:columns-2 gap-5 space-y-5">
                    {searchResults.map((result, index) => (
                        <div
                            key={result.wordId}
                            className="break-inside-avoid transition-all duration-300"
                            style={{
                                opacity: index < visibleCount ? 1 : 0,
                                transform: index < visibleCount ? 'translateY(0)' : 'translateY(12px)',
                            }}
                        >
                            <DictionaryCard data={result} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
