const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('locations', { title: 'Select Location' });
});

module.exports = router;
