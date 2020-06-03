const express = require('express');
const bodyparser = require('body-parser');
const axios = require('axios');
const morgan = require('morgan');
const client = require('./pg_client');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.text());
app.use(bodyparser.urlencoded());
app.use(morgan('dev'));

client.connect();

app.get('/', (req, res) => {
  client.query('SELECT * FROM team;', (err, dbResponse) => {
    if (err) {
      res.status(400);
      res.send('Database is not connected successfully!');
    }
    res.send(dbResponse);
    client.end();
  });
});

app.get('/reviews/:product_id/list');

app.get('/reviews/:product_id/meta');

app.post('/reviews/:product_id');

app.put('/reviews/helpful/:review_id');

app.put('/reviews/report/:review_id');

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
