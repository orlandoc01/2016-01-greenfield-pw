import React from 'react';
import { connect } from 'react-redux';
import TableRow from 'material-ui/lib/table/table-row';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';

//File exports a stateless functoinal component and a useful function for
//extracting nutrional info


//Function
export const getNutritionInfo = (meals, foods, additionals) => {
	let start = {
		nf_calories: 0,
		nf_protein: 0,
		nf_total_carbohydrate: 0,
		nf_total_fat: 0
	}

	//optional additional nutritional info is added to the start obj if passed in, must be array
	if(additionals && Array.isArray(additionals)) {
		additionals.forEach(val => start[val] = 0);
	}

	//Function below merges all meal objects in the meals array using a merge function
	//which sums everything. Order of logic is as follows (start by looking at currMeal construction):
	//Start with copied start object (passed as initial param) and transform it by adding the nutritional 
	//info for each entry in meals.foodsEaten using the 'foods' dictionary to actually grab nutr info
	//this results in a currMeal object for each meal. Then merge each currMeal object for each
	//meal in the meals array which results in one single nutr info object for all the meals in meals array
	//return this object
	const mergeFunc = (objVal, srcVal) => (objVal || 0) + (srcVal || 0);
	return meals.reduce((mealSum, meal) => {
		let currMeal = _.transform(meal.foodsEaten, (foodSum, timesEaten, foodId) => {
			let foodNFstats = _.pick(foods[foodId], Object.keys(foodSum));
			let foodNFtotals = _.mapValues(foodNFstats, val => timesEaten * val || 0);
			 _.mergeWith(foodSum, foodNFtotals, mergeFunc);
		}, Object.assign({}, start));
		return _.mapValues(currMeal, (sum, key) => currMeal[key] + mealSum[key]);
	}, Object.assign({}, start));
}

//React Component
export const NutritionCounter = ({meals,foods}) => {
	let NF = getNutritionInfo(meals, foods);
	NF = _.mapValues(NF, (num) => num.toFixed(2));
	return (
		<TableRow>
	    <TableHeaderColumn><h5>Items</h5></TableHeaderColumn>
	    <TableHeaderColumn></TableHeaderColumn>
	    <TableHeaderColumn><h5>Calories: {NF['nf_calories']} cal</h5></TableHeaderColumn>
	    <TableHeaderColumn><h5>Protein: {NF['nf_protein']}g</h5></TableHeaderColumn>
	    <TableHeaderColumn><h5>Carbs: {NF['nf_total_carbohydrate']}g</h5></TableHeaderColumn>
	    <TableHeaderColumn><h5>Fat: {NF['nf_total_fat']}g</h5></TableHeaderColumn>
		</TableRow>
		);
}

