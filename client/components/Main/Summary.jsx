import React from 'react';
import {getNutritionInfo} from './NutritionCounter.jsx';
import MacroPieChart from './MacroPieChart.jsx';
import ProgressBarContainer from '../../containers/ProgressBarContainer.jsx';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Divider from 'material-ui/lib/divider';

//Used to render the summary page
const Summary = ({user}) => {

	//If there are meals logged in the user objects and it's not zero length, then we calculate
	//the relevant data, else we return a p element that says no meals have been logged
	if(Array.isArray(user.meals) && user.meals.length !== 0) {

		//Additional fields of information that I want the getNutrition info to extract
		let additionalFields = ['nf_calcium_dv', 'nf_calories_from_fat', 'nf_cholesterol',
														'nf_dietary_fiber','nf_iron','nf_monounsaturated_fat', 
														'nf_polyunsaturated_fat', 'nf_saturated_fat', 'nf_sodium',
														'nf_sugars', 'nf_trans_fatty_acid', 'nf_vitamain_a_dv',
														'nf_vitamin_c_dv'];

		//Collect all the meals in the userObject into a simple lookup Object called mealsByDate
		//whose key is the date of consumption and whose values are an array of meals objects, (which log food eaten)
		let dateFunctions = ['getDate', 'getMonth', 'getFullYear'];
		let mealsByDate = _.transform(user.meals,(result, meal) => {
			let mealDate = new Date(meal.eatenAt);
			let dateString = dateFunctions.map(func => mealDate[func]()).join('-');
			result[dateString] = result[dateString] || [];
			result[dateString].push(meal);
		}, {});

		//Use the getNutritionInfo function to map the array of meals at each date in mealsByDate to a single object
		//with all the aggregate nutritional info for that day. That object is referred to as nutrByDate
		let nutrByDate = _.mapValues(mealsByDate, mealsArr => getNutritionInfo(mealsArr, user.foods, additionalFields));

		//Reduce the nutrional values in nutrByDate to one single object that has the key be a specific nutritional field
		//and its value be the average for that field across all the dates in nutrByDate
		let NFdailyAvg = _.values(nutrByDate).reduce( (prev, nutrObj, index) => {
			return _.mergeWith({}, prev, nutrObj, (prevV, nutrV) => ((prevV || 0)*(index) + (nutrV || 0))/(index + 1));
		});

		//Grab the currDay's nutritional info by parsing todays date into a string and passing that string as a key to
		//the nutr object. If it's undefined, then just return a blank nutr object
		let currDaySum = nutrByDate[dateFunctions.map(func => (new Date())[func]()).join('-')] || getNutritionInfo([]);

		//get the mass sum for the three main macro nutrients and get their percentage compositions of the total grams
		//eaten using _.mapValues (note: there will be extra values in currDayPerc that have no nutritional utility)
		let currDayGramSum = currDaySum['nf_protein'] + currDaySum['nf_total_carbohydrate'] + currDaySum['nf_total_fat'];
		let currDayPerc = _.mapValues(currDaySum, (gramAvg) => (gramAvg/currDayGramSum*100));

		//Round all numbers to a single decimal place
		currDaySum = _.mapValues(currDaySum, (num) => num.toFixed(1));
		NFdailyAvg = _.mapValues(NFdailyAvg, (num) => num.toFixed(1));

		//Display all informaiton in two large lists shown below with graph components added
		return (
				<div className = 'summary'>
					<div className = 'current-day-summary'>
					<List subheader="Today's Nutrition Info">
						<ListItem>
						<MacroPieChart macroPercents={currDayPerc} />	
						</ListItem>
						<Divider insert={true} />
						<ListItem primaryText= {"Calories Consumed Today: " + currDaySum['nf_calories']} />
						<Divider insert={true} />
						<ListItem primaryText={'Protein Consumed Today: ' + currDaySum['nf_protein'] + 'g'} />
						<Divider insert={true} />
						<ListItem>
								<div className='primaryText'>{'Carbohydrates Consumed Today: ' + currDaySum['nf_total_carbohydrate'] + 'g'}</div> 
											<div className='secondaryText'>{'Fiber consumed: ' + currDaySum['nf_dietary_fiber'] + 'g'}<br/>
																		 {'Sugars consumed: ' + currDaySum['nf_sugars'] + 'g'} </div>
						</ListItem>
						<Divider insert={true} />
						<ListItem>
							<div className='primaryText'>{'Fat Consumed Today: ' + currDaySum['nf_total_fat'] + 'g'}</div> 
							<div className='secondaryText'>{'Saturated Fat Consumed: ' + currDaySum['nf_saturated_fat'] + 'g'}<br/>  
																		 {'Polyunsaturated Fat Consumed: ' + currDaySum['nf_polyunsaturated_fat'] + 'g'}<br/>
																		 {'Monounsaturated Fat Consumed: ' + currDaySum['nf_monounsaturated_fat'] + 'g'}<br/>
																		 {'Trans Fat consumed: ' + currDaySum['nf_trans_fatty_acid'] + 'g'}</div>
						</ListItem>
						<Divider insert={true} />
						<ListItem primaryText={'Cholesterol Consumed Today: ' + currDaySum['nf_cholesterol'] + 'mg'} />
						<Divider insert={true} />
						<ListItem primaryText={'Sodium Consumed Today: ' + currDaySum['nf_sodium'] + 'mg'} />
						<Divider insert={true} />
						<ListItem primaryText={'Vitamin A Consumed Today: ' + currDaySum['nf_vitamain_a_dv'] + '% DV'} />
						<Divider insert={true} />
						<ListItem primaryText={'Vitamin C Consumed Today: ' + currDaySum['nf_vitamin_c_dv'] + '% DV'} />
						<Divider insert={true} />
						<ListItem primaryText={'Calcium Consumed Today: ' + currDaySum['nf_calcium_dv'] + '% DV'} />
						<Divider insert={true} />
						<ListItem primaryText={'Iron Consumed Today: ' + currDaySum['nf_iron'] + '% DV'} />
						<Divider insert={true} />
					</List>
					
					</div>
					<br></br>
					<div className = 'nutr-average-summary'>
					<List subheader="Daily Nutrition Averages">
						<Divider insert={true} />
						<ListItem> 
						<ProgressBarContainer datedNutr={nutrByDate} />
						</ListItem> 
						<Divider insert={true} />
						<ListItem primaryText= {"Daily Caloric Consumption: " + NFdailyAvg['nf_calories']} />
						<Divider insert={true} />
						<ListItem primaryText={'Daily Protein Consumption: ' + NFdailyAvg['nf_protein'] + 'g'} />
						<Divider insert={true} />
						<ListItem> 
							<div className='primaryText'>{'Daily Carb Consumption: ' + NFdailyAvg['nf_total_carbohydrate'] + 'g'}</div>
							<div className='secondaryText'>{'Daily Fiber Consumption: ' + NFdailyAvg['nf_dietary_fiber'] + 'g'}<br/>
														 {'Daily Sugar Consumption: ' + NFdailyAvg['nf_sugars']}</div>
					</ListItem>
					<Divider insert={true} />
						<ListItem> 
							<div className='primaryText'>{'Daily Fat Consumption ' + NFdailyAvg['nf_total_fat'] + 'g'}</div>
							<div className='secondaryText'>{'Daily Saturated Fat Consumption: ' + NFdailyAvg['nf_saturated_fat'] + 'g'}<br/> 
																		 {'Daily Polyunsaturated Fat Consumption: ' + NFdailyAvg['nf_polyunsaturated_fat'] + 'g'}<br/>
																		 {'Daily Monounsaturated Fat Consumption: ' + NFdailyAvg['nf_monounsaturated_fat'] + 'g'}<br/>
																		 {'Daily Trans Fat Consumption: ' + NFdailyAvg['nf_trans_fatty_acid'] + 'g'}</div>
						</ListItem>
						<Divider insert={true} />
						<ListItem primaryText={'Daily Cholesterol Consumption: ' + NFdailyAvg['nf_cholesterol'] + 'mg'} />
						<Divider insert={true} />
						<ListItem primaryText={'Daily Sodium Consumption: ' + NFdailyAvg['nf_sodium'] + 'mg'} />
						<Divider insert={true} />
						<ListItem primaryText={'Daily Vitamin A Consumption: ' + NFdailyAvg['nf_vitamain_a_dv'] + '% DV'} />
						<Divider insert={true} />
						<ListItem primaryText={'Daily Vitamin C Consumption: ' + NFdailyAvg['nf_vitamin_c_dv'] + '% DV'} />
						<Divider insert={true} />
						<ListItem primaryText={'Daily Calcium Consumption: ' + NFdailyAvg['nf_calcium_dv'] + '% DV'} />
						<Divider insert={true} />
						<ListItem primaryText={'Daily Iron Consumption: ' + NFdailyAvg['nf_iron'] + '% DV'} />
						<Divider insert={true} />
					</List>
					</div>
				</div>
			);

	} else {
		return (<p>User has not logged any info yet</p>);
	}
}

export default Summary;
