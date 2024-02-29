import { NextResponse } from 'next/server';

export async function POST(request) {
    const potentialFilters = ['ilAel', 'noun', 'verb', 'adjective', 'stative', 'pronoun', 'disc_part', 'phrase', 'misc', 'yt', 'uk', 'vu', 'la', 'misc_v']
    const searchIn = ['words', 'definitions', 'rootsAffixes']
    const searchData = await request.json()
    const search = searchData.search
    const filters = searchData.filters
    const pg = require('pg');
    var conString = process.env.CONSTRING

    const query = search == 'all_results' ? 'SELECT * FROM dictionary' : `SELECT * FROM dictionary WHERE word LIKE '%${search}%'`;

    for (let i = 0;i < potentialFilters.length;i++) {
        potentialFilters[i]
    }

    var client = new pg.Client(conString);
    //note to future self
    //actually make this safe
    await client.connect()
    const result = await client.query(query)
    await client.end()

    return NextResponse.json(result.rows)
}