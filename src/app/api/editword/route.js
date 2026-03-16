import { NextResponse } from "next/server";

function getQuery(formData) {
    //starting the query and concatentating based on the form data
    let query=`UPDATE dictionary SET `

    let definitions = []
    let alternateForms = []
    let similarWords = []
    let etymology = []
    let exampleSentences = []
    let etymologicallyRelatedWords = []
    let usageNotes = []
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
        else if (key.includes('etymologically-related-word')){
            etymologicallyRelatedWords.push(formData.get(key).replaceAll(`'`, `''`))
        }
        else if (key.includes('usage-note')){
            usageNotes.push(formData.get(key).replaceAll(`'`, `''`))
        }
    }

    //word
    query = query.concat(`word = '${formData.get('word')}', `)
    //definitions
    if (definitions.length > 0){
        query = query.concat(`definitions = ARRAY[`)
        for (let i = 0;i < definitions.length; i++) {
            query = query.concat(`'${definitions[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    //word type
    query = query.concat(`word_type = ${formData.get('word-type')}, `)
    //alternate forms
    if (alternateForms.length > 0){
        query = query.concat(`alternate_forms = ARRAY[`)
        for (let i = 0;i < alternateForms.length; i++) {
            query = query.concat(`'${alternateForms[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    //similar_words
    if (similarWords.length > 0){
        query = query.concat(`similar_words = ARRAY[`)
        for (let i = 0;i < similarWords.length; i++) {
            query = query.concat(`'${similarWords[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    //conjugation pattern
    query = query.concat(`verb_conjugation_pattern = ${formData.get('conjugation-pattern')}, `)
    //il/ael contrast
    if (formData.get('has-il-ael-contrast')) {
        query = query.concat('has_il_ael_contrast = true, ')
    }
    else {
        query = query.concat('has_il_ael_contrast = false, ')
    }
    //etymology
    if (etymology.length > 0){
        query = query.concat(`etymology = ARRAY[`)
        for (let i = 0;i < etymology.length; i++) {
            query = query.concat(`'${etymology[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    //example_sentences
    if (exampleSentences.length > 0){
        query = query.concat(`example_sentences = ARRAY[`)
        for (let i = 0;i < exampleSentences.length; i+=3) {
            query = query.concat(`('${exampleSentences[i]}', '${exampleSentences[i+1]}', ${exampleSentences[i+2]})::example_sentence_pair, `)
        }
        query = query.slice(0, -2)
        query = query.concat(']::example_sentence_pair[], ')
    }
    //etymologically_related_words
    if (etymologicallyRelatedWords.length > 0){
        query = query.concat(`etymologically_related_words = ARRAY[`)
        for (let i = 0;i < etymologicallyRelatedWords.length; i++) {
            query = query.concat(`'${etymologicallyRelatedWords[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    //usage_notes
    if (usageNotes.length > 0){
        query = query.concat(`usage_notes = ARRAY[`)
        for (let i = 0;i < usageNotes.length; i++) {
            query = query.concat(`'${usageNotes[i]}', `)
        }
        query = query.slice(0, -2)
        query = query.concat('], ')
    }
    //verb_transitivity
    query = query.concat(`verb_transitivity = ${formData.get('verb-transitivity')} `)

    query = query.concat(`WHERE word_id = ${formData.get('wordid')};`)
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
    // insert the root ids that are left over after removing duplicates
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

async function removeRootDuplicates(wordId, rootIds, client) {
    // get all the root ids for the word
    let query = `SELECT array_agg(roots.root_id) FROM words_roots JOIN dictionary ON words_roots.word_id = dictionary.word_id JOIN roots ON words_roots.root_id = roots.root_id WHERE dictionary.word_id = ${wordId}`
    console.log('getting rood ids')
    console.log(query)
    const res = await client.query(query)
    console.log('roots obtained')
    console.log(res.rows)

    // in js, remove the root ids that already exist
    // for (let rootId of rootsRes){
    //     index = rootIds.indexOf(rootId)
    //     if (index >= 0){
    //         rootIds.splice(index, 1)
    //     }
    // }

    return rootIds
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
    // const result = await client.query(query)
    // const word_id = result.rows[0].word_id
    const rootsAffixes = formData.getAll('roots-affixes')
    rootsAffixes.map((item) => item.replaceAll(`'`, `''`))
    if (rootsAffixes.length > 0) {
        console.log('Roots Affixes', rootsAffixes)
        console.log("insert root starting")
        let root_ids = await insertRoot(rootsAffixes, client)
        console.log("roots inserted successfully")
        console.log(root_ids)

        const word_id = formData.get('wordid')
        root_ids = await removeRootDuplicates(word_id, root_ids, client)
        //    if (root_ids.length() > 0){
        //         const res = await insertWordRootIds(word_id, root_ids, client)
        //    }
    }
    await client.end()

    return NextResponse.json(root_ids);
}