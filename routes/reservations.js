const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/new', reservationController.getReservationForm);

router.post('/', reservationController.createReservation);

module.exports = router;
