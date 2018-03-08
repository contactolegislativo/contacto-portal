var express = require('express');
var router = express.Router();
var models  = require('../models');

var renderTitle = function(deputy) {
  return `${deputy.displayName}`;
}

/* /asistencias */
router.get('/asistencias',(req, res, next) => {
	res.render('attendance', {
			title: 'Asistencia'
		});
});

router.get('/:slug', (req, res, next) => {
	let queryString =
  	'select * from Seats s join Deputies d on s.id = d.SeatId where s.id in ( select SeatId from Deputies d where d.slug = :slug ) order by d.latestAttendance desc';

	let slug = req.params.slug;

  models.sequelize
	  .query(queryString, {
	    replacements: {
				slug: slug,
			},
	    type: models.sequelize.QueryTypes.SELECT
	  })
	  .then(function(deputies) {
			let titular = deputies.find(deputy => deputy.slug === slug);
			let alternate = deputies.find(deputy => deputy.hash === titular.altHash) || deputies.find(deputy => deputy.slug !== slug);
			res.render('index', {
		  		title: renderTitle(titular),
					deputy: titular,
					alternate: alternate,
					host: req.headers.host
				});
	  }, function(err) {
			console.log(err);
			renderError(res, `No se pudo encontrar informacion para ${ slug.replace('-',' ') }.`);
		});
});


module.exports = router;
