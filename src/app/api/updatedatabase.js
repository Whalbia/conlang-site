'use server'

export async function updateDatabase(formData) {
    const pg = require('pg');
    var conString = process.env.CONSTRING;
    var client = new pg.Client(conString);
    client.connect();

    const query=""

    for (const key of formData.keys()){
        console.log(key)
        console.log(formData.get(key))
    }

    client.query(query, [], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            console.log("error");
        } else {
            res.json(result.rows);
        }
    
        client.end();
    })
}