var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
const curl = new (require( 'curl-request' ))();
var GEOCODER_APP_CODE = 'jmToFBs2v_k8fQfzV-vpxw';
var GEOCODER_APP_ID = '4Gorvw0VLAvnEymZqkTk';
var APPFIGURES_CLIENT_KEY = '';
var APPFIGURES_SECRET_KEY = '';

router.get('/funnel', function(req, res, next) {
  
  var downloads = 0;
  var registrations = 0;
  var subscriptions = 0;
  var firstInventories = 0;
  var moreThanFirstInventory = 0;
  var firstProduct = 0;

  var startDate = moment(req.query.start_date).format('YYYY-MM-DD');
  var endDate = moment(req.query.end_date).format('YYYY-MM-DD');

  curl.setHeaders([
    'X-Client-Key: ' + APPFIGURES_CLIENT_KEY,
    'Authorization: Basic ' + Buffer.from('some@email.com:password').toString('base64')
  ])
  .get('https://api.appfigures.com/v2/reports/sales?granularity=daily&start_date='+startDate+'&end_date='+endDate)
  .then(({statusCode, body, headers}) => {
    downloads = JSON.parse(body).downloads;

    res.locals.connection.query('SELECT * from actions where ( actions.action = "LOGIN SUCCEEDED" AND actions.date < "2018-09-28 13:31:53" AND actions.entity_id NOT IN ( SELECT distinct(u_log.entity_id) FROM actions AS u_log WHERE u_log.user_log_id < actions.user_log_id AND u_log.action = "LOGIN SUCCEEDED" AND u_log.date < "2018-09-28 13:31:53" AND u_log.entity_id = actions.entity_id ) ) OR ( actions.action = "ACTIVATED" AND actions.date >= "2018-09-28 13:31:53" ) and (date BETWEEN CAST(? AS DATE) AND CAST(? AS DATE))', [startDate, endDate], function (error, results, fields) {
      if (error) throw error;
      registrations = results.length;
  
      res.locals.connection.query('SELECT * from actions where action="SUBSCRIBED" and (date BETWEEN CAST(? AS DATE) AND CAST(? AS DATE))', [startDate, endDate], function (error, results, fields) {
        if (error) throw error;
        subscriptions = results.length;
  
        res.locals.connection.query('SELECT * from actions where action="CREATED INVENTORY" and (date BETWEEN CAST(? AS DATE) AND CAST(? AS DATE))', [startDate, endDate], function (error, results, fields) {
          if (error) throw error;
          var processedUserIds = [];
          var processedUserIdsForMore = [];
      
          results.forEach(result => {
            if (processedUserIds.indexOf(result.entity_id) === -1) {
              processedUserIds.push(result.entity_id);
              firstInventories++;
            } else {
              if (processedUserIdsForMore.indexOf(result.entity_id) === -1) {
                processedUserIdsForMore.push(result.entity_id);
                moreThanFirstInventory++;
              }
            }
          });
  
          res.locals.connection.query('SELECT * from actions where action="ADDED CATALOG ITEM" and (date BETWEEN CAST(? AS DATE) AND CAST(? AS DATE))', [startDate, endDate], function (error, results, fields) {
            if (error) throw error;
            var processedUserIds = [];
        
            results.forEach(result => {
              if (processedUserIds.indexOf(result.entity_id) === -1) {
                processedUserIds.push(result.entity_id);
                firstProduct++;
              } 
            });
  
            res.send(JSON.stringify({
              "conversion": {
                "downloads": downloads,
                "registrations": registrations,
                "subscriptions": subscriptions
              },
              "user_experience": {
                "registrations": registrations,
                "first_inventory": firstInventories,
                "first_product": firstProduct,
                "first_closed_inventory": 0,
                "first_closed_inventory_with_pourcost": 0,
                "more_than_first_inventory": moreThanFirstInventory
              }
            }));
          });
        });
      });
    });
  })
  .catch((e) => {
      console.log(e);
  });
});

router.get('/registrations', function(req, res, next) {
  var withRange = req.query.start_date && req.query.end_date;
  var startDate = moment(req.query.start_date).format('YYYY-MM-DD');
  var endDate = moment(req.query.end_date).format('YYYY-MM-DD');

  res.locals.connection.query('SELECT count(*) as qty, country, state, city from actions where ( actions.action = "LOGIN SUCCEEDED" AND actions.date < "2018-09-28 13:31:53" AND actions.entity_id NOT IN ( SELECT distinct(u_log.entity_id) FROM actions AS u_log WHERE u_log.user_log_id < actions.user_log_id AND u_log.action = "LOGIN SUCCEEDED" AND u_log.date < "2018-09-28 13:31:53" AND u_log.entity_id = actions.entity_id ) ) OR ( actions.action = "ACTIVATED" AND actions.date >= "2018-09-28 13:31:53" ) ' + (withRange ? 'and (date BETWEEN CAST(? AS DATE) AND CAST(? AS DATE))' : '') + ' group by city ,state, country', [startDate, endDate], function (error, results, fields) {
    if (error) throw error;
    var processedResults = 0;

    if (results.length)
      results.forEach(result => {
        var address = (result.city + ', ' + result.state + ', ' + result.country).split(' ').join('+');
        var url = 'https://geocoder.api.here.com/6.2/geocode.json?app_id='+GEOCODER_APP_ID+'&app_code='+GEOCODER_APP_CODE+'&searchtext='+address;
        
        request.get(url, (error, response, body) => {
          if (error) throw error;
          
          try {
            var address = JSON.parse(body).Response.View[0].Result[0];
            
            if (address) {
              result.coords = {
                lat: address.Location.DisplayPosition.Latitude,
                lng: address.Location.DisplayPosition.Longitude
              }
            }
          } catch (e) {
            //do nothing
          }

          processedResults++;

          if (processedResults === results.length) {
            res.send(JSON.stringify(results));
          }
        });
      });
    else
      res.send(JSON.stringify([]));
  });
});

router.get('/user-stories', function(req, res, next) {
  var startDate = parseInt(moment(req.query.start_date).format('X'));
  var endDate = parseInt(moment(req.query.end_date).format('X'));
  console.log('startDate', startDate);
  console.log('endDate', endDate);
  res.locals.connection.query('SELECT message from commits where date < ? order by date desc limit 40', [startDate], function (error, results, fields) {
    if (error) throw error;
    results.forEach(function (result) {
      var messageParts = result.message.split('[').join('').split(']');
      var id = messageParts[0];

      delete result.message;
      result.id = id;
      result.title = messageParts[1];
      result.url = 'https://bardog.atlassian.net/browse/' + id;
    });
    res.send(JSON.stringify(results));
  });
});

module.exports = router;
