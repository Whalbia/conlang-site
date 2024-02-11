export default function DictionaryCard({data}) {
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
        '2': '-yt verb',
        '3': '-uk verb',
        '4': '-vu verb',
        '5': '-la verb',
        '6': 'misc verb'
    }
    const verb_transitivity = {
        //1 = not a verb
        '2': 'intransitive verb',
        '3': 'transitive verb',
        '4': 'ambitransitive'
    }

    return (
        <div className="w-2/5 h-auto border-[1px] rounded-sm border-black p-4">
            <h1 className="text-2xl">{data.word}</h1> 
            <div className="">
                <p>{word_type[data.word_type]}.</p> 
                <p>{verb_conjugation_pattern[data.verb_conjugation_pattern]}</p> 
                <p>{verb_transitivity[data.verb_transitivity]}</p> 
                <p>{data.has_il_ael_contrast ? 'Has Il Ael Contrast' : ''}</p> 
            </div>
            <p className="">similar_words: {data.similar_words}</p> 
            <hr></hr>
            <ul className="">
                {data.definitions.map((definition, index) => { 
                    return <li>{index+1}. {definition}</li>
                })}
            </ul>
            <p>etymology: {data.etymology}</p>
            <p>alternate_forms: {data.alternate_forms}</p> 
            <p>example_sentences: {data.example_sentences}</p>
            <p>grammatically_related_words:</p>
            <ul className="">
                {data.grammatically_related_words.map((word, index) => {
                    return <li>{index+1}. {word}</li>
                })}
            </ul>
            <p>grammar_notes: {data.grammar_notes}</p>
        </div>
    );
}