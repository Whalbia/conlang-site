"use client"
import { useState } from 'react'
import { useEffect } from 'react'

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

    useEffect(()=>{
        let exampleSentences = {}
        //const regex = /[\w\s\']+[\,]*[\w\s\']+/g
        const regex = /\w[\w\s\'\,]+|\d/g
        const sentences = data.example_sentences.match(regex)
        // "{"(\"when you sleep, your eyes are closed\",\"taei pazalle emat wa\",1)","(\"No one staring at the sun can ignore it\",\"pwivu ynti nemali ni pa ja pazalle ni ynti okae wa\",2)"}"
        
        console.log("sentences", sentences)


        for (let i = 2;i < sentences.length ; i+=3) {
            let number = sentences[i]
            let sentenceEnglish = sentences[i-2]
            let sentenceConlang = sentences[i-1]
            let temp = {
                [number] : {
                    'engSentence' : sentenceEnglish,
                    'conlangSentence' : sentenceConlang
                }
            }
            exampleSentences = Object.assign(exampleSentences, temp)
        }

        setExampleSentences(exampleSentences)
        console.log('Exaxmple Sentences', exampleSentences)
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
        //1 = not a verb
        '2': '-yt',
        '3': '-uk',
        '4': '-vu',
        '5': '-la',
        '6': 'misc'
    }
    const verb_transitivity = {
        //1 = not a verb
        '2': 'intransitive',
        '3': 'transitive',
        '4': 'ambitransitive'
    }

    return (
        <div className="w-[30vw] h-auto border-[1px] rounded-2xl border-black p-6 gap-y-3 flex flex-col align-start text-xl">
            <h1 className={`text-5xl ${corgySemiboldItalic.className}`}>{data.word}</h1> 
            <div className="flex flex-row w-full"> 
                <p>{word_type[data.word_type] == 'verb' ? `${verb_transitivity[data.verb_transitivity]}
                 ${verb_conjugation_pattern[data.verb_conjugation_pattern]}
                 ${word_type[data.word_type]}
                 ${data.has_il_ael_contrast ? 'w/ IAC' : 'w/o IAC'}`:
                 `${word_type[data.word_type]}`}</p>
            </div>

            <hr className='border-black border-t-[1px]'></hr>

            <button className='w-2/5 border-black border-[1px] rounded-xl hover:bg-slate-300' onClick={handleClickExamples}>{expandedExamples ? 'Hide Examples' : 'Show Examples'}</button>
                {data.definitions.map((definition, index) => { 
                    return <ul className='list-inside'>
                                <li>{index+1}. {definition}</li>{expandedExamples && exampleSentences.hasOwnProperty(index+1) ? 
                                <li className='list-disc text-xs ml-8'><span className={`text-lg ${corgySemiboldItalic.className}`}>{exampleSentences[index+1].engSentence}</span><p className='text-lg ml-4'>{exampleSentences[index+1].conlangSentence}</p></li> : ''}
                            </ul>
                })}

            { expanded ?  
            <>
                {/* Similar Words */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${data.similar_words[0]!='' ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Similar to:</span>
                    {data.similar_words.map((word, index) => index == data.similar_words.length-1 ? <span>{word}</span> : <span>{word},</span>)}
                </div>
                
                {/* Alternate Forms */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${data.alternate_forms[0]!='' ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Alternate forms:</span>
                    {data.alternate_forms.map((word, index) => index == data.alternate_forms.length-1 ? <span>{word}</span> : <span>{word},</span>)}
                </div>

                <hr className={`border-black border-t-[1px]  ${data.alternate_forms[0]=='' && data.similar_words[0]=='' ? 'hidden' : ''}`}></hr>

                {/* Etymology */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${data.etymology[0]!='' ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Etymology:</span>
                    {data.etymology.map((word, index) => index == data.etymology.length-1 ? <span>{word}</span> : <span>{word},</span>)}
                </div>

                {/* Roots */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${data.array_agg[0]!='' ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Roots:</span>
                    {data.array_agg.map((word, index) => index == data.array_agg.length-1 ? <span>{word}</span> : <span>{word},</span>)}
                </div>
                
                {/* Etymologically Related Words */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${data.etymologically_related_words[0]!='' ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Etymologically-related words:</span>
                    {data.etymologically_related_words.map((word, index) => index == data.etymologically_related_words.length-1 ? <span>{word}</span> : <span>{word},</span>)}
                </div>

                <hr className='border-black border-t-[1px]'></hr>

                {/* Usage Notes */}
                <div className={`flex flex-row justify-start align-center flex-wrap gap-x-2 ${data.usage_notes[0]!='' ? '' : 'hidden'}`}>
                    <span className={corgySemibold.className}>Notes on usage:</span>
                    {data.usage_notes.map((word, index) => index == data.usage_notes.length-1 ? <span>{word}</span> : <span>{word},</span>)}
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