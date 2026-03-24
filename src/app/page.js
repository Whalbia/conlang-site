'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
  let router = useRouter()

  const [searchIn, setSearchIn] = useState({ words: true, definitions: false, rootsAffixes: false, etymologically: false })
  const [filters, setFilters] = useState({
    noun: false, verb: false, adjective: false, stative: false,
    pronoun: false, disc_part: false, phrase: false, misc: false,
    yt: false, uk: false, vu: false, la: false, misc_v: false,
    ilAel: false
  })
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  function toggleSearchIn(key) {
    setSearchIn(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleFilter(key) {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const search = formData.get("search") === '' ? "all_results" : formData.get("search")
    let URL = `/searchresults/${search}`

    // Add active searchIn options
    Object.entries(searchIn).forEach(([key, val]) => {
      if (val) URL += `/${key}`
    })

    // Add active filters
    Object.entries(filters).forEach(([key, val]) => {
      if (val) URL += `/${key}`
    })

    router.push(URL)
  }

  const pillBase = "px-3.5 py-1 rounded-full text-[13px] cursor-pointer transition-all select-none"
  const pillActive = `${pillBase} bg-[#C4725A] text-white`
  const pillInactive = `${pillBase} border border-[#D5CEC6] text-[#5C5047] hover:border-[#B0A89E]`

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

  const hasVerbFilter = filters.verb

  return (
    <div className="w-full min-h-[calc(100vh-56px)] flex flex-col justify-center items-center bg-gradient-to-b from-[#FAF8F5] to-[#F4F5F2]">
      <div className="w-full max-w-[560px] px-6 flex flex-col items-center gap-7">
        {/* Title */}
        <h1 className="text-7xl sm:text-[84px] font-semibold italic text-[#2A3441] tracking-tight">
          Kagetw
        </h1>

        {/* Description */}
        <p className="text-center text-[15px] sm:text-lg text-[#8A7E74] leading-relaxed max-w-[480px]">
          A constructed language inspired by Finnish, Japanese, Ojibwe, Spanish &amp; Pirahã.
          Over 1,500 words with VSO word order and a vertical writing system — started December 2023.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div className="w-full h-12 flex items-center gap-2.5 px-4 rounded-md border border-[#D5CEC6] bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4725A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input
              className="focus:outline-none focus:placeholder:text-transparent w-full text-[17px] text-[#1A1A1A] placeholder:text-[#B0A89E] bg-transparent"
              type="text"
              name="search"
              placeholder="Search words, definitions, roots..."
            />
          </div>

          {/* Search In Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold text-[#8A7E74] tracking-wide">Search in</span>
            <span onClick={() => toggleSearchIn('words')} className={searchIn.words ? pillActive : pillInactive}>Words</span>
            <span onClick={() => toggleSearchIn('definitions')} className={searchIn.definitions ? pillActive : pillInactive}>Definitions</span>
            <span onClick={() => toggleSearchIn('rootsAffixes')} className={searchIn.rootsAffixes ? pillActive : pillInactive}>Roots</span>
            <span onClick={() => toggleSearchIn('etymologically')} className={searchIn.etymologically ? pillActive : pillInactive}>Etymology</span>
          </div>

          {/* Filter Pills */}
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

          {/* More Filters (expanded) */}
          {showMoreFilters && (
            <div className="flex flex-wrap items-center gap-2 pl-0">
              {moreFilters.map(f => (
                <span key={f.key} onClick={() => toggleFilter(f.key)} className={filters[f.key] ? pillActive : pillInactive}>{f.label}</span>
              ))}
            </div>
          )}

          {/* Verb Conjugation Filters (shown when verb is active) */}
          {hasVerbFilter && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-[#8A7E74] tracking-wide">Conjugation</span>
              {verbFilters.map(f => (
                <span key={f.key} onClick={() => toggleFilter(f.key)} className={filters[f.key] ? pillActive : pillInactive}>{f.label}</span>
              ))}
            </div>
          )}

          {/* Hidden submit button — pressing Enter submits */}
          <button type="submit" className="hidden" />
        </form>
      </div>
    </div>
  )
}
