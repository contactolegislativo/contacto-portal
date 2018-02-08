var express = require('express');
var router = express.Router();
var models  = require('../models');
var states = require('../config/states-cache.json');

var cache = {};
states.forEach(state => {
	cache[state.snake] = state;
});

var renderError = function(res, message) {
	res.render('error', {
		title: 'Error',
		message: message
	});
}

var urlParamsValidator = function(req, res, next) {
	let stateName = req.params.state;
	let id = req.params.id;

	// If state name does not exist
	if(!cache.hasOwnProperty(stateName)) {
		renderError(res, `No tenemos informacion para ${stateName}.`);
	} else if(id > cache[stateName].districts) {
		renderError(res, `El estado ${cache[stateName].name} no tiene distrito ${id}.`);
	} else {
		next();
	}
}

/* /diputado/<estado>/distrito/<no> */
router.get('/:state/distrito/:id', urlParamsValidator, (req, res, next) => {
	let queryString =
  	'select * from Seats s join Deputies d on s.id = d.SeatId where s.state = :stateName and s.area = :district order by s.id';

  models.sequelize
	  .query(queryString, {
	    replacements: {
				stateName: cache[req.params.state].name,
				district: req.params.id
			},
	    type: models.sequelize.QueryTypes.SELECT
	  })
	  .then(function(deputies) {
			res.render('index', {
		  		title: 'Diputado',
					deputy: deputies[0],
					alternate: deputies[1],
					host: req.headers.host
				});
	  }, function(err) {
			console.log(err);
			renderError(res, `No se pudo encontrar informacion para el distrito  ${req.params.id} de ${cache[req.params.state].name}.`);
		});
});

/* /legislatura/LXIII/diputado/{state}/circunscripcion/{ditrict}/{id} */
router.get('/:state/circunscripcion/:districtId/:id', (req, res, next) => {
	let queryString =
  	'select * from Seats s join Deputies d on s.id = d.SeatId where s.state = :stateName and s.area = :district and s.id = :id order by s.id';

  models.sequelize
	  .query(queryString, {
	    replacements: {
				stateName: cache[req.params.state].name,
				district: req.params.districtId,
				id: req.params.id
			},
	    type: models.sequelize.QueryTypes.SELECT
	  })
	  .then(function(deputies) {
			res.render('index', {
		  		title: 'Diputado',
					deputy: deputies[0],
					alternate: deputies[1],
					host: req.headers.host
				});
	  }, function(err) {
			console.log(err);
			renderError(res, `No se pudo encontrar informacion para el distrito  ${req.params.id} de ${cache[req.params.state].name}.`);
		});
});

module.exports = router;
