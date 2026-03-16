"use client"
import { useState } from 'react'
import { useEffect } from 'react'

import EditButton from './editbutton'

import { Cormorant_Garamond } from 'next/font/google'

const corgySemibold = Cormorant_Garamond({
    subsets: ['latin'],
    display: 'swap',
    weight: '600'
})

const corgySemiboldItalic = Cormorant_Garamond({
    subsets: ['latin'],
    display: 'swap',
    weight: '600',
    style: 'italic'
})

const corgyMediumItalic = Cormorant_Garamond({
    subsets: ['latin'],
    display: 'swap',
    weight: '500',
    style: 'italic'
})

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

    useEffect(()=>{
        // example sentences are now JSON objects: {english, conlang, definitionNumber}
        let grouped = {}
        const sentences = data.exampleSentences || []

        for (const sentence of sentences) {
            const num = sentence.definitionNumber
            const temp = {
                engSentence: sentence.english,
                conlangSentence: sentence.conlang
            }
            grouped.hasOwnProperty(num) ? grouped[num].push(temp) : grouped[num] = [temp]
        }

        setExampleSentences(grouped)
    }, [])

    const handleClickExamples = (e) => {
        e.preventDefault()
        expandedExamples ? setExpandedExamples(false) : setExpandedExamples(true)
    }

    const handleClickShowMore = (e) => {
        e.preventDefault()
        expanded ? setExpanded(false) : setExpanded(true)
    }

    const word_type = {
        '1': 'noun',
        '2': 'verb',
        '3': 'adjective',
        '4': 'stative',
        '5': 'pronoun',
        '6': 'discourse particle',
        '7': 'phrase',
        '8': 'misc.'
    }
    const verb_conjugation_pattern = {
        '2': '-yt',
        '3': '-uk',
        '4': '-vu',
        '5': '-la',
        '6': 'misc'
    }
    const verb_transitivity = {
        '2': 'intransitive',
        '3': 'transitive',
        '4': 'ambitransitive'
    }

    return (
        <div className="w-[30vw] h-auto border-[1px] rounded-2xl border-black p-6 gap-y-3 flex flex-col align-start text-xl">
            <h1 className={`text-5xl ${corgySemiboldItalic.className}`}>{data.word}</h1>
            <EditButton wordID={data.wordId}></EditButton>
            <div className="flex flex-row w-full">
                <p>{word_type[data.wordType] == 'verb' ? `${verb_transitivity[data.verbTransitivity]}
                 ${verb_conjugation_pattern[data.verbConjugationPattern]}
                 ${word_type[data.wordType]}
                 ${data.hasIlAelContrast ? 'w/ IAC' : 'w/o IAC'}`:
                 `${word_type[data.wordType]}`}</p>
            </div>

            <hr className='border-black border-t-[1px]'></hr>

            <button className='w-2/5 border-black border-[1px] rounded-xl hover:bg-slate-300' onClick={handleClickExamples}>{expandedExamples ? 'Hide Examples' : 'Show Examples'}</button>
                {data.definitions.map((definition, index) => {
                    return <ul key={index} className='list-inside'>
                                <li>{index+1}. {definition}</li>{expandedExamples && exampleSentences.hasOwnProperty(index+1) ?
                                exampleSentences[index+1].map((object, i) => {
                                    return <li key={i} className='list-disc text-xs ml-8'><span className={`text-lg ${corgySemiboldItalic.className}`}>{object.conlangSentence}</span><p className='text-lg ml-4'>{object.engSentence}</p></li>
                                })
                                 : ''}
                            </ul>
                })}

            { expanded ?
            <>
                {/* Similar Words */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${similarWords.length > 0 ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Similar to:</span>
                    {similarWords.map((word, index) => index == similarWords.length-1 ? <span key={index}>{word}</span> : <span key={index}>{word},</span>)}
                </div>

                {/* Alternate Forms */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${(data.alternateForms || []).length > 0 ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Alternate forms:</span>
                    {(data.alternateForms || []).map((word, index) => index == data.alternateForms.length-1 ? <span key={index}>{word}</span> : <span key={index}>{word},</span>)}
                </div>

                <hr className={`border-black border-t-[1px] ${(data.etymology || []).length === 0 && roots.length === 0 && affixes.length === 0 && etymologicallyRelatedWords.length === 0 ? 'hidden' : ''}`}></hr>

                {/* Etymology */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${(data.etymology || []).length > 0 ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Etymology:</span>
                    {(data.etymology || []).map((word, index) => index == data.etymology.length-1 ? <span key={index}>{word}</span> : <span key={index}>{word},</span>)}
                </div>

                {/* Roots */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${roots.length > 0 ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Roots:</span>
                    {roots.map((word, index) => index == roots.length-1 ? <span key={index}>{word}</span> : <span key={index}>{word},</span>)}
                </div>

                {/* Affixes */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${affixes.length > 0 ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Affixes:</span>
                    {affixes.map((word, index) => index == affixes.length-1 ? <span key={index}>{word}</span> : <span key={index}>{word},</span>)}
                </div>

                {/* Etymologically Related Words */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${etymologicallyRelatedWords.length > 0 ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Etymologically-related words:</span>
                    {etymologicallyRelatedWords.map((word, index) => index == etymologicallyRelatedWords.length-1 ? <span key={index}>{word}</span> : <span key={index}>{word},</span>)}
                </div>

                <hr className='border-black border-t-[1px]'></hr>

                {/* Usage Notes */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${(data.usageNotes || []).length > 0 ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Notes on usage:</span>
                    {(data.usageNotes || []).map((word, index) => index == data.usageNotes.length-1 ? <span key={index}>{word}</span> : <span key={index}>{word},</span>)}
                </div>
            </>
            :
            ''
            }
            <button className={expanded ? '-mb-4':''} onClick={handleClickShowMore}>
            {expanded ?
            <><p>Less</p><p className='text-5xl'>^</p></>
            : <><p>Show More</p><p className='text-5xl transform rotate-180 -mt-4'>^</p></> }
            </button>

        </div>
    );
}
