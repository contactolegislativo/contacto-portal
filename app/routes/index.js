var express = require('express');
var router = express.Router();
var models  = require('../models');

/* /asistencias */
router.get('/asistencias',(req, res, next) => {
	res.render('attendance', {
			title: 'Asistencia'
		});
});


module.exports = router;
