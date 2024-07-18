const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'tiger',
    database: 'docker'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to database: ', err.stack);
        return;
    }
    console.log('Connected to database as id ', connection.threadId);
});

// For handling data import from frontend
app.post('/import-from-frontend', (req, res) => {
    const data = req.body;
    // console.log(data.records);

    if (!data || !data.records || data.records.length === 0) {
        return res.status(400).json({ error: 'No records to import' });
    }

    const records = data.records;

    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

    const values = records.flatMap(record => {
        const { first_name, last_name, role, email, location, start_date, salary } = record;
        return [first_name, last_name, role, email, location, start_date, salary];
    });

    const query = `INSERT INTO oneschema (first_name, last_name, role, email, location, start_date, salary) VALUES ${placeholders}`;

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting into database: ', err);
            return res.status(500).send('Error inserting into database');
        }
        console.log(`Inserted ${results.affectedRows} records`);
        res.json({ message: `Inserted ${results.affectedRows} records` });
    });
});

// For fetching data from DB
app.get('/fetch-data', (req, res) => {
    const query = 'SELECT * FROM oneschema';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from database: ', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

