import { NextResponse } from 'next/server';

function createQuery(searchData) {
    const wordTypes = {
        'noun' : '1',
        'verb' : '2',
        'adjective' : '3',
        'stative' : '4',
        'pronoun' : '5',
        'disc_part' : '6',
        'phrase' : '7',
        'misc' : '8'
    }

    const verbConjugationPatterns = {
                        'yt' : '2',
                        'uk' : '3',
                        'vu' : '4',
                        'la' : '5',
                        'misc_v' : '6'
                    }
    const search = searchData.search
    const filters = searchData.filters
    console.log('search', search)
    console.log('filters', filters)
    let searchParams = []
    let filterParams = []
    let query = 'SELECT dictionary.*, array_agg(roots.root) FROM words_roots JOIN dictionary ON words_roots.word_id = dictionary.word_id JOIN roots ON words_roots.root_id = roots.root_id'

    if (filters) {
        query = query.concat(' WHERE')
        //set queries for matching the search
        //CHANGE TO SEARCH IN AND FILTERS
        filters.includes('words') ? (search == 'all_results' ? '' : searchParams.push(` dictionary.word LIKE '%${search}%' `)) : ''
        filters.includes('definitions') ? (search == 'all_results' ? '' : searchParams.push(` array_to_string(dictionary.definitions, ',') LIKE '%${search}%' `)) : ''
        filters.includes('rootsAffixes') ? (search == 'all_results' ? '' : searchParams.push(` roots.root LIKE '%${search}%' `)) : ''
        filters.includes('etymologically') ? (search == 'all_results' ? '' : searchParams.push(` array_to_string(dictionary.etymologically_related_words, ',') ~* '\\y${search}\\y' `)) : ''

        //Il Ael contrast
        filters.includes('ilAel') ? filterParams.push(' has_il_ael_contrast = true ') : ''

        //Word Type
        for (let i = 0;i < Object.keys(wordTypes).length;i++) {
            let key = Object.keys(wordTypes)[i]
            filters.includes(key) ? filterParams.push(` word_type = ${wordTypes[key]} `) : ''
        }

        //Verb Conjugation
        for (let i = 0;i < Object.keys(verbConjugationPatterns).length;i++) {
            let key = Object.keys(verbConjugationPatterns)[i]
            filters.includes(key) ? filterParams.push(` verb_conjugation_pattern = ${verbConjugationPatterns[key]} `) : ''
        }

        //update query based on filters
        let searchQuery = ` (${searchParams.join("OR")})`
        let filterQuery = ` (${filterParams.join("OR")})`
        if (searchQuery != ' ()' && filterQuery != ' ()') {
            query = query.concat(`${searchQuery} AND ${filterQuery}`)
        }
        else if (searchQuery != ' ()') {
            query = query.concat(`${searchQuery}`)
        }
        else {
            query = query.concat(`${filterQuery}`)
        }
    }
    else {
        search == 'all_results' ? '' : query = query.concat(` WHERE dictionary.word LIKE '%${search}%' `);
    }

    query = query.concat(' GROUP BY dictionary.word_id')
    console.log(query)

    return query
}

export async function POST(request) {
    const searchData = await request.json()
    const pg = require('pg');
    var conString = process.env.CONSTRING

    let query = createQuery(searchData)

    var client = new pg.Client({connectionString: conString});
    await client.connect()
    const result = await client.query(query)
    await client.end()

    return NextResponse.json(result.rows)
}