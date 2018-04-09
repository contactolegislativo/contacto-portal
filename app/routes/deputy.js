var express = require('express');
var router = express.Router();
var models  = require('../models');
var states = require('../config/states-cache.json');

/*
*
*  DEPRECATED: These routes have been deprecated in the sprit of better SEO practices
*             however remain active because Google crawler takes long to remove them
*/

function normalize(r) {
  return r.replace(new RegExp(/[àáâãäå]/g),"a")
          .replace(new RegExp(/[èéêë]/g),"e")
          .replace(new RegExp(/[ìíîï]/g),"i")
          .replace(new RegExp(/[òóôõö]/g),"o")
          .replace(new RegExp(/[ùúûü]/g),"u")
          .replace(new RegExp(/[ñ]/g),"n")
          /*Bad encoding remain in google */
          .replace('Ã±','n')
          .replace('Ã¡','a')
          .replace('Ã©','e')
          .replace('Ã­','i')
          .replace('Ã³','o')
          .replace('Ãº','u');
}

var cache = {};
states.forEach(state => {
	cache[state.snake] = state;
});

var renderTitle = function(deputy) {
  return `${deputy.displayName} |  ${deputy.state}, Distrito ${deputy.area}`;
}

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
	} else if(isNaN(id)) { // id is not a number
		renderError(res, `El contenido no esta disponible`);
	} else if(id > cache[stateName].districts) {
		renderError(res, `El estado ${cache[stateName].name} no tiene distrito ${id}.`);
	} else {
		next();
	}
}

var urlParamsValidatorCirc = function(req, res, next) {
	let stateName = req.params.state;
	let id = req.params.id;

	// If state name does not exist
	if(!cache.hasOwnProperty(stateName)) {
		renderError(res, `No tenemos informacion para ${stateName}.`);
	} else if(isNaN(id)) { // id is not a number
		renderError(res, `El contenido no esta disponible`);
	} if(isNaN(req.params.districtId)) { // id is not a number
		renderError(res, `El contenido no esta disponible`);
	} else {
		next();
	}
}

/* /diputado/<estado>/distrito/<no> */
router.get('/:state/distrito/:id', urlParamsValidator, (req, res, next) => {
	let queryString =
  	'select * from Seats s join Deputies d on s.id = d.SeatId where s.state = :stateName and s.area = :district and s.curul is null order by d.latestAttendance desc';

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
		  		title: renderTitle(deputies[0]),
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
router.get('/:state/circunscripcion/:districtId/:id', urlParamsValidatorCirc, (req, res, next) => {
	let queryString =
  	'select * from Seats s join Deputies d on s.id = d.SeatId where s.state = :stateName and s.area = :district and s.id = :id order by d.latestAttendance desc';

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
			if(deputies.length === 0) {
				renderError(res, `El contenido no esta disponible`);
			} else {
				res.render('index', {
			  		title: renderTitle(deputies[0]),
						deputy: deputies[0],
						alternate: deputies[1],
						host: req.headers.host
					});

			}
	  }, function(err) {
			console.log(err);
			renderError(res, `No se pudo encontrar informacion para el distrito  ${req.params.id} de ${cache[req.params.state].name}.`);
		});
});

/* /diputado/<slug> */
router.get('/:slug', (req, res, next) => {
	let queryString =
  	'select * from Seats s join Deputies d on s.id = d.SeatId where s.id in ( select SeatId from Deputies d where d.slug = :slug ) order by d.latestAttendance desc';

	let slug = normalize(decodeURIComponent(req.params.slug));

  models.sequelize
	  .query(queryString, {
	    replacements: {
				slug: slug,
			},
	    type: models.sequelize.QueryTypes.SELECT
	  })
	  .then(function(deputies) {
			let titular = deputies.find(deputy => deputy.slug === slug);
			let alternates = deputies.filter(deputy => deputy.slug !== slug) || { displayName: 'Ninguno', attendances: 0 };
			res.render('deputy', {
		  		title: renderTitle(titular),
					deputy: titular,
					alternates: alternates
				});
	  }, function(err) {
			console.log(err);
			renderError(res, `No se pudo encontrar informacion para ${ slug.replace('-',' ') }.`);
		});
});

module.exports = router;
