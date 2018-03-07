const fs = require('fs');
const models = require("../app/models");

let normalize = function(r) {
  r = r.replace(new RegExp(/[àáâãäå]/g),"a");
  r = r.replace(new RegExp(/[èéêë]/g),"e");
  r = r.replace(new RegExp(/[ìíîï]/g),"i");
  r = r.replace(new RegExp(/[òóôõö]/g),"o");
  r = r.replace(new RegExp(/[ùúûü]/g),"u");
  r = r.replace(new RegExp(/[ñ]/g),"n");
  return r;
}

let slugify = function(term) {
  return normalize(term.toLowerCase()).replace(/ /g,"-");
}

// NODE_ENV=production node bin/sitemap.js
models.sequelize.sync().then(function () {

  let queryString = // 'select * from attendance_list';

  `select s.id, s.type, s.state, s.area as district, d.displayName, d.party, count(1) as entries,  max(latestAttendance) latestAttendance
    from Seats s join Deputies d on d.SeatId = s.id join Attendances a on a.DeputyId = d.id
    and (a.attendance in ('A' , 'AO', 'PM', 'IV'))
    group by s.id, s.type, s.state, s.area, d.id, d.displayName, d.party
    order by s.id, max(latestAttendance) asc`;

  models.sequelize
    .query(queryString, {
      type: models.sequelize.QueryTypes.SELECT
    })
    .then(function(deputies) {
      let buffer = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      buffer += `\t<url>\n\t\t<loc>https://contactolegislativo.com</loc>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>1</priority>\n\t</url> \n`;
      buffer += `\t<url>\n\t\t<loc>https://contactolegislativo.com/legislatura/LXIII/asistencias</loc>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.95</priority>\n\t</url> \n`;
      buffer += `\t<url>\n\t\t<loc>https://contactolegislativo.com/nosotros</loc>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.9</priority>\n\t</url> \n`;
      buffer += `\t<url>\n\t\t<loc>https://contactolegislativo.com/privacidad</loc>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.9</priority>\n\t</url> \n`;

      console.log(`${deputies.length} generated`)
      deputies.forEach(deputy => {
        let id = deputy.id;
        let district = deputy.district;
        let state = slugify(deputy.state);
        let displayName = slugify(deputy.displayName);
        let url = `https://contactolegislativo.com/camara-de-diputados/LXIII/${displayName}`;

        buffer += `\t<url>\n\t\t<loc>${url}</loc>\n\t\t<lastmod>2018-03-01</lastmod>\n\t\t<changefreq>weekly</changefreq>\n\t\t<priority>0.9</priority>\n\t</url> \n`;

      });
      buffer += '</urlset>';

      fs.writeFile("sitemap.xml", buffer, function(err) {
        if(err) return console.log(err);
        console.log("The file was saved!");
      });
    }, function(err) {
      console.log(err);
      renderError(res, `No se pudo encontrar informacion`);
    });

});
