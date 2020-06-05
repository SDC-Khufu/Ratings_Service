const Router = require('express').Router();

Router.get('/:product_id/list');

Router.get('/:product_id/meta');

Router.post('/:product_id');

Router.put('/helpful/:review_id');

Router.put('/report/:review_id');

module.exports = Router;
