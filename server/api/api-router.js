/*
 * AUTHOR:  Adam Walters
 *
 * CREATED:  11/05/2021
 * MODIFIED: 11/28/2021
 */

const express = require('express');
const router = express.Router();

// Define parsing middleware
router.use(express.json());

// Load and use routes
router.use('/menu', require('./routes/menu'));

// Define base GET and 404
router.get('/', (req, res) => {
	res.status(200).send({ status: 'online' });
});
router.use((req, res, next) => {
	res.status(404).send({ error: 'Not a valid endpoint' });
});

module.exports = router;
