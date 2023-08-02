require('dotenv').config();
const Search = require('youtube-search');

const opts = {
  key: process.env.YOUTUBE_API_KEY,
  maxResults: 20,
};

exports.youtubeSearch = (keywords) => {
  return new Promise((resolve, reject) => {
    Search(keywords, opts, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};
