const express = require('express');
const bodyparser = require('body-parser');
const axios = require('axios');
const morgan = require('morgan');
const routes = require('./routes/routes.js');
const client = require('./pg_client');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.text());
app.use(bodyparser.urlencoded());
app.use(morgan('dev'));

let database = null;

client.then((result) => {
  database = result;
});

app.get('/', (req, res) => {
  database.query(
    'SELECT * FROM public.reviews ORDER BY id ASC LIMIT 10;',
    (err, dbResponse) => {
      if (err) {
        console.log(err);
        res.status(400);
        res.send('Database is not connected successfully!');
      }
      res.send(dbResponse.rows);
    }
  );
});

app.use('/reviews', routes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
