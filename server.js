const express = require('express');
const bodyparser = require('body-parser');
const axios = require('axios');
const morgan = require('morgan');
const routes = require('./routes/routes.js');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.text());
app.use(bodyparser.urlencoded());
app.use(morgan('dev'));

app.use('/reviews', routes);

app.get('/loaderio-2ad9f604cef65c3d99a0d8832121dc87/', (req, res) => {
  res.send('loaderio-2ad9f604cef65c3d99a0d8832121dc87');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
