import React from 'react';
import Food from './Food.jsx';
import MealsList from './MealsList.jsx'


const CalorieLog = ({user}) => {
	//Groups all meals by the createdAt time stamp, which for now ensures each
	//meal gets it's own mealsList entry. However, can be changed to group by same date/week/etc
	let mealsByDate = _.groupBy(user.meals, (meal) => meal.createdAt);
	return (
			<div className='calorie-log'>
			   {_.values(mealsByDate).map((meals, i) => <MealsList meals={meals} foods={user.foods} key={i}/> )}
			</div>
		);
}

export default CalorieLog
