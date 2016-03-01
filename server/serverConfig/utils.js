var fs = require('fs');
var _ = require('lodash');
var request = require('request');
var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var creds = {
  appId: "19dc5ef3",
  appKey: "1caac1145c265164258e31800a83e01c",
}
var Users = require('../models/users');
var Meals = require('../models/meals');
var Foods = require('../models/foods');
var _ = require('lodash');

Promise.promisifyAll(fs);
Promise.promisifyAll(Users);
Promise.promisifyAll(Meals);

// takes a query and makes a get req to the nutritionix api
module.exports.getSearchResponse = function(query, callback) {
  var nutritionUrl = 'http://api.nutritionix.com/v1_1/search/' + query;
  request({
    url: nutritionUrl,
    qs: Object.assign({}, creds, {results:"0:8"}),
  },
  function (error, response, body) {
    if(error) {
      callback(error, null);
    } else {
      callback(null, body);
    }
  });
};

/*  takes in a food id and finds the food object
 *  first checks to see if the food is found in the database
 *  if not in the database, makes a get req to the nutritionix API
 *  and stores the result from the nutrionix req in the db
 */
module.exports.getFoodItem = function(id, callback) {
  Foods.find({'item_id':id})
  .then(function(foundFood) {
    if(foundFood.length !== 0) {
      callback(null, foundFood[0]['JSON_result']);
    } else {
      var nutritionUrl = 'http://api.nutritionix.com/v1_1/item';
      request({
        url: nutritionUrl,
        qs: Object.assign({}, creds, {id:id}),
      }, function(error, response, body) {
        if(error) {
          callback(error, null);
        } else {
          Foods.create({'item_id': id, 'JSON_result': body}, function(err, newFood) { //create new user if not found.
            if (newFood) {
              callback( null, newFood['JSON_result']);
            } else {
              callback( err, null );
            }
          });
        }
      })
    }
  })
  .catch(function(err) {
    callback(err, null);
  });
};

module.exports.getFoodItemAsync = Promise.promisify(module.exports.getFoodItem);


// checks if the password matches a pre-existing user
module.exports.checkUser = function(username, password, callback) {
	Users.find({username:username}, function(err, foundUser){
		if(Array.isArray(foundUser) && foundUser.length !== 0){
      for(var i = 0; i < foundUser.length; i++){
        if (bcrypt.compareSync(password, foundUser[i].password)){
			     callback(null,foundUser);
           return;
        }
      }
      callback({message: 'password invalid'}, null);
		} else {
			callback(err, null);
		}
	});
};

// takes a username and password and enters a new user into the db
module.exports.makeNewUser = function(username, password, callback) {
    Users.find({username:username}, function(err, foundUser){
        if(Array.isArray(foundUser) && foundUser.length !== 0){ //mongodb sends back an empty array if nothing is found.
            callback(null, foundUser);
        } else {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            Users.create({username:username, password:hash, salt:salt}, function(err, newUser){ //create new user if not found.
                if (newUser) {
                    callback( null, newUser );
                } else {
                    callback( err, null );
                }
            });
        }
    });
};

// inputs new meal into the database
module.exports.makeNewMeal = function(meal, callback) {
    Meals.create(meal, function(err, newMeal){
        if (newMeal) {
            callback( null, newMeal );
        } else {
            callback( err, null );
        }
    });
};

// takes the passed in username and returns all the meals that user has eaten
module.exports.checkMealsByUser = function(username, callback) {
    Meals.find({eatenBy:username}, function(err, foundMeals){
        if (Array.isArray(foundMeals) && foundMeals.length !== 0) {
            callback( null, foundMeals );
        } else {
            callback( err, null );
        }
    });
};

//Creates the user object corresponding to the username and sends it in a callback
module.exports.sendUserStateInfo = function(username, callback) {
    //First the user entry is found and all meals matching the usernames are found
    //in the Promise.all method below. Result[0] -> user entry, Result[1] -> all meals by user
    Promise.all([Users.findAsync({username:username}), Meals.findAsync({eatenBy:username})])
        .then(function(results){
            //We need to attach to the userObj a foods property, with all the nutr info for
            //each food item. Thus, for each food entry within meals.foodsEaten, we store the
            //id as a key and a promise to grab the nutr info as the value.
            var mapIdsToFoods = {};
            results[1].forEach( function(meal) {
              _.keys(meal.foodsEaten).forEach( function(foodId, index) {
                mapIdsToFoods[foodId] = module.exports.getFoodItemAsync(foodId);
              });
            });
            //We then execute all the promises in the mapping object with Promise.props
            //Essentially, the functoin performs this operation
            // {food_id: PromiseToGrabFoods} -> {food_id: grabbedFoodProfileString}
            Promise.props(mapIdsToFoods)
            .then(function(foodStrings) {
              //the results are jsonStrings which need to be parsed
              var foods = _.mapValues(foodStrings, JSON.parse);
              //info object is finally constructed and returned
              var infoObj = {
                  userInfo: _.omit(results[0][0], ['password','salt']),
                  meals: results[1],
                  foods: foods
              };
              callback(null, infoObj);
            })
            .catch(function(err) {
              callback(err, null);
            });
        })
        .catch(function(err){
            callback(err, null);
        });
};



