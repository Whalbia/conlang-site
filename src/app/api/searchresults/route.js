import { NextResponse } from 'next/server';

export async function POST(request) {
    const searchData = await request.json()
    const search = searchData.search
    const pg = require('pg');
    var conString = process.env.CONSTRING

    const query = `SELECT * FROM dictionary WHERE word LIKE '%${search}%'`;
    //const values = [search]

    var client = new pg.Client(conString);
    //note to future self
    //actually make this safe
    await client.connect()
    const result = await client.query(query)
    await client.end()

    return NextResponse.json(result.rows)
}