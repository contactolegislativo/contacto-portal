var redis = require('redis');

// create a new redis client and connect to our local redis instance
var client = redis.createClient({
  host: 'redis'
});

// if an error occurs, print it to the console
client.on('error', function (err) {
  console.log("Error " + err);
});

client.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
});

class CacheManager {
  find(key) {
    return new Promise(function(resolve) {
      client.get(key, function(error, result) {
          if (result) {
            resolve({ found: true, data: JSON.parse(result)});
          } else {
            resolve({ found: false});
          }
        });
    });
  }

  store(key, data) {
    client.set(key, JSON.stringify(data), 'EX', 604800); // 7days
  }
}


module.exports = CacheManager;
