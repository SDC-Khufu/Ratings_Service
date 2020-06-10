const Router = require('express').Router();
const models = require('../models/models.js');

Router.get('/:product_id/list', (req, res) => {
  models.getProductReviews(req.params.product_id, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.send(data);
    }
  });
});

Router.get('/:product_id/meta', (req, res) => {
  models.getProductMeta(req.params.product_id, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.send(data);
    }
  });
});

Router.post('/:product_id', (req, res) => {
  models.addReview(req.params.product_id, req.body, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(201);
    }
  });
});

Router.put('/helpful/:review_id', (req, res) => {
  models.markHelpful(req.params.review_id, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(204);
    }
  });
});

Router.put('/report/:review_id', (req, res) => {
  models.reportReview(req.params.review_id, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = Router;
