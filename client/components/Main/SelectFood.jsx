import React from 'react';
import Food from './Food.jsx';
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';
import RaisedButton from 'material-ui/lib/raised-button';

const SelectFood = ({selectedFoods, removeFood, user, sendMeal, sendFoodItems}) => {
  //Times eaten has a value whose index corresponds to the foodItem listed in selectedFood and
  //whose value corresponds to the number of servings that have been consumed for that food
  let timesEaten = [];


  let removeSelectedFood = (food) => {
    removeFood(food);
  }

  let submitMeal = (e) => {
    e.preventDefault();
    //Initialize the new meal object, which will
    //be filled with all appropriate vlaues in selectedFoods
    let meals = {
      eatenAt: Date.now(),
      eatenBy: user.userInfo.username,
      foodsEaten: {}
    };
    //Initialize all newFoodIds whose Nutr profile need to be looked up
    let newFoodIds = [];

    (_.values(selectedFoods).forEach((food, index) => {
      meals.foodsEaten[food.item_id] = timesEaten[index].value;
      if(!(food.item_id in user.foods)) {
        newFoodIds.push(food.item_id);
      }
    }));

    //First send all newFoodIds, then send the new meals object for storage
    sendFoodItems(newFoodIds)
    .then(sendMeal.bind(this, meals));

    //Clear selected foods once values have been sent
    _.values(selectedFoods).forEach(removeSelectedFood);

  }

  let selectedFoodsDisplay;
  //If there are no foods in selectedFoods, we return a message saying so
  //Else, we show all food in a table with Food Components that are table rows
  if(_.isEmpty(selectedFoods)){
    selectedFoodsDisplay = <div>No entry selected</div>;
  } else {
    selectedFoodsDisplay = (
      <TableBody
         displayRowCheckbox={false}
      >
        { _.values(selectedFoods).map((food, index) => {
          let id = food['item_id'];
          return (
            <Food
              numEaten={(ref) => timesEaten[index] = ref}
              className='selectedFoodEntry'
              food={food}
              key={id}
              buttonAction={removeSelectedFood.bind(this,food)}
              buttonIcon="remove"
            />
          );
        })
      }
      </TableBody>
    );
  }

//return rest of view with initial table setup
  return (
    <div className='select-food'>
      <h5 className="ate-header">Meal Items</h5>
      <Table>
        <TableHeader displaySelectAll={false} >
          <TableRow>
            <TableHeaderColumn> <h5>Quantity</h5> </TableHeaderColumn>
            <TableHeaderColumn> <h5>Description</h5> </TableHeaderColumn>
            <TableHeaderColumn> </TableHeaderColumn>
            <TableHeaderColumn> </TableHeaderColumn>
          </TableRow>
        </TableHeader>
         {selectedFoodsDisplay}
      </Table>
      {_.isEmpty(selectedFoods) ? null : <RaisedButton label="Submit" style={{margin:"8px"}} onMouseDown={submitMeal}/> }
    </div>
  );
}

export default SelectFood;
