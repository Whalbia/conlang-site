'use client'

import { useState } from "react"
import { updateDatabase } from "../api/updatedatabase"

export default function Page() {
    let [definitions, setDefinitions] = useState([])
    let [alternateForms, setAlternateForms] = useState([])
    let [similarWords, setSimilarWords] = useState([])
    let [etymology, setEtymology] = useState([])
    let [exampleSentences, setExampleSentences] = useState([])
    let [grammaticallyRelatedWords, setGrammaticallyRelatedWords] = useState([])
    let [grammarNotes, setGrammarNotes] = useState([])

    function submit(formData) {
        updateDatabase(formData)
        location.reload()
    }

    function addDefinition(e) {
        e.preventDefault()
        let newDefinitions = []
        const newDefinitionAmount = definitions.length / 2 + 1

        newDefinitions.push(<label htmlFor={`definition-${newDefinitionAmount}`}>Definition {newDefinitionAmount}</label>)
        newDefinitions.push(<input className='border-black border rounded' type='text' id={`definition-${newDefinitionAmount}`} name={`definition-${newDefinitionAmount}`}></input>)

        setDefinitions(definitions.concat(newDefinitions))
    }

    function addAlternateForm(e) {
        e.preventDefault()
        let newAlternateForms = []
        const newAlternateFormAmount = alternateForms.length / 2 + 1

        newAlternateForms.push(<label htmlFor={`alternate-form-${newAlternateFormAmount}`}>Alternate Form {newAlternateFormAmount}</label>)
        newAlternateForms.push(<input className='border-black border rounded' type='text' id={`alternate-form-${newAlternateFormAmount}`} name={`alternate-form-${newAlternateFormAmount}`}></input>)

        setAlternateForms(alternateForms.concat(newAlternateForms))
    }

    function addSimilarWord(e) {
        e.preventDefault()
        let newSimilarWords = []
        const newSimilarWordAmount = similarWords.length / 2 + 1

        newSimilarWords.push(<label htmlFor={`similar-word-${newSimilarWordAmount}`}>Similar Word {newSimilarWordAmount}</label>)
        newSimilarWords.push(<input className='border-black border rounded' type='text' id={`similar-word-${newSimilarWordAmount}`} name={`similar-word-${newSimilarWordAmount}`}></input>)

        setSimilarWords(similarWords.concat(newSimilarWords))
    }

    function addEtymology(e) {
        e.preventDefault()
        let newEtymology = []
        const newEtymologyAmount = etymology.length / 2 + 1

        newEtymology.push(<label htmlFor={`etymology-${newEtymologyAmount}`}>Etymology {newEtymologyAmount}</label>)
        newEtymology.push(<input className='border-black border rounded' type='text' id={`etymology-${newEtymologyAmount}`} name={`etymology-${newEtymologyAmount}`}></input>)

        setEtymology(etymology.concat(newEtymology))
    }

    function addExampleSentences(e) {
        e.preventDefault()
        let newExampleSentences = []
        const newExampleSentencesAmount = exampleSentences.length / 6 + 1

        newExampleSentences.push(<label htmlFor={`example-sentence-english-${newExampleSentencesAmount}`}>Example Sentence {newExampleSentencesAmount} (English)</label>)
        newExampleSentences.push(<input className='border-black border rounded' type='text' id={`example-sentence-english-${newExampleSentencesAmount}`} name={`example-sentence-english-${newExampleSentencesAmount}`}></input>)

        newExampleSentences.push(<label htmlFor={`example-sentence-conlang-${newExampleSentencesAmount}`}>Example Sentence {newExampleSentencesAmount} (Conlang)</label>)
        newExampleSentences.push(<input className='border-black border rounded' type='text' id={`example-sentence-conlang-${newExampleSentencesAmount}`} name={`example-sentence-conlang-${newExampleSentencesAmount}`}></input>)

        newExampleSentences.push(<label htmlFor={`example-sentence-def-${newExampleSentencesAmount}`}>Which Definition Does This Sentence Correspond To?</label>)
        newExampleSentences.push(<input className='border-black border rounded' type='text' id={`example-sentence-def-${newExampleSentencesAmount}`} name={`example-sentence-def-${newExampleSentencesAmount}`}></input>)
        setExampleSentences(exampleSentences.concat(newExampleSentences))
    }

    function addGrammaticallyRelatedWord(e) {
        e.preventDefault()
        let newGrammaticallyRelatedWord = []
        const newGrammaticallyRelatedWordAmount = grammaticallyRelatedWords.length / 2 + 1

        newGrammaticallyRelatedWord.push(<label htmlFor={`grammatically-related-word-${newGrammaticallyRelatedWordAmount}`}>Grammatically Related Word {newGrammaticallyRelatedWordAmount}</label>)
        newGrammaticallyRelatedWord.push(<input className='border-black border rounded' type='text' id={`grammatically-related-word-${newGrammaticallyRelatedWordAmount}`} name={`grammatically-related-word-${newGrammaticallyRelatedWordAmount}`}></input>)

        setGrammaticallyRelatedWords(grammaticallyRelatedWords.concat(newGrammaticallyRelatedWord))
    }

    function addGrammarNote(e) {
        e.preventDefault()
        let newGrammarNote = []
        const newGrammarNoteAmount = grammarNotes.length / 2 + 1
        newGrammarNote.push(<label htmlFor={`grammar-note-${newGrammarNoteAmount}`}>Grammar Note {newGrammarNoteAmount}</label>)
        newGrammarNote.push(<input className='border-black border rounded' type='text' id={`grammar-note-${newGrammarNoteAmount}`} name={`grammar-note-${newGrammarNoteAmount}`}></input>)

        setGrammarNotes(grammarNotes.concat(newGrammarNote))
    }


    return (
        <div className="overflow-hidden">
            <main className="flex flex-col items-center justify-start w-screen min-h-screen">
                <form className='flex flex-col gap-y-5' id='SubmitForm' action={submit}>
                    <div className="flex flex-col ">
                        <label className="text-xl underline" htmlFor='word'>Word</label>
                        <input className='border-black border rounded pl-1' type='text' id='word' name="word"></input>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Definitions</p>
                        {definitions}
                        <button className='hover:bg-slate-400 border-black border rounded' onClick={addDefinition}>Add Definition</button>
                    </div>

                    <fieldset className="flex flex-col">
                        <p className="text-xl underline">Word Type</p>
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

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Alternate Forms</p>
                        {alternateForms}
                        <button className='hover:bg-slate-400 border-black border rounded' onClick={addAlternateForm}>Add Alternate Form</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Similar Words</p>
                        {similarWords}
                        <button className='hover:bg-slate-400 border-black border rounded' onClick={addSimilarWord}>Add Similar Word</button>
                    </div>

                    <fieldset className="flex flex-col">
                        <p className="text-xl underline">Verb Conjugation Pattern</p>
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

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Etymology</p>
                        {etymology}
                        <button className='hover:bg-slate-400 border-black border rounded' onClick={addEtymology}>Add Etymology</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Example Sentences</p>
                        {exampleSentences}
                        <button className='hover:bg-slate-400 border-black border rounded' onClick={addExampleSentences}>Add Example Sentence</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Grammatically Related Words</p>
                        {grammaticallyRelatedWords}
                        <button className='hover:bg-slate-400 border-black border rounded' onClick={addGrammaticallyRelatedWord}>Add Grammatically Related Word</button>
                    </div>

                    <div className="flex flex-col ">
                        <p className="text-xl underline">Grammar Notes</p>
                        {grammarNotes}
                        <button className='hover:bg-slate-400 border-black border rounded' onClick={addGrammarNote}>Add Grammar Note</button>
                    </div>

                    <fieldset className="flex flex-col">
                        <p className="text-xl underline">Verb Transitivity</p>
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