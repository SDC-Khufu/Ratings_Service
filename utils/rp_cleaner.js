const fs = require('fs');
const csv = require('csv-parser');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
const Transform = require('stream').Transform;

const csvStringifier = createCsvStringifier({
  header: [
    { id: 'id', title: 'id' },
    { id: 'review_id', title: 'review_id' },
    { id: 'url', title: 'url' },
  ],
});

let rS = fs.createReadStream('../data/Raw_Data/reviews.csv');
let wS = fs.createWriteStream('../data/Cleaned_Data/cleanedReviews.csv');

class CSVCleaner extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, next) {
    console.log(chunk);
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
