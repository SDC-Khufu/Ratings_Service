const fs = require('fs');
const csv = require('csv-parser');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
const Transform = require('stream').Transform;

const csvStringifier = createCsvStringifier({
  header: [
    { id: 'id', title: 'id' },
    { id: 'product_id', title: 'product_id' },
    { id: 'rating', title: 'rating' },
    { id: 'date', title: 'date' },
    { id: 'summary', title: 'summary' },
    { id: 'body', title: 'body' },
    { id: 'recommend', title: 'recommend' },
    { id: 'reported', title: 'reported' },
    { id: 'reviewer_name', title: 'reviewer_name' },
    { id: 'reviewer_email', title: 'reviewer_email' },
    { id: 'response', title: 'response' },
    { id: 'helpfulness', title: 'helpfulness' },
  ],
});

let rS = fs.createReadStream('../data/Raw_Data/reviews.csv');
let wS = fs.createWriteStream('../data/Cleaned_Data/cleanedReviews.csv');

class CSVCleaner extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, next) {
    if (chunk.recommend === 'true') {
      console.log('BEFORE TRUTHIFICATION', chunk.recommend);
      chunk.recommend = 1;
      console.log('AFTER TRUTHIFICATION', chunk.recommend);
    } else if (chunk.recommend === 'false') {
      chunk.recommend = 0;
    }
    chunk = csvStringifier.stringifyRecords([chunk]);
    this.push(chunk);
    next();
  }
}

const transformer = new CSVCleaner({ writableObjectMode: true });

wS.write(csvStringifier.getHeaderString());

rS.pipe(csv())
  .pipe(transformer)
  .pipe(wS)
  .on('finish', () => {
    console.log('finished');
  });
