"use client"
import { useState, useEffect } from 'react'

export default function DictionaryCard({data}) {
    const [expanded, setExpanded] = useState(false)
    const [expandedExamples, setExpandedExamples] = useState(false)
    const [exampleSentences, setExampleSentences] = useState({})

    let similarWords = [...(data.similarWords || [])]
    similarWords.sort()
    let etymologicallyRelatedWords = [...(data.etymologicallyRelatedWords || [])]
    etymologicallyRelatedWords.sort()
    let roots = [...(data.rootsAffixes || [])]
    roots.sort()
    let affixes = [...(data.affixes || [])]
    affixes.sort()

    const hasExamples = (data.exampleSentences || []).length > 0
    const hasExpandedContent = similarWords.length > 0 ||
        (data.alternateForms || []).length > 0 ||
        (data.etymology || []).length > 0 ||
        roots.length > 0 ||
        affixes.length > 0 ||
        etymologicallyRelatedWords.length > 0 ||
        (data.usageNotes || []).length > 0

    useEffect(() => {
        let grouped = {}
        const sentences = data.exampleSentences || []
        for (const sentence of sentences) {
            const num = sentence.definitionNumber
            const temp = { engSentence: sentence.english, conlangSentence: sentence.conlang }
            grouped.hasOwnProperty(num) ? grouped[num].push(temp) : grouped[num] = [temp]
        }
        setExampleSentences(grouped)
    }, [])

    const word_type = {
        '1': 'noun', '2': 'verb', '3': 'adjective', '4': 'stative',
        '5': 'pronoun', '6': 'discourse particle', '7': 'phrase', '8': 'misc.'
    }
    const verb_conjugation_pattern = {
        '2': '-yt', '3': '-uk', '4': '-vu', '5': '-la', '6': 'misc'
    }
    const verb_transitivity = {
        '2': 'intransitive', '3': 'transitive', '4': 'ambitransitive'
    }

    const wordTypeStr = word_type[data.wordType] === 'verb'
        ? `${verb_transitivity[data.verbTransitivity]} ${verb_conjugation_pattern[data.verbConjugationPattern]} verb${data.hasIlAelContrast ? ' w/ IAC' : ''}`
        : word_type[data.wordType]

    function MetadataRow({ label, items }) {
        if (!items || items.length === 0) return null
        return (
            <div className="flex flex-row flex-wrap gap-x-1.5 items-start text-sm">
                <span className="font-semibold text-[#1A1A1A]">{label}</span>
                <span className="text-[#666]">{items.join(', ')}</span>
            </div>
        )
    }

    return (
        <div className="w-full h-auto border border-[#E8E2DA] rounded-2xl bg-white p-5 sm:p-7 gap-y-2 flex flex-col text-base">
            {/* Word Title */}
            <h2 className="text-3xl sm:text-4xl font-semibold italic text-[#2A3441] tracking-tight leading-tight">
                {data.word}
            </h2>

            {/* Word Type */}
            <p className="text-sm italic text-[#999] mb-1">{wordTypeStr}</p>

            {/* Divider */}
            <hr className="border-[#E8E2DA] mb-1" />

            {/* Definitions with inline examples */}
            {data.definitions.map((definition, index) => (
                <div key={index}>
                    <div className="flex gap-2 items-start">
                        <span className="font-semibold text-[#1A1A1A] text-[17px]">{index + 1}.</span>
                        <span className="text-[#333] text-[17px] leading-[1.45]">{definition}</span>
                    </div>
                    {expandedExamples && exampleSentences.hasOwnProperty(index + 1) &&
                        exampleSentences[index + 1].map((obj, i) => (
                            <div key={i} className="pl-6 sm:pl-8 mt-1 mb-1">
                                <p className="text-[15px] font-semibold italic text-[#555]">{obj.conlangSentence}</p>
                                <p className="text-sm text-[#888]">{obj.engSentence}</p>
                            </div>
                        ))
                    }
                </div>
            ))}

            {/* Expanded Content */}
            {expanded && (
                <>
                    <MetadataRow label="Similar to" items={similarWords} />
                    <MetadataRow label="Alternate forms" items={data.alternateForms} />

                    {((data.etymology || []).length > 0 || roots.length > 0 || affixes.length > 0 || etymologicallyRelatedWords.length > 0) && (
                        <hr className="border-[#E8E2DA] my-1" />
                    )}

                    <MetadataRow label="Etymology" items={data.etymology} />
                    <MetadataRow label="Roots" items={roots} />
                    <MetadataRow label="Affixes" items={affixes} />
                    <MetadataRow label="Related words" items={etymologicallyRelatedWords} />

                    {(data.usageNotes || []).length > 0 && (
                        <hr className="border-[#E8E2DA] my-1" />
                    )}

                    <MetadataRow label="Usage" items={data.usageNotes} />
                </>
            )}

            {/* Footer Links */}
            <div className="flex gap-5 pt-2">
                {hasExamples && (
                    <span
                        className="text-sm text-[#999] cursor-pointer hover:text-[#666] transition-colors"
                        onClick={() => setExpandedExamples(!expandedExamples)}
                    >
                        {expandedExamples ? 'Hide examples' : 'Examples'}
                    </span>
                )}
                {hasExpandedContent && (
                    <span
                        className="text-sm text-[#999] cursor-pointer hover:text-[#666] transition-colors"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? '← Less' : 'More details →'}
                    </span>
                )}
            </div>
        </div>
    )
}
