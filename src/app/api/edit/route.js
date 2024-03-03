import { NextResponse } from "next/server";

function getQuery(formData) {
    //starting the query and concatentating based on the form data
    let query=`INSERT INTO dictionary (word, definitions, word_type, alternate_forms, similar_words, verb_conjugation_pattern, has_il_ael_contrast, etymology, example_sentences, grammatically_related_words, grammar_notes, verb_transitivity) VALUES(`

    let definitions = []
    let alternateForms = []
    let similarWords = []
    let etymology = []
    let exampleSentences = []
    let grammaticallyRelatedWords = []
    let grammarNotes = []
    //CHANGE THIS TO GET ALL FUNCTIONS FROM FORM DATA BS THIS IS HELLA INEFFICIENT
    for (const key of formData.keys()){
        if (key.includes('definition')){
            definitions.push(formData.get(key).replaceAll(`'`, `''`))
        }
        else if (key.includes('alternate-form')){
            alternateForms.push(formData.get(key).replaceAll(`'`, `''`))
        }
        else if (key.includes('similar-word')){
            similarWords.push(formData.get(key).replaceAll(`'`, `''`))
        }
        else if (key.includes('etymology')){
            etymology.push(formData.get(key).replaceAll(`'`, `''`))
        }
        else if (key.includes('example-sentence')){
            exampleSentences.push(formData.get(key).replaceAll(`'`, `''`))
        }
        else if (key.includes('grammatically-related-word')){
            grammaticallyRelatedWords.push(formData.get(key).replaceAll(`'`, `''`))
        }
        else if (key.includes('grammar-note')){
            grammarNotes.push(formData.get(key).replaceAll(`'`, `''`))
        }
    }

    //word
    query = query.concat(`'${formData.get('word')}', `)
    //definitions
    if (definitions.length > 0){
        query = query.concat(`ARRAY[`)
        for (let i = 0;i < definitions.length; i++) {
            query = query.concat(`'${definitions[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    else {
        query = query.concat(`ARRAY[''], `)
    }
    //word type
    query = query.concat(`${formData.get('word-type')}, `)
    //alternate forms
    if (alternateForms.length > 0){
        query = query.concat(`ARRAY[`)
        for (let i = 0;i < alternateForms.length; i++) {
            query = query.concat(`'${alternateForms[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    else {
        query = query.concat(`ARRAY[''], `)
    }
    //similar_words
    if (similarWords.length > 0){
        query = query.concat(`ARRAY[`)
        for (let i = 0;i < similarWords.length; i++) {
            query = query.concat(`'${similarWords[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    else {
        query = query.concat(`ARRAY[''], `)
    }
    //conjugation pattern
    query = query.concat(`${formData.get('conjugation-pattern')}, `)
    //il/ael contrast
    if (formData.get('has-il-ael-contrast')) {
        query = query.concat('true, ')
    }
    else {
        query = query.concat('false, ')
    }
    //etymology
    if (etymology.length > 0){
        query = query.concat(`ARRAY[`)
        for (let i = 0;i < etymology.length; i++) {
            query = query.concat(`'${etymology[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    else {
        query = query.concat(`ARRAY[''], `)
    }
    //example_sentences
    
    if (exampleSentences.length > 0){
        query = query.concat(`ARRAY[`)
        for (let i = 0;i < exampleSentences.length; i+=3) {
            query = query.concat(`('${exampleSentences[i]}', '${exampleSentences[i+1]}', ${exampleSentences[i+2]})::example_sentence_pair, `)
        }
        query = query.slice(0, -2)
        query = query.concat(']::example_sentence_pair[], ')
    }
    else {
        query = query.concat(`ARRAY[('', '', null)::example_sentence_pair]::example_sentence_pair[], `)
    }
    //grammatically_related_words
    if (grammaticallyRelatedWords.length > 0){
        query = query.concat(`ARRAY[`)
        for (let i = 0;i < grammaticallyRelatedWords.length; i++) {
            query = query.concat(`'${grammaticallyRelatedWords[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    else {
        query = query.concat(`ARRAY[''], `)
    }
    //grammar_notes
    if (grammarNotes.length > 0){
        query = query.concat(`ARRAY[`)
        for (let i = 0;i < grammarNotes.length; i++) {
            query = query.concat(`'${grammarNotes[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    else {
        query = query.concat(`ARRAY[''], `)
    }
    //verb_transitivity
    query = query.concat(`${formData.get('verb-transitivity')}) `)

    query = query.concat('RETURNING word_id;')
    return query
}

async function insertRoot(rootsAffixes, client) {
    let root_ids = []

    let query1 = `SELECT * FROM roots WHERE root IN (`

    //select existing roots from db and get their ids
    for (let i = 0;i < rootsAffixes.length;i++) {
        query1 = query1.concat(`'${rootsAffixes[i]}', `)
    }
    query1 = query1.slice(0, -2)
    query1 = query1.concat(');')


    console.log("query1: ", query1)
    const result1 = await client.query(query1)
    console.log(result1.rows)
    for (let i = result1.rows.length - 1;i >= 0;i--) {
        //store already existing root ids, remove roots that were present in the roots table
        root_ids.push(result1.rows[i].root_id)
        let index = rootsAffixes.indexOf(result1.rows[i].root)
        rootsAffixes.splice(index, 1)
    }

    //rootsAffixes contains roots that were not present in the root table
    if (rootsAffixes.length > 0){
        let query2 = `INSERT INTO roots(root) VALUES `

        //select existing roots from db and get their ids
        for (let i = 0;i < rootsAffixes.length;i++) {
            query2 = query2.concat(`('${rootsAffixes[i]}'), `)
        }
        query2 = query2.slice(0, -2)
        query2 = query2.concat(' RETURNING root_id;')

        console.log("query2: ", query2)
        const result2 = await client.query(query2)
        console.log(result2.rows)
        for (let i = 0;i < result2.rows.length;i++) {
            //store root ids of newly inserted roots
            root_ids.push(result2.rows[i].root_id)
        }
    }
    

    return root_ids
}

async function insertWordRootIds(wordId, rootIds, client) {
    let query = `INSERT INTO words_roots (word_id, root_id) VALUES `

    for (let i = 0;i < rootIds.length;i++){
        query = query.concat(`(${wordId}, ${rootIds[i]}), `)
    }
    query = query.slice(0, -2)
    query = query.concat(';')

    console.log(query)
    console.log("inserting root/word ids")
    const res = await client.query(query)
    console.log("insertion complete")

    return res
}

export async function POST(request) {
    console.log("request received")
    const formData = await request.formData()
    console.log("form data received")
    console.log(formData)
    const query = getQuery(formData)
    console.log(query)
    
    const pg = require('pg');
    var conString = process.env.CONSTRING
    
    var client = new pg.Client(conString);
    await client.connect();
    const result = await client.query(query)
    const word_id = result.rows[0].word_id
    const rootsAffixes = formData.getAll('roots-affixes')
    rootsAffixes.map((item) => item.replaceAll(`'`, `''`))
    if (rootsAffixes.length > 0) {
        console.log('Roots Affixes', rootsAffixes)
        console.log("insert root starting")
        const root_ids = await insertRoot(rootsAffixes, client)
        console.log("roots inserted successfully")
        console.log(root_ids)
        
        const res = await insertWordRootIds(word_id, root_ids, client)
    }
    await client.end()

    return NextResponse.json(result);
}