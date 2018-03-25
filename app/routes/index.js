var express = require('express');
var router = express.Router();
var models  = require('../models');
var AttendanceService = require('../services/chamber');

const chamberService = new AttendanceService();

var renderTitle = function(deputy) {
  return `${deputy.displayName}`;
}

const chamberGender = [
  { party: 'pri', male: 115, female: 89 },
  { party: 'pan', male: 62, female: 46 },
  { party: 'prd', male: 34, female: 18 },
  { party: 'morena', male: 26, female: 24 },
  { party: 'pve', male: 21, female: 18 },
  { party: 'mc', male: 11, female: 9 },
  { party: 'panal', male: 6, female: 6 },
  { party: 'encuentro', male: 6, female: 4 },
  { party: 'ind', male: 0, female: 1 },
  { party: 'sp', male: 4, female: 0 }
];

router.get('/LXIII', (req, res, next) => {

  Promise.all([
    chamberService.getChamberByParty(),
    chamberService.getChamberStudiesByParty(),
    chamberService.getChamberAgeDistribution(),
    chamberService.getChamberStudiesByPartyPercentage()
  ]).then((result) => {
    res.render('index', {
        title: 'Camara de diputados',
        legislatura: 'LXIII',
        data: {
          chamberGender: chamberGender,
          chamberByParty: result[0],
          chamberStudiesByParty: result[1],
          chamberAgeDistribution: result[2],
          chamberStudiesByPartyOnPercentage: result[3]
        }
      });
  });
});

/* /asistencias */
router.get('/LXIII/asistencias',(req, res, next) => {

  Promise.all([
    chamberService.getChamberSessions(),
    chamberService.getChamberDeputies()
  ]).then(result => {
    res.render('attendance', {
        title: 'Asistencias LXIII',
        legislature: 'LXIII',
        sessions: result[0],
        deputies: result[1]
      });
  });
});

router.get('/LXIII/:slug', (req, res, next) => {
	let queryString =
    'select * from ProfileDetails where id in (select id from ProfileDetails where slug = :slug)';

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
