/*
 * AUTHOR:  Adam Walters
 *
 * CREATED:  11/08/2021
 * MODIFIED: 11/13/2021
 */

const PORT = 8080;

const path = require('path');
const fs = require('fs');
const log = require('./log');
const express = require('express');
const app = express();

// Verify webpage is built
const webStaticPath = path.join(__dirname, '../build');
if (!fs.existsSync(webStaticPath)) {
	log.error(`React app was not built (expected directory at ${webStaticPath})`);
	process.exit(1);
}

// Connect logger for all incoming requests
app.use((req, res, next) => {
	log.info(`${req.method} "${req.originalUrl}" by ${req.ip}`);
	next();
});

// Connect API path
app.use('/api', require('./api/api-router'));

// Statically serve webpage at the root path
app.use(express.static(webStaticPath));
app.get('/*', (req, res) => {
	res.sendFile(path.join(webStaticPath, 'index.html'), (err) => {
		if (err) {
			res.status(500).send(err);
		}
	});
});

module.exports = app.listen(PORT, () => log.info(`Webserver is now listening on port ${PORT}...`));
