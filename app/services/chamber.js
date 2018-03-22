const models  = require('../models');
const CacheManager = require('./cache-manager');

const chamber_by_party = 'select * from chamber_by_party';
const chamber_by_studies = 'select * from chamber_by_studies';
const chamber_studies_by_party = 'select * from chamber_studies_by_party';
const chamber_by_academics = 'select * from chamber_by_academics';
const chamber_by_age = 'select * from attendance_by_state';
const chamber_party_avg_age = 'select * from chamber_party_avg_age';
const chamber_party_age_distribution = 'select * from chamber_party_age_distribution';
const chamber_sessions = 'select * from chamber_sessions';
const chamber_deputies = 'select * from ActiveDeputies order by id';
const chamber_studies_by_party_percentange = 'select * from chamber_studies_by_party_percentange';

const cacheManager = new CacheManager();

class AttendanceService {
  resolveQuery(query, replacements) {
    return models.sequelize
      .query(query, {
        replacements: replacements,
        type: models.sequelize.QueryTypes.SELECT
      });
  }

  resolve(query) {
    const _self = this;
    return new Promise(function(resolve, reject) {
      cacheManager.find(query)
        .then(response => {
          if(response.found) {
            resolve(response.data);
          } else {
            _self.resolveQuery(query)
              .then(result => {
                cacheManager.store(query, result);
                resolve(result);
              })
              .catch(err => {
                reject(err);
              });
          }
        });
    });

  }

  getChamberByParty() {
    return this.resolve(chamber_by_party);
  }

  getChamberByStudies() {
    return this.resolve(chamber_by_studies);
  }

  getChamberStudiesByParty() {
    return this.resolve(chamber_studies_by_party);
  }

  getChamberByAcademics() {
    return this.resolve(chamber_by_academics);
  }

  getChamberByAge() {
    return this.resolve(chamber_by_age);
  }

  getChamberPartyAvgAge() {
    return this.resolve(chamber_party_avg_age);
  }

  getChamberAgeDistribution() {
    return this.resolve(chamber_party_age_distribution);
  }

  getChamberSessions() {
    return this.resolve(chamber_sessions);
  }

  getChamberDeputies() {
    return this.resolve(chamber_deputies);
  }

  getChamberStudiesByPartyPercentage() {
    return this.resolve(chamber_studies_by_party_percentange);
  }
}

module.exports = AttendanceService;
