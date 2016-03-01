var mongoose = require('mongoose');

//Food schema stores JSON string of nutr info recieved
//From Nutrionix API
var foodSchema = mongoose.Schema({
 item_id: {type:'String'},
 JSON_result: {type: 'String'}
}); 

var Food = mongoose.model('Food',foodSchema);

module.exports = Food;