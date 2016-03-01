import React from 'react';
import Main from './Main/Main.jsx';
import Login from './Auth/Login.jsx';
import AuthContainer from '../containers/AuthContainer.jsx';
import MainContainer from '../containers/MainContainer.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';
//Allows support of material UI components
injectTapEventPlugin();


const App = ({user, getUser}) => {

//If the user is authenticated, both the user object and the
//user.meals value should be valid. Thus, we return the MainContainer
//App if this check validates. Else, we try and get the user from the
//Server and then return the AuthContainer if that doesn't trigger 
//a state change

  if(!user || !user.meals) {
    getUser();
    return (<AuthContainer />);
  } else {
    return (<MainContainer />);
  }
}

export default App;
