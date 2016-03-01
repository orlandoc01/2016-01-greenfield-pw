import React from 'react'
import SearchContainer from '../../containers/SearchContainer.jsx';
import SelectFoodContainer from '../../containers/SelectFoodContainer';


const RecordMeals = () => {
	return (
			<div className = 'record-meals'>
        <SearchContainer />
        <SelectFoodContainer />
			</div>
		);
}

export default RecordMeals;
