'use client'

import { submitData } from "../actions"
import { useState } from "react"

export default function Page() {
    let [definitions, setDefinitions] = useState([])

    function submit(formData) {
        submitData(formData)
        location.reload()
    }

    function addDefinition(e) {
        e.preventDefault()
        let newDefinitions = []
        const nextDefinitionNum = definitions.length / 2 + 1

        newDefinitions.push(<label htmlFor={`'definition-${nextDefinitionNum}'`}>Definition {nextDefinitionNum}</label>)
        newDefinitions.push(<input className='border-black border rounded' type='text' id='definition-1' name="definition-1"></input>)

        setDefinitions(definitions.concat(newDefinitions))
    }


    return (
        <div className="overflow-hidden">
            <main className="flex flex-col items-center justify-start w-screen min-h-screen">
                <form id='SubmitForm' action={submit}>
                    <div className="flex flex-col ">
                        <label htmlFor='word'>Word</label>
                        <input className='border-black border rounded' type='text' id='word' name="word"></input>
                    </div>

                    <div className="flex flex-col ">
                        <p>Definitions</p>
                        {definitions}
                        <button className='hover:bg-slate-400 border-black border rounded' onClick={addDefinition}>Add Definition</button>
                    </div>

                    <fieldset className="flex flex-col">
                        <p>Word Type</p>
                        <div>
                            <input type="radio" name="word-type" id="noun" value="1"></input>
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
                    </fieldset>

                    {/*make an array*/}
                    <div className="flex flex-col ">
                        <label htmlFor='alternate-forms'>Alternate Forms</label>
                        <input className='border-black border rounded' type='text' id='alternate-forms' name="alternate-forms"></input>
                    </div>

                    {/*make an array*/}
                    <div className="flex flex-col ">
                        <label htmlFor='similar-words'>Similar words</label>
                        <input className='border-black border rounded' type='text' id='similar-words' name="similar-words"></input>
                    </div>

                    <fieldset className="flex flex-col">
                        <p>Verb Conjugation Pattern</p>
                        <div>
                            <input type="radio" name="conjugation-pattern" id="not-verb" value="1"></input>
                            <label htmlFor="not-verb">Not a Verb/No Conjugation Pattern</label>
                        </div>
                        <div>
                            <input type="radio" name="conjugation-pattern" id="yt" value="2"></input>
                            <label htmlFor="yt">-yt Verb</label>
                        </div>
                        <div>
                            <input type="radio" name="conjugation-pattern" id="uk" value="3"></input>
                            <label htmlFor="uk">-uk Verb</label>
                        </div>
                    </fieldset>

                    <div>
                        <input type="checkbox" name="has-il-ael-contrast" id="has-il-ael-contrast"></input>
                        <label htmlFor="has-il-ael-contrast">Does this word have il/ael contrast?</label>
                    </div>

                    {/*make an array*/}
                    <div className="flex flex-col ">
                        <label htmlFor='etymology'>Etymology</label>
                        <input className='border-black border rounded' type='text' id='etymology' name="etymology"></input>
                    </div>

                    {/*make an array*/}
                    <div className="flex flex-col ">
                        <label htmlFor='example-sentence-english'>Example Sentence (English)</label>
                        <input className='border-black border rounded' type='text' id='example-sentence-english' name="example-sentence-english"></input>
                    </div>
                    <div className="flex flex-col ">
                        <label htmlFor='example-sentence-conlang'>Example Sentence (Conlang)</label>
                        <input className='border-black border rounded' type='text' id='example-sentence-conlang' name="example-sentence-conlang"></input>
                    </div>

                    {/*make an array*/}
                    <div className="flex flex-col ">
                        <label htmlFor='grammatically-related-words'>Grammatically Related Words</label>
                        <input className='border-black border rounded' type='text' id='grammatically-related-words' name="grammatically-related-words"></input>
                    </div>

                    <div className="flex flex-col ">
                        <label htmlFor='grammar-notes'>Grammar Notes</label>
                        <input className='border-black border rounded' type='text' id='grammar-notes' name="grammar-notes"></input>
                    </div>

                    {/*make an array*/}
                    <fieldset className="flex flex-col">
                        <p>Verb Transitivity</p>
                        <div>
                            <input type="radio" name="verb-transitivity" id="not-verb-t" value="1"></input>
                            <label htmlFor="not-verb-t">Not a Verb/Ambitransitive</label>
                        </div>
                        <div>
                            <input type="radio" name="verb-transitivity" id="intransitive" value="2"></input>
                            <label htmlFor="intransitive">Intransitive Verb</label>
                        </div>
                        <div>
                            <input type="radio" name="verb-transitivity" id="transitive" value="3"></input>
                            <label htmlFor="transitive">Transitive Verb</label>
                        </div>
                    </fieldset>

                    <button className='hover:bg-slate-400 border-black border rounded' type='submit'>Submit</button>
                </form>
            </main>
        </div>
    )
}