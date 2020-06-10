const client = require('../pg_client.js');

let database = null;

client.then((result) => {
  database = result;
  console.log('Connected to Postgres...');
});

module.exports = {
  getProductReviews: (id, cb) => {
    database.connect((err, client, release) => {
      if (err) {
        cb(err, null);
      }
      client.query(
        `SELECT r.review_id, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, json_agg(json_build_object('id', id, 'url', url)) AS photos 
        FROM reviews r
        FULL JOIN review_photos
        ON r.review_id = review_photos.review_id
        WHERE product_id = $1
        GROUP BY r.review_id`,
        [id],
        (err, result) => {
          release();
          if (result !== undefined) {
            const data = {
              product: id,
              page: 0,
              count: result.rows.length,
              results: result.rows,
            };
            for (let i = 0; i < data.results.length; i++) {
              if (data.results[i].photos[0].id === null) {
                data.results[i].photos = [];
              }
            }
            cb(null, data);
          } else {
            cb(err, null);
          }
        }
      );
    });
  },

  getProductMeta: (id, cb) => {
    database.query(
      `SELECT ratings.product_id, ratings, recommended, characteristics 

    FROM (SELECT product_id, json_object_agg(rating, rate_occur) AS ratings
    FROM (SELECT product_id, rating, COUNT(rating) AS rate_occur
    FROM reviews
    WHERE product_id = $1
    GROUP BY product_id, rating) rate_obj
    GROUP BY product_id) ratings
    
    JOIN (SELECT product_id, json_object_agg(recommend, rec_occur) AS recommended
    FROM (SELECT product_id, recommend, COUNT(recommend) AS rec_occur
    FROM reviews
    WHERE product_id = $1
    GROUP BY product_id, recommend) rec_obj
    GROUP BY product_id) recommended
    ON ratings.product_id = recommended.product_id
    
    JOIN (SELECT product_id, json_object_agg(name, json_build_object('id', id, 'value',TRUNC(avg_value, 4))) AS characteristics
    FROM (SELECT c.product_id, c.id, c.name, avg(cr.value) AS avg_value
    FROM characteristics_review cr
    JOIN characteristics c
    ON c.id = cr.characteristic_id
    WHERE c.product_id = $1
    GROUP BY c.product_id, c.name, c.id) char_rating
    GROUP BY product_id) characteristics
    ON ratings.product_id = characteristics.product_id`,
      [id],
      (err, result) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, result.rows[0]);
        }
      }
    );
  },

  addReview: (product_id, review, cb) => {
    database.query(
      `WITH ins1 AS (INSERT INTO reviews 
        (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, helpfulness)
        VALUES ($1, $2, to_date($3, 'YYYY-MM-DD'), $4, $5, $6, false, $7, $8, 0) RETURNING review_id AS r_id),
        
        ins2 AS (INSERT INTO review_photos (review_id, url)
        VALUES ${review.photos
          .reduce(
            (a, url) => a.concat(`((SELECT r_id FROM ins1), '${url}'),`),
            ''
          )
          .slice(0, -1)})
    
        
        INSERT INTO characteristics_review (characteristic_id, review_id, value)
        VALUES ${Object.entries(review.characteristics)
          .reduce(
            (a, char_array) =>
              a.concat(`(
          (SELECT id
          FROM characteristics
          WHERE product_id = ${product_id} AND name = '${char_array[0]}')
          , (SELECT r_id FROM ins1), '${char_array[1].value}'),`),
            ''
          )
          .slice(0, -1)}`,
      [
        product_id,
        review.rating,
        new Date().toISOString().slice(0, 10),
        review.summary,
        review.body,
        review.recommend,
        review.name,
        review.email,
      ],
      (err, result) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, result);
        }
      }
    );
  },

  markHelpful: (review_id, cb) => {
    database.query(
      `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE review_id = $1`,
      [review_id],
      (err, result) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, result);
        }
      }
    );
  },

  reportReview: (review_id, cb) => {
    database.query(
      `UPDATE reviews SET reported = true WHERE review_id = $1`,
      [review_id],
      (err, result) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, result);
        }
      }
    );
  },
};

/* VERY SLOW QUERIES

ENDPOINT 1: 
          SELECT r.review_id, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.photos 
          FROM reviews r
          FULL JOIN (SELECT review_id, json_agg(json_build_object('id', id, 'url', url)) AS photos
          FROM review_photos
          GROUP BY review_id) rp 
          ON r.review_id = rp.review_id
          WHERE product_id = $1
*/
