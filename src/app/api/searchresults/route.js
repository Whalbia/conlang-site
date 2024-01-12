import { NextResponse } from 'next/server';

//export async function GET(request) {
    //console.log(search)
    // const pg = require('pg');
    // var conString = process.env.CONSTRING
    // //const params = request.query;
    // // const query = `SELECT * FROM dictionary WHERE word LIKE '%${params.word}%'`;
    // const query = `SELECT * FROM dictionary WHERE word LIKE '%%'`;
    // var client = new pg.Client(conString);
    // await client.connect();

    // client.query(query, [], (err, result) => {
    //     if (err) {
    //         console.error('Error executing query:', err);
    //         return NextResponse.json({ message: err })
    //     } 
    //     else {
    //         return NextResponse.json(result.rows)
    //     }
    
    //     client.end();
    // })
//}

export async function POST(request) {
    const searchData = await request.json()
    const search = searchData.search
    const pg = require('pg');
    var conString = process.env.CONSTRING
    const query = `SELECT * FROM dictionary WHERE word LIKE '%${search}%'`;
    var client = new pg.Client(conString);

    await client.connect()
    const result = await client.query(query)
    await client.end()

    return NextResponse.json(result.rows)
    // client.query(query, [], (err, result) => {
    //     if (err) {
    //         console.error('Error executing query:', err);
    //         client.end();
    //         return NextResponse.json({ message: err })
    //     } 
    //     client.end();
    //     return NextResponse.json(result.rows)
    // })
}