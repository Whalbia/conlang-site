'use server'

export async function updateDatabase(formData) {
    const pg = require('pg');
    var conString = process.env.CONSTRING;
    var client = new pg.Client(conString);
    client.connect();

    // //starting the query and concatentating based on the form data
    // let query=`INSERT INTO dictionary (word, definitions, word_type, alternate_forms, similar_words, verb_conjugation_pattern, has_il_ael_contrast, etymology, example_sentences, grammatically_related_words, grammar_notes, verb_transitivity) VALUES(`

    // let definitions = []
    // let alternateForms = []
    // let similarWords = []
    // let etymology = []
    // let exampleSentences = []
    // let grammaticallyRelatedWords = []
    // let grammarNotes = []
    // for (const key of formData.keys()){
    //     if (key.includes('definition')){
    //         definitions.push(formData.get(key).replaceAll(`'`, `''`))
    //     }
    //     else if (key.includes('alternate-forms')){
    //         alternateForms.push(formData.get(key).replaceAll(`'`, `''`))
    //     }
    //     else if (key.includes('similar-words')){
    //         similarWords.push(formData.get(key).replaceAll(`'`, `''`))
    //     }
    //     else if (key.includes('etymology')){
    //         etymology.push(formData.get(key).replaceAll(`'`, `''`))
    //     }
    //     else if (key.includes('example-sentence')){
    //         exampleSentences.push(formData.get(key).replaceAll(`'`, `''`))
    //     }
    //     else if (key.includes('grammatically-related-words')){
    //         grammaticallyRelatedWords.push(formData.get(key).replaceAll(`'`, `''`))
    //     }
    //     else if (key.includes('grammar-notes')){
    //         grammarNotes.push(formData.get(key).replaceAll(`'`, `''`))
    //     }
    //     console.log(key) 
    // }

    // //word
    // query = query.concat(`'${formData.get('word')}', `)
    // //definitions
    // if (definitions.length > 0){
    //     query = query.concat(`ARRAY[`)
    //     for (let i = 0;i < definitions.length; i++) {
    //         query = query.concat(`'${definitions[i]}', `)
    //     }
    //     query = query.slice(0, -2)
    //     query = query.concat('], ')
    // }
    // else {
    //     query = query.concat(`ARRAY[''], `)
    // }
    // //word type
    // query = query.concat(`${formData.get('word-type')}, `)
    // //alternate forms
    // if (alternateForms.length > 0){
    //     query = query.concat(`ARRAY[`)
    //     for (let i = 0;i < alternateForms.length; i++) {
    //         query = query.concat(`'${alternateForms[i]}', `)
    //     }
    //     query = query.slice(0, -2)
    //     query = query.concat('], ')
    // }
    // else {
    //     query = query.concat(`ARRAY[''], `)
    // }
    // //similar_words
    // if (similarWords.length > 0){
    //     query = query.concat(`ARRAY[`)
    //     for (let i = 0;i < similarWords.length; i++) {
    //         query = query.concat(`'${similarWords[i]}', `)
    //     }
    //     query = query.slice(0, -2)
    //     query = query.concat('], ')
    // }
    // else {
    //     query = query.concat(`ARRAY[''], `)
    // }
    // //conjugation pattern
    // query = query.concat(`${formData.get('conjugation-pattern')}, `)
    // //il/ael contrast
    // if (formData.get('has-il-ael-contrast')) {
    //     query = query.concat(`${formData.get('has-il-ael-contrast')}, `)
    // }
    // else {
    //     query = query.concat('false, ')
    // }
    // //etymology
    // if (etymology.length > 0){
    //     query = query.concat(`ARRAY[`)
    //     for (let i = 0;i < etymology.length; i++) {
    //         query = query.concat(`'${etymology[i]}', `)
    //     }
    //     query = query.slice(0, -2)
    //     query = query.concat('], ')
    // }
    // else {
    //     query = query.concat(`ARRAY[''], `)
    // }
    // //example_sentences
    
    // if (exampleSentences.length > 0){
    //         query = query.concat(`ARRAY[`)
    //         for (let i = 0;i < exampleSentences.length; i+=3) {
    //         query = query.concat(`('${exampleSentences[i]}', '${exampleSentences[i+1]}', ${exampleSentences[i+2]})::example_sentence_pair, `)
    //     }
    //     query = query.slice(0, -2)
    //     query = query.concat(']::example_sentence_pair[], ')
    // }
    // else {
    //     query = query.concat(`ARRAY[''], `)
    // }
    // //grammatically_related_words
    // if (grammaticallyRelatedWords.length > 0){
    //     query = query.concat(`ARRAY[`)
    //     for (let i = 0;i < grammarNotes.length; i++) {
    //         query = query.concat(`'${grammarNotes[i]}', `)
    //     }
    //     query = query.slice(0, -2)
    //     query = query.concat('], ')
    // }
    // else {
    //     query = query.concat(`ARRAY[''], `)
    // }
    // //grammar_notes
    // if (grammarNotes.length > 0){
    //     query = query.concat(`ARRAY[`)
    //     for (let i = 0;i < grammarNotes.length; i++) {
    //         query = query.concat(`'${grammarNotes[i]}', `)
    //     }
    //     query = query.slice(0, -2)
    //     query = query.concat('], ')
    // }
    // else {
    //     query = query.concat(`ARRAY[''], `)
    // }
    // //verb_transitivity
    // query = query.concat(`${formData.get('verb-transitivity')});`)


    console.log(query)

    client.query(query, [], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            console.log("error");
        }
        else {
            console.log("success")
        }
    
        client.end();
    })
}