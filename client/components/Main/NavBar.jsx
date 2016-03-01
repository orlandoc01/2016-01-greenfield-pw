import React from 'react';
import Tabs from 'material-ui/lib/tabs/tabs.js';
import Tab from 'material-ui/lib/tabs/tab.js';
import CalorieLog from './CalorieLog.jsx';
import RecordMeals from './RecordMeals.jsx';
import Summary from './Summary.jsx';

const NavBar = ({user}) => {

	return (
		<div className="nav-bar">
				<Tabs tabItemContainerStyle={{backgroundColor:"rgb(139,189,7)"}}>
					<Tab label="Summary">
						<Summary user={user}/>
					</Tab>
					<Tab label="Calorie Log">
						<CalorieLog user={user} />
					</Tab>
					<Tab label="Record Meals">
						<RecordMeals user={user} />
					</Tab>
				</Tabs>
		</div>
		);
}

export default NavBar;
