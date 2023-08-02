const { promisify } = require('util');

// Helper function to promisify db.get
const dbGetAsync = promisify((db, query, params, cb) =>
  db.get(query, params, cb),
);

// Helper function to promisify db.run
const dbRunAsync = promisify((db, query, params, cb) =>
  db.run(query, params, cb),
);

module.exports = { dbGetAsync, dbRunAsync };
