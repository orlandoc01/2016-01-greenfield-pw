import React from 'react';
import TableRow from 'material-ui/lib/table/table-row';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import ContentRemove from 'material-ui/lib/svg-icons/content/remove';

const Food = ({food, key, buttonAction, buttonIcon, numEaten, eatenInMeal}) => {
  let name = food['item_name'];
  let brand = food['brand_name'];


  //The below options, buttonColumn, servingColumn, and inputColumn are optional params
  //that if present, render another column in the returned tableRow
  let buttonColumn;
  if(buttonAction){
    buttonColumn = (
      <TableRowColumn>
        <FloatingActionButton onMouseDown={buttonAction}
         onTouchStart={buttonAction} mini={true} secondary={true}>
        {buttonIcon === 'add' ? <ContentAdd /> : <ContentRemove />}
        </FloatingActionButton>
      </TableRowColumn>
    );
   }

  let servingColumn;
  if(buttonIcon !== "remove"){
    eatenInMeal = eatenInMeal || food.nf_serving_size_qty;
    servingColumn = (
      <TableRowColumn>
        <h5>{ eatenInMeal + " - " +food.nf_serving_size_unit}</h5>
      </TableRowColumn>
    );
   }

  let inputColumn;
  if(numEaten){
    inputColumn = (
      <TableRowColumn>
        <input type="number" ref = {numEaten} placeholder={0}/>
      </TableRowColumn>
    );
   }

   let calorieColumn;
   if(eatenInMeal){
    <TableRowColumn>
      <p>{Math.floor(food.nf_calories) + "cal x " + eatenInMeal + " = " + food.nf_calories * eatenInMeal +" cal"}</p>
    </TableRowColumn>
   }

    return (
      <TableRow className='food-item'>
        {inputColumn} 
        <TableRowColumn><h5>{name}</h5><h6>{brand}</h6></TableRowColumn>
        {servingColumn}
        {calorieColumn}
        {buttonColumn}
      </TableRow>
    )
}

export default Food;
