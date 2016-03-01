var Promise = require('bluebird');
var utils = require('./utils.js');
Promise.promisifyAll(utils);


module.exports = function(app, express) {

	app.get('/', function(req, res) {
		res.redirect('/index.html');
	});

	//POST to loggin should check user's credentials and, if validated,
	//create aa session on the reqest and send the user's stored Object
	//from the database back to the client
	app.post('/login', function(req, res) {
		utils.checkUserAsync(req.body.username, req.body.password)
		.then(function(result) {
			req.session.regenerate(function() {
				req.session.user = req.body.username;
				utils.sendUserStateInfoAsync(req.body.username)
				.then(function(userObj) {
					res.send(userObj);
				});
			})
		})
		.catch(function(err) {
			res.send('error ' + err);
		})
	});

	//GET to login should send the UserObj again if the session is validated
	//or return invalid message if no session exists
	app.get('/login', function(req, res) {
		if(req.session.user) {
			utils.sendUserStateInfoAsync(req.session.user)
			.then(function(infoObj) {
				res.send(infoObj);
			});
		} else {
			res.send('Invalid User');
		}
	});

	//POST to signup should make a new userObject in the db with the sent
	//credentials, create a session on the reqest, and then send the new
	//user's object that was created in the db back to the client
	app.post('/signup', function(req, res) {
	    utils.makeNewUserAsync(req.body.username, req.body.password)
	    .then(function(result) {
	        req.session.regenerate(function() {
	            req.session.user = req.body.username;
	            utils.sendUserStateInfoAsync(req.body.username)
	            .then(function(infoObj) {
	            	res.send(infoObj);
	            });
	        })
	    })
	    .catch(function(err) {
	        res.send('error ' + err);
	    })
	});

	app.get('/logout', function(req, res) {
		if(req.session.user) {
			req.session.destroy( function(err){
				res.send('You have been logged out. See you next time!');
			});
		} else {
			res.send('You are already logged out.');
		}
	});

	//Post to meals should contain a string which is parsed into a meals Object,
	//containg timestamp, user data, and the foods consumed. This is then stored
	//in the db and the new meal is sent back to the client (client currently does nothing
	//with this response)
	app.post('/meals', function(req, res) {
	    var newMeal = req.body.meal;
	    if (typeof req.body.meal === 'string') {
	    	newMeal = JSON.parse(req.body.meal)
	    }
	    utils.makeNewMealAsync(newMeal)
	    .then(function(newMeal) {
				res.send(newMeal);
	    })
	    .catch(function(err) {
	        res.send('error ' + err);
	    })
	});

	//POST to search should trigger a search on the server in the Nutrionix API for
	//possible matches. These matches are sent back to the client as a result
	app.post('/search', function(req, res) {
		if (!req.body.query) return res.send('Invalid query');
		var query = req.body.query.trim();
		utils.getSearchResponseAsync(query)
		.then(function(result) {
			res.send(result);
		})
		.catch(function(err) {
			res.send('error ' + err);
		});
	});

	//A post to food id should contain a food_id value in the request body.
	//This food id is used to query the Nutrionix API for a complete nutr profile
	//of the food and this profile is stored in the db and sent back to the client
  app.post('/food_id', function(req, res) {
    if (!req.body['food_id']) return res.send('Invalid id');
    var id = req.body['food_id'].trim();
    utils.getFoodItemAsync(id)
    .then(function(foodItem) {
      res.send(foodItem)
    })
    .catch(function(err) {
      res.send('error ' + err);
    });
  });
}
