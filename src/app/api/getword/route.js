import { NextResponse } from 'next/server';

export async function POST(request){
    const data = await request.json()
    const wordID = data.wordID
    const pg = require('pg');
    var conString = process.env.CONSTRING

    let query = `SELECT dictionary.*, array_agg(roots.root) FROM words_roots JOIN dictionary ON words_roots.word_id = dictionary.word_id JOIN roots ON words_roots.root_id = roots.root_id WHERE dictionary.word_id = ${wordID} GROUP BY dictionary.word_id`

    var client = new pg.Client({connectionString: conString});
    await client.connect()
    const result = await client.query(query)
    await client.end()

    console.log(result.rows)
    return NextResponse.json(result.rows)
}