const fs = require('fs');
const models = require("../app/models");

// NODE_ENV=production node bin/sitemap.js
models.sequelize.sync().then(function () {

  let queryString =
    `select id, slug from ProfileDetails where latestAttendance is not null`;

  models.sequelize
    .query(queryString, {
      type: models.sequelize.QueryTypes.SELECT
    })
    .then(function(deputies) {
      let buffer = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

      buffer += `\t<url>\n\t\t<loc>https://contactolegislativo.com</loc>\n\t\t<xhtml:link rel="alternate" hreflang="es-mx" href="https://contactolegislativo.com"/>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>1</priority>\n\t</url> \n`;
      buffer += `\t<url>\n\t\t<loc>https://contactolegislativo.com/camara-de-diputados/LXIII</loc>\n\t\t<xhtml:link rel="alternate" hreflang="es-mx" href="https://contactolegislativo.com/legislatura/LXIII/asistencias"/>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.95</priority>\n\t</url> \n`;
      buffer += `\t<url>\n\t\t<loc>https://contactolegislativo.com/camara-de-diputados/LXIII/asistencias</loc>\n\t\t<xhtml:link rel="alternate" hreflang="es-mx" href="https://contactolegislativo.com/legislatura/LXIII/asistencias"/>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.95</priority>\n\t</url> \n`;
      buffer += `\t<url>\n\t\t<loc>https://contactolegislativo.com/nosotros</loc>\n\t\t<xhtml:link rel="alternate" hreflang="es-mx" href="https://contactolegislativo.com/nosotros"/>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.9</priority>\n\t</url> \n`;
      buffer += `\t<url>\n\t\t<loc>https://contactolegislativo.com/privacidad</loc>\n\t\t<xhtml:link rel="alternate" hreflang="es-mx" href="https://contactolegislativo.com/privacidad"/>\n\t\t<lastmod>2018-02-01</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.9</priority>\n\t</url> \n`;

      console.log(`${deputies.length} generated`)
      deputies.forEach(deputy => {
        let url = `https://contactolegislativo.com/camara-de-diputados/LXIII/${deputy.slug}`;

        buffer += `\t<url>\n\t\t<loc>${url}</loc>\n\t\t<xhtml:link rel="alternate" hreflang="es-mx" href="${url}"/>\n\t\t<lastmod>2018-03-01</lastmod>\n\t\t<changefreq>weekly</changefreq>\n\t\t<priority>0.9</priority>\n\t</url> \n`;

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
