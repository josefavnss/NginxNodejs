const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const config = {
  host: 'db',
  user: 'root',
  password: 'root',
  database: 'nodedb',
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(config);

  connection.connect(function (err) {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('Connected to MySQL');
      insertMultipleNames();
    }
  });

  connection.on('error', function (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

function insertMultipleNames() {
  const names = ['Maria', 'João', 'Ana', 'Pedro'];

  const sql = 'INSERT INTO people (name) VALUES ?';
  const values = names.map(name => [name]);

  connection.query(sql, [values], (err, results) => {
    if (err) {
      console.error('Error inserting multiple names:', err);
    } else {
      console.log(`${results.affectedRows} names inserted`);
    }
  });
}

handleDisconnect();

app.get('/', (req, res) => {
  connection.query('SELECT name FROM people', (err, results) => {
    if (err) {
      console.error('Error fetching from table:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    let response = '<h1>Full Cycle Rocks!</h1><ul>';
    results.forEach(row => {
      response += `<li>${row.name}</li>`;
    });
    response += '</ul>';
    res.send(response);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});