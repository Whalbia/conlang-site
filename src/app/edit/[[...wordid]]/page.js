'use client'

import { useState } from "react"
import { useEffect } from "react"

export default function Page({params}) {
    let [definitions, setDefinitions] = useState([])
    let [alternateForms, setAlternateForms] = useState([])
    let [similarWords, setSimilarWords] = useState([])
    let [etymology, setEtymology] = useState([])
    let [exampleSentences, setExampleSentences] = useState([])
    let [etymologicallyRelatedWords, setEtymologicallyRelatedWords] = useState([])
    let [usageNotes, setUsageNotes] = useState([])
    let [rootsAffixes, setRootsAffixes] = useState([])
    let [loading, setLoading] = useState(false)

    function submit(formData) {
        async function sendData(formData) {
            const res = await fetch("http://localhost:3000/api/edit", {
                method: "POST",
                body: formData
            })
        }
        setLoading(true)
        console.log("fetching data")
        sendData(formData).then(()=>setLoading(false))
        console.log("fetchData completed")
        //location.reload()
    }

    function populatePage(result) {
        if ('definition' in result){
            addDefinition(null, result.definition)
        }
    }

    //fetch the word
    useEffect(()=>{
        if ('wordid' in params) {
            const wordID = params.wordid
            async function fetchData() {
                // const res = await fetch("http://localhost:3000/api/editword", {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json"
                //     },
                //     body: JSON.stringify({wordID})
                // })
                // const result = await res.json()
                populatePage({definition: ["def 1", "def2"]})
            }
            fetchData()
        }
    }, [])

    function addDefinition(e, data) {
        if (e){
            e.preventDefault()
        }
        let newDefinitions = []
        const newDefinitionAmount = definitions.length / 2 + 1

        newDefinitions.push(<label htmlFor={`definition-${newDefinitionAmount}`}>Definition {newDefinitionAmount}</label>)
        data ? '' : newDefinitions.push(<textarea className='border-black border rounded' type='text' id={`definition-${newDefinitionAmount}`} name={`definition-${newDefinitionAmount}`}></textarea>)

        if (data){
            for (let text of data){
                newDefinitions.push(<textarea className='border-black border rounded' type='text' id={`definition-${newDefinitionAmount}`} name={`definition-${newDefinitionAmount}`} value={text}></textarea>)
            }
        }
        setDefinitions(definitions.concat(newDefinitions))

        if (text){
            setId(`definition-${newDefinitionAmount}`)
            setText(text) 
        }
    }

    function addAlternateForm(e) {
        e.preventDefault()
        let newAlternateForms = []
        const newAlternateFormAmount = alternateForms.length / 2 + 1

        newAlternateForms.push(<label htmlFor={`alternate-form-${newAlternateFormAmount}`}>Alternate Form {newAlternateFormAmount}</label>)
        newAlternateForms.push(<textarea className='border-black border rounded' type='text' id={`alternate-form-${newAlternateFormAmount}`} name={`alternate-form-${newAlternateFormAmount}`}></textarea>)

        setAlternateForms(alternateForms.concat(newAlternateForms))
    }

    function addSimilarWord(e) {
        e.preventDefault()
        let newSimilarWords = []
        const newSimilarWordAmount = similarWords.length / 2 + 1

        newSimilarWords.push(<label htmlFor={`similar-word-${newSimilarWordAmount}`}>Similar Word {newSimilarWordAmount}</label>)
        newSimilarWords.push(<textarea className='border-black border rounded' type='text' id={`similar-word-${newSimilarWordAmount}`} name={`similar-word-${newSimilarWordAmount}`}></textarea>)

        setSimilarWords(similarWords.concat(newSimilarWords))
    }

    function addEtymology(e) {
        e.preventDefault()
        let newEtymology = []
        const newEtymologyAmount = etymology.length / 2 + 1

        newEtymology.push(<label htmlFor={`etymology-${newEtymologyAmount}`}>Etymology {newEtymologyAmount}</label>)
        newEtymology.push(<textarea className='border-black border rounded' type='text' id={`etymology-${newEtymologyAmount}`} name={`etymology-${newEtymologyAmount}`}></textarea>)

        setEtymology(etymology.concat(newEtymology))
    }

    function addExampleSentences(e) {
        e.preventDefault()
        let newExampleSentences = []
        const newExampleSentencesAmount = exampleSentences.length / 6 + 1

        newExampleSentences.push(<label htmlFor={`example-sentence-english-${newExampleSentencesAmount}`}>Example Sentence {newExampleSentencesAmount} (English)</label>)
        newExampleSentences.push(<textarea required className='border-black border rounded' type='text' id={`example-sentence-english-${newExampleSentencesAmount}`} name={`example-sentence-english-${newExampleSentencesAmount}`}></textarea>)

        newExampleSentences.push(<label htmlFor={`example-sentence-conlang-${newExampleSentencesAmount}`}>Example Sentence {newExampleSentencesAmount} (Conlang)</label>)
        newExampleSentences.push(<textarea required className='border-black border rounded' type='text' id={`example-sentence-conlang-${newExampleSentencesAmount}`} name={`example-sentence-conlang-${newExampleSentencesAmount}`}></textarea>)

        newExampleSentences.push(<label htmlFor={`example-sentence-def-${newExampleSentencesAmount}`}>Which Definition Does This Sentence Correspond To?</label>)
        newExampleSentences.push(<textarea required className='border-black border rounded' type='text' id={`example-sentence-def-${newExampleSentencesAmount}`} name={`example-sentence-def-${newExampleSentencesAmount}`}></textarea>)
        setExampleSentences(exampleSentences.concat(newExampleSentences))
    }

    function addEtymologicallyRelatedWord(e) {
        e.preventDefault()
        let newEtymologicallyRelatedWord = []
        const newEtymologicallyRelatedWordAmount = etymologicallyRelatedWords.length / 2 + 1

        newEtymologicallyRelatedWord.push(<label htmlFor={`etymologically-related-word-${newEtymologicallyRelatedWordAmount}`}>Etymologically Related Word {newEtymologicallyRelatedWordAmount}</label>)
        newEtymologicallyRelatedWord.push(<textarea className='border-black border rounded' type='text' id={`etymologically-related-word-${newEtymologicallyRelatedWordAmount}`} name={`etymologically-related-word-${newEtymologicallyRelatedWordAmount}`}></textarea>)

        setEtymologicallyRelatedWords(etymologicallyRelatedWords.concat(newEtymologicallyRelatedWord))
    }

    function addUsageNote(e) {
        e.preventDefault()
        let newUsageNote = []
        const newUsageNoteAmount = usageNotes.length / 2 + 1
        newUsageNote.push(<label htmlFor={`usage-note-${newUsageNoteAmount}`}>Usage Note {newUsageNoteAmount}</label>)
        newUsageNote.push(<textarea className='border-black border rounded' type='text' id={`usage-note-${newUsageNoteAmount}`} name={`usage-note-${newUsageNoteAmount}`}></textarea>)

        setUsageNotes(usageNotes.concat(newUsageNote))
    }

    function addRootAffix(e) {
        e.preventDefault()
        let newRootAffix = []
        const newRootAffixAmount = rootsAffixes.length / 2 + 1
        newRootAffix.push(<label htmlFor={`roots-affixes-${newRootAffixAmount}`}>Root/Affix {newRootAffixAmount}</label>)
        newRootAffix.push(<textarea className='border-black border rounded' type='text' id={`roots-affixes-${newRootAffixAmount}`} name='roots-affixes'></textarea>)

        setRootsAffixes(rootsAffixes.concat(newRootAffix))
    }

    function remove(e) {
        e.preventDefault()
        const toRemove = e.target.id
        if (toRemove == "definition"){
            setDefinitions(definitions.slice(0, -2))
        }
        else if (toRemove == "alt-form"){
            setAlternateForms(alternateForms.slice(0, -2))
        }
        else if (toRemove == "example-sentence"){
            setExampleSentences(exampleSentences.slice(0, -6))
        }
        else if (toRemove == "sim-word"){
            setSimilarWords(similarWords.slice(0, -2))
        }
        else if (toRemove == "etymology"){
            setEtymology(etymology.slice(0, -2))
        }
        else if (toRemove == "ety-word"){
            setEtymologicallyRelatedWords(etymologicallyRelatedWords.slice(0, -2))
        }
        else if (toRemove == "use-note"){
            setUsageNotes(usageNotes.slice(0, -2))
        }
        else if (toRemove == "root-affix"){
            setRootsAffixes(rootsAffixes.slice(0, -2))
        }
    }


    return (
        <div className="overflow-hidden">
            {
                loading ? 
                <div className="w-screen h-screen flex flex-row items-center justify-center">
                    <p className="text-2xl">loading... (I was too lazy to make a loading animation so I'm just putting in words lmao)</p>
                </div> 
                :
            <main className="flex flex-col items-center justify-start w-screen min-h-screen">
                <form className='flex flex-row flex-wrap gap-x-20 py-10 px-32 gap-y-10 justify-center' id='SubmitForm' action={submit}>
                    <div className="flex flex-row justify-center w-full">
                        <div className="flex flex-col ">
                            <label className="text-xl underline" htmlFor='word'>Word</label>
                            <input className='border-black border rounded pl-1' type='text' id='word' name="word"></input>
                        </div>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Definitions</p>
                        {definitions}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addDefinition}>Add Definition</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={remove} id="definition">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Alternate Forms</p>
                        {alternateForms}
                        <button className='hover:bg-slate-400 border-black border rounded w-44 mt-2' onClick={addAlternateForm}>Add Alternate Form</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-44 mt-2' onClick={remove} id="alt-form">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Similar Words</p>
                        {similarWords}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addSimilarWord}>Add Similar Word</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={remove} id="sim-word">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Etymology</p>
                        {etymology}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addEtymology}>Add Etymology</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={remove} id="etymology">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Example Sentences</p>
                        {exampleSentences}
                        <button className='hover:bg-slate-400 border-black border rounded w-80 mt-2' onClick={addExampleSentences}>Add Example Sentence</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-80 mt-2' onClick={remove} id="example-sentence">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Etymologically Related Words</p>
                        {etymologicallyRelatedWords}
                        <button className='hover:bg-slate-400 border-black border rounded w-56 mt-2' onClick={addEtymologicallyRelatedWord}>Add Etymologically Related Word</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-56 mt-2' onClick={remove} id="ety-word">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Usage Notes</p>
                        {usageNotes}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addUsageNote}>Add Usage Note</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={remove} id="use-note">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Roots/Affixes</p>
                        {rootsAffixes}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addRootAffix}>Add Root/Affix</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={remove} id="root-affix">Remove Last Item</button>
                    </div>

                    <div className="w-full flex flex-row justify-center gap-x-20">
                        <fieldset className="flex flex-col">
                            <p className="text-xl underline">Verb Transitivity</p>
                            <div>
                                <input type="radio" name="verb-transitivity" id="not-verb-t" value="1" required></input>
                                <label htmlFor="not-verb-t">Not a Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="verb-transitivity" id="intransitive" value="2"></input>
                                <label htmlFor="intransitive">Intransitive Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="verb-transitivity" id="transitive" value="3"></input>
                                <label htmlFor="transitive">Transitive Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="verb-transitivity" id="ambitransitive" value="4"></input>
                                <label htmlFor="ambitransitive">Ambitransitive</label>
                            </div>
                        </fieldset>

                        <fieldset className="flex flex-col">
                            <p className="text-xl underline">Word Type</p>
                            <div>
                                <input type="radio" name="word-type" id="noun" value="1" required></input>
                                <label htmlFor="noun">Noun</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="verb" value="2"></input>
                                <label htmlFor="verb">Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="adjective" value="3"></input>
                                <label htmlFor="adjective">Adjective</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="stative" value="4"></input>
                                <label htmlFor="stative">Stative</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="pronoun" value="5"></input>
                                <label htmlFor="pronoun">Pronoun</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="disc_part" value="6"></input>
                                <label htmlFor="disc_part">Discourse Particle</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="phrase" value="7"></input>
                                <label htmlFor="phrase">Phrase</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="misc" value="8"></input>
                                <label htmlFor="misc">Miscellaneous</label>
                            </div>
                        </fieldset>

                        <fieldset className="flex flex-col">
                            <p className="text-xl underline">Verb Conjugation Pattern</p>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="not-verb" value="1" required></input>
                                <label htmlFor="not-verb">Not a Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="yt" value="2"></input>
                                <label htmlFor="yt">-yt Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="uk" value="3"></input>
                                <label htmlFor="uk">-uk Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="vu" value="4"></input>
                                <label htmlFor="vu">-vu Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="la" value="5"></input>
                                <label htmlFor="la">-la Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="misc_conj" value="6"></input>
                                <label htmlFor="misc_conj">Miscellaneous</label>
                            </div>
                        </fieldset>

                        <div>
                            <input type="checkbox" name="has-il-ael-contrast" id="has-il-ael-contrast"></input>
                            <label htmlFor="has-il-ael-contrast">Does this word have il/ael contrast?</label>
                        </div>
                    </div>

                    <div className="flex flex-row justify-center w-full">
                        <button className='hover:bg-slate-400 border-black border rounded w-28 h-10' type='submit'>Submit</button>
                    </div>
                </form>
            </main>
            }
        </div>
    )
}