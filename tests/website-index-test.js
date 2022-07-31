/*
 * AUTHOR:  Adam Walters
 *
 * CREATED:  11/13/2021
 * MODIFIED: 11/13/2021
 */

const request = require('supertest');

const log = require('../server/log');
log.setEnabled(false);

describe('The backend website server', () => {

	// Create Express app and listen before tests (and close after)
	let app;
	before((done) => {
		app = require('../server');
		done();
	});
	after(() => {
		app.close();
	});

	// Define tests
	it('should send index.html with no path', (done) => {
		request(app)
			.get('/')
			.expect('Content-Type', /text\/html/)
			.expect(200, done);
	});
	it('should send index.html with status 200 with a non-API path', (done) => {
		request(app)
			.get('/somePath')
			.expect('Content-Type', /text\/html/)
			.expect(200, done);
	})

});