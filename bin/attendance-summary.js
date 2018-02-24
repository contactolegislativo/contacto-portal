const fs = require('fs');
const models = require("../app/models");

function normalize(r) {
  r = r.replace(new RegExp(/[àáâãäå]/g),"a");
  r = r.replace(new RegExp(/[èéêë]/g),"e");
  r = r.replace(new RegExp(/[ìíîï]/g),"i");
  r = r.replace(new RegExp(/[òóôõö]/g),"o");
  r = r.replace(new RegExp(/[ùúûü]/g),"u");
  r = r.replace(new RegExp(/[ñ]/g),"n");
  return r;
}

function convertDate(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd  = date.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}


// NODE_ENV=production node bin/attendance-summary.js
// sudo docker exec -i contactodocker_mysql_1 mysql -u contacto -pcontacto -D contacto_db < attendance-summary.sql
models.sequelize.sync().then(function () {
  let queryString = 'select d.id, d.displayName, d.SeatId, count(1) as attendances, max(attendanceDate) as latestAttendance from Deputies d join Attendances a on a.DeputyId = d.id group by d.id, d.displayName, d.SeatId';
  let queryUpdate = '';

  queryUpdate += '# alter table Deputies add column slug varchar(100);\n';
  queryUpdate += '# alter table Deputies add column attendances int;\n';
  queryUpdate += '# alter table Deputies add column latestAttendance datetime;\n';

  models.sequelize
    .query(queryString, {
      type: models.sequelize.QueryTypes.SELECT
    })
    .then(function(deputies) {
      deputies.forEach(deputy => {
        let slug = normalize(deputy.displayName.toLowerCase()).replace(/ /g, '-');
        let attendances = deputy.attendances;
        let latestAttendance = deputy.latestAttendance;

        queryUpdate += `update Deputies set slug='${slug}', attendances=${attendances}, latestAttendance='${convertDate(latestAttendance)}' where id = ${deputy.id}; \n`;

      });

      fs.writeFile("attendance-summary.sql", queryUpdate, function(err) {
        if(err) return console.log(err);
        console.log("The file was saved!");
      });

      console.log(queryUpdate);
    }, function(err) {
      console.log(err);
    });

});
