/*
 * AUTHOR:  Adam Walters
 *
 * CREATED:  11/28/2021
 * MODIFIED: 11/28/2021
 */

const log = require('../log');
const { MongoClient } = require('mongodb');

// Connect to DB (if on server)
const client = new MongoClient('mongodb://localhost:27017', {
	useUnifiedTopology: true
});
if (process.platform == 'linux') {
	client.connect((err) => {
		if (err) {
			log.error(`Failed to connect to MongoDB: ${err}`);
			process.exit(-1);
		}
	});
}

module.exports = client;
