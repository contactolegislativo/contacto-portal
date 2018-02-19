const fs = require('fs');
const models = require("../app/models");


let normalize = function(r) {
  r = r.replace(new RegExp(/[àáâãäå]/g),"a");
  r = r.replace(new RegExp(/[èéêë]/g),"e");
  r = r.replace(new RegExp(/[ìíîï]/g),"i");
  r = r.replace(new RegExp(/[òóôõö]/g),"o");
  r = r.replace(new RegExp(/[ùúûü]/g),"u");
  return r;
}

// NODE_ENV=production node bin/sitemap.js
models.sequelize.sync().then(function () {

  let queryString = 'select * from attendance_list';

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

      deputies.forEach(deputy => {
        let id = deputy.id;
        let district = deputy.district;
        let state = normalize(deputy.state).toLowerCase().replace(/ /g,'-');
        let displayName = normalize(deputy.displayName).toLowerCase().replace(/ /g,'-');
        let url, priority;
        let alternateUrl = `https://contactolegislativo.com/legislatura/LXIII/diputado/${displayName}`;
        if(deputy.type === 'Representación proporcional') {
          priority = '0.7';
          url = `https://contactolegislativo.com/legislatura/LXIII/diputado/${state}/circunscripcion/${district}/${id}`;
        } else {
          priority = '0.8';
          url = `https://contactolegislativo.com/legislatura/LXIII/diputado/${state}/distrito/${district}`;
        }

        buffer += `\t<url>\n\t\t<loc>${url}</loc>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>${priority}</priority>\n\t</url> \n`;
        buffer += `\t<url>\n\t\t<loc>${alternateUrl}</loc>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.6</priority>\n\t</url> \n`;

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
