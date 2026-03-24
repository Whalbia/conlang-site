'use client'

import { useState } from "react"
import { useEffect } from "react"

export default function Page({params}) {
    let [authenticated, setAuthenticated] = useState(false)
    let [authChecked, setAuthChecked] = useState(false)
    let [passwordInput, setPasswordInput] = useState('')
    let [authError, setAuthError] = useState('')
    let [definitions, setDefinitions] = useState([])
    let [alternateForms, setAlternateForms] = useState([])
    let [similarWords, setSimilarWords] = useState([])
    let [etymology, setEtymology] = useState([])
    let [exampleSentences, setExampleSentences] = useState([])
    let [etymologicallyRelatedWords, setEtymologicallyRelatedWords] = useState([])
    let [usageNotes, setUsageNotes] = useState([])
    let [rootsAffixes, setRootsAffixes] = useState([])
    let [loading, setLoading] = useState(false)
    let [data, setData] = useState(null)

    useEffect(() => {
        fetch('/api/auth').then(res => {
            if (res.ok) setAuthenticated(true)
            setAuthChecked(true)
        }).catch(() => setAuthChecked(true))
    }, [])

    async function handleAuth(e) {
        e.preventDefault()
        setAuthError('')
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passwordInput })
        })
        if (res.ok) {
            setAuthenticated(true)
        } else {
            setAuthError('Wrong password')
        }
    }

    let stateVariables = {
        'definitions': [definitions, setDefinitions],
        'alternateForms': [alternateForms, setAlternateForms],
        'etymology': [etymology, setEtymology],
        'similarWords': [similarWords, setSimilarWords],
        'etymologicallyRelatedWords': [etymologicallyRelatedWords, setEtymologicallyRelatedWords],
        'usageNotes': [usageNotes, setUsageNotes],
        'rootsAffixes': [rootsAffixes, setRootsAffixes]
    }

    let attributeWords = {
        'definitions': 'definition',
        'alternateForms': 'alternate-form',
        'etymology': 'etymology',
        'similarWords': 'similar-word',
        'etymologicallyRelatedWords': 'etymologically-related-word',
        'usageNotes': 'usage-note',
        'rootsAffixes': 'roots-affixes'
    }

    let textVals = {
        'definitions': 'Definition ',
        'alternateForms': 'Alternate Form ',
        'etymology': ' Etymology ',
        'similarWords': 'Similar Word ',
        'etymologicallyRelatedWords': 'Etymologically Related Word ',
        'usageNotes': 'Usage Note ',
        'rootsAffixes': 'Root/Affix '
    }

    function getTags(type, value, amount){
        amount ? '' : amount = stateVariables[type][0].length / 2 + 1
        let attributeWord = attributeWords[type]
        let text = textVals[type]
        return {
            label: <label htmlFor={`${attributeWord}-${amount}`}>{text} {amount}</label>,
            inputText: <textarea className='border-black border rounded' type='text' id={`${attributeWord}-${amount}`} name={`${attributeWord}-${amount}`}>{value}</textarea>,
            inputNoText: <textarea className='border-black border rounded' type='text' id={`${attributeWord}-${amount}`} name={`${attributeWord}-${amount}`}></textarea>
        }
    }

    function submit(formData) {
        async function sendData(formData) {
            // collect array fields from form data
            const collectFields = (prefix) => {
                let items = []
                for (const key of formData.keys()) {
                    if (key.startsWith(prefix)) {
                        const val = formData.get(key)
                        if (val) items.push(val)
                    }
                }
                return items
            }

            // collect example sentences as JSON objects
            const collectExampleSentences = () => {
                let sentences = []
                let i = 1
                while (formData.has(`example-sentence-english-${i}`)) {
                    sentences.push({
                        english: formData.get(`example-sentence-english-${i}`),
                        conlang: formData.get(`example-sentence-conlang-${i}`),
                        definitionNumber: Number(formData.get(`example-sentence-def-${i}`))
                    })
                    i++
                }
                return sentences
            }

            const body = {
                word: formData.get('word'),
                definitions: collectFields('definition-'),
                wordType: Number(formData.get('word-type')),
                alternateForms: collectFields('alternate-form-'),
                similarWords: collectFields('similar-word-'),
                verbConjugationPattern: Number(formData.get('conjugation-pattern')),
                hasIlAelContrast: !!formData.get('has-il-ael-contrast'),
                etymology: collectFields('etymology-'),
                exampleSentences: collectExampleSentences(),
                etymologicallyRelatedWords: collectFields('etymologically-related-word-'),
                usageNotes: collectFields('usage-note-'),
                verbTransitivity: Number(formData.get('verb-transitivity')),
                rootsAffixes: collectFields('roots-affixes-'),
            }

            if ('wordid' in params) {
                await fetch(`/api/words/${params.wordid}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                })
            } else {
                await fetch("/api/words", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                })
            }
        }
        setLoading(true)
        sendData(formData).then(()=>setLoading(false))
    }

    function populatePage(result) {
        let types = ['definitions', 'alternateForms', 'etymology', 'similarWords', 'etymologicallyRelatedWords', 'usageNotes', 'rootsAffixes']

        for (let type of types) {
            if (result[type] && result[type].length > 0){
                addPopulatedInput(result[type], type)
            }
        }
        // example sentences are now JSON objects
        if (result.exampleSentences && result.exampleSentences.length > 0){
            addExampleSentences(null, result.exampleSentences)
        }
    }

    //fetch the word
    useEffect(()=>{
        if ('wordid' in params) {
            const wordID = params.wordid
            async function fetchData() {
                setLoading(true)
                const res = await fetch(`/api/words/${wordID}`)
                const result = await res.json()
                populatePage(result)
                setData(result)
                setLoading(false)
            }
            fetchData()
        }
    }, [])

    function addNewInput(e) {
        e.preventDefault()
        let type = e.target.id

        let newTags = []
        let tags = getTags(type, null, null)

        newTags.push(tags.label)
        newTags.push(tags.inputNoText)

        let stateVariable = stateVariables[type][0]
        let setState = stateVariables[type][1]
        setState(stateVariable.concat(newTags))
    }

    function addPopulatedInput(data, type) {
        let newTags = []

        for (let i = 0;i < data.length;i++){
            let amount = i + 1
            let text = data[i]
            let tags = getTags(type, text, amount)

            newTags.push(tags.label)
            newTags.push(tags.inputText)
        }

        let stateVariable = stateVariables[type][0]
        let setState = stateVariables[type][1]
        setState(stateVariable.concat(newTags))
    }

    function addExampleSentences(e, data) {
        e ? e.preventDefault() : ''
        let newExampleSentences = []
        const newExampleSentencesAmount = exampleSentences.length / 6 + 1

        if (!data){
            newExampleSentences.push(<label htmlFor={`example-sentence-english-${newExampleSentencesAmount}`}>Example Sentence {newExampleSentencesAmount} (English)</label>)
            newExampleSentences.push(<textarea required className='border-black border rounded' type='text' id={`example-sentence-english-${newExampleSentencesAmount}`} name={`example-sentence-english-${newExampleSentencesAmount}`}></textarea>)

            newExampleSentences.push(<label htmlFor={`example-sentence-conlang-${newExampleSentencesAmount}`}>Example Sentence {newExampleSentencesAmount} (Conlang)</label>)
            newExampleSentences.push(<textarea required className='border-black border rounded' type='text' id={`example-sentence-conlang-${newExampleSentencesAmount}`} name={`example-sentence-conlang-${newExampleSentencesAmount}`}></textarea>)

            newExampleSentences.push(<label htmlFor={`example-sentence-def-${newExampleSentencesAmount}`}>Which Definition Does This Sentence Correspond To?</label>)
            newExampleSentences.push(<textarea required className='border-black border rounded' type='text' id={`example-sentence-def-${newExampleSentencesAmount}`} name={`example-sentence-def-${newExampleSentencesAmount}`}></textarea>)
        }
        else {
            // data is now an array of {english, conlang, definitionNumber} objects
            for (let i = 0; i < data.length; i++){
                const num = i + 1
                newExampleSentences.push(<label htmlFor={`example-sentence-english-${num}`}>Example Sentence {num} (English)</label>)
                newExampleSentences.push(<textarea required className='border-black border rounded' type='text' id={`example-sentence-english-${num}`} name={`example-sentence-english-${num}`}>{data[i].english}</textarea>)

                newExampleSentences.push(<label htmlFor={`example-sentence-conlang-${num}`}>Example Sentence {num} (Conlang)</label>)
                newExampleSentences.push(<textarea required className='border-black border rounded' type='text' id={`example-sentence-conlang-${num}`} name={`example-sentence-conlang-${num}`}>{data[i].conlang}</textarea>)

                newExampleSentences.push(<label htmlFor={`example-sentence-def-${num}`}>Which Definition Does This Sentence Correspond To?</label>)
                newExampleSentences.push(<textarea required className='border-black border rounded' type='text' id={`example-sentence-def-${num}`} name={`example-sentence-def-${num}`}>{data[i].definitionNumber}</textarea>)
            }
        }

        setExampleSentences(exampleSentences.concat(newExampleSentences))
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


    if (!authChecked) return <div className="w-screen h-screen flex items-center justify-center"><p className="text-xl text-[#888]">Loading...</p></div>

    if (!authenticated) return (
        <div className="w-screen h-screen flex items-center justify-center bg-[#FAFAF8]">
            <form onSubmit={handleAuth} className="flex flex-col items-center gap-4">
                <p className="text-2xl font-semibold italic" style={{fontFamily: 'Cormorant Garamond'}}>Kagetw Editor</p>
                <input
                    type="password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Password"
                    className="border border-[#D5CEC6] rounded px-4 py-2 w-64 focus:outline-none focus:border-[#C4725A]"
                />
                {authError && <p className="text-sm text-red-500">{authError}</p>}
                <button type="submit" className="border border-[#D5CEC6] rounded px-6 py-2 hover:bg-[#F0EBE5] transition-colors">Enter</button>
            </form>
        </div>
    )

    return (
        <div className="overflow-hidden">
            {
                loading ?
                <div className="w-screen h-screen flex flex-row items-center justify-center">
                    <p className="text-2xl">Loading...</p>
                </div>
                :
            <main className="flex flex-col items-center justify-start w-screen min-h-screen">
                <form className='flex flex-row flex-wrap gap-x-20 py-10 px-32 gap-y-10 justify-center' id='SubmitForm' action={submit}>
                    <div className="flex flex-row justify-center w-full">
                        <div className="flex flex-col ">
                            <label className="text-xl underline" htmlFor='word'>Word</label>
                            <input className='border-black border rounded pl-1' type='text' id='word' name="word" defaultValue={data ? data.word : null}></input>
                        </div>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Definitions</p>
                        {definitions}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addNewInput} id='definitions'>Add Definition</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={remove} id="definition">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Alternate Forms</p>
                        {alternateForms}
                        <button className='hover:bg-slate-400 border-black border rounded w-44 mt-2' onClick={addNewInput} id='alternateForms'>Add Alternate Form</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-44 mt-2' onClick={remove} id="alt-form">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Similar Words</p>
                        {similarWords}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addNewInput} id='similarWords'>Add Similar Word</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={remove} id="sim-word">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Etymology</p>
                        {etymology}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addNewInput} id='etymology'>Add Etymology</button>
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
                        <button className='hover:bg-slate-400 border-black border rounded w-56 mt-2' onClick={addNewInput} id='etymologicallyRelatedWords'>Add Etymologically Related Word</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-56 mt-2' onClick={remove} id="ety-word">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Usage Notes</p>
                        {usageNotes}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addNewInput} id='usageNotes'>Add Usage Note</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={remove} id="use-note">Remove Last Item</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Roots/Affixes</p>
                        {rootsAffixes}
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={addNewInput} id='rootsAffixes'>Add Root/Affix</button>
                        <button className='hover:bg-slate-400 border-black border rounded w-40 mt-2' onClick={remove} id="root-affix">Remove Last Item</button>
                    </div>

                    <div className="w-full flex flex-row justify-center gap-x-20">
                        <fieldset className="flex flex-col">
                            <p className="text-xl underline">Verb Transitivity</p>
                            <div>
                                <input type="radio" name="verb-transitivity" id="not-verb-t" value="1" required defaultChecked={data && data.verbTransitivity == 1}></input>
                                <label htmlFor="not-verb-t">Not a Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="verb-transitivity" id="intransitive" value="2" defaultChecked={data && data.verbTransitivity == 2}></input>
                                <label htmlFor="intransitive">Intransitive Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="verb-transitivity" id="transitive" value="3" defaultChecked={data && data.verbTransitivity == 3}></input>
                                <label htmlFor="transitive">Transitive Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="verb-transitivity" id="ambitransitive" value="4" defaultChecked={data && data.verbTransitivity == 4}></input>
                                <label htmlFor="ambitransitive">Ambitransitive</label>
                            </div>
                        </fieldset>

                        <fieldset className="flex flex-col">
                            <p className="text-xl underline">Word Type</p>
                            <div>
                                <input type="radio" name="word-type" id="noun" value="1" required defaultChecked={data && data.wordType == 1}></input>
                                <label htmlFor="noun">Noun</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="verb" value="2" defaultChecked={data && data.wordType == 2}></input>
                                <label htmlFor="verb">Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="adjective" value="3" defaultChecked={data && data.wordType == 3}></input>
                                <label htmlFor="adjective">Adjective</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="stative" value="4" defaultChecked={data && data.wordType == 4}></input>
                                <label htmlFor="stative">Stative</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="pronoun" value="5" defaultChecked={data && data.wordType == 5}></input>
                                <label htmlFor="pronoun">Pronoun</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="disc_part" value="6" defaultChecked={data && data.wordType == 6}></input>
                                <label htmlFor="disc_part">Discourse Particle</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="phrase" value="7" defaultChecked={data && data.wordType == 7}></input>
                                <label htmlFor="phrase">Phrase</label>
                            </div>
                            <div>
                                <input type="radio" name="word-type" id="misc" value="8" defaultChecked={data && data.wordType == 8}></input>
                                <label htmlFor="misc">Miscellaneous</label>
                            </div>
                        </fieldset>

                        <fieldset className="flex flex-col">
                            <p className="text-xl underline">Verb Conjugation Pattern</p>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="not-verb" value="1" required defaultChecked={data && data.verbConjugationPattern == 1}></input>
                                <label htmlFor="not-verb">Not a Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="yt" value="2" defaultChecked={data && data.verbConjugationPattern == 2}></input>
                                <label htmlFor="yt">-yt Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="uk" value="3" defaultChecked={data && data.verbConjugationPattern == 3}></input>
                                <label htmlFor="uk">-uk Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="vu" value="4" defaultChecked={data && data.verbConjugationPattern == 4}></input>
                                <label htmlFor="vu">-vu Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="la" value="5" defaultChecked={data && data.verbConjugationPattern == 5}></input>
                                <label htmlFor="la">-la Verb</label>
                            </div>
                            <div>
                                <input type="radio" name="conjugation-pattern" id="misc_conj" value="6" defaultChecked={data && data.verbConjugationPattern == 6}></input>
                                <label htmlFor="misc_conj">Miscellaneous</label>
                            </div>
                        </fieldset>

                        <div>
                            <input type="checkbox" name="has-il-ael-contrast" id="has-il-ael-contrast" defaultChecked={data && data.hasIlAelContrast}></input>
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
