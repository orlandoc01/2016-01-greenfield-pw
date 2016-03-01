
All scripts are heavily commented and important subfolders contain necessary reference material. When organizing our react components, we separated them into two different types
based on their use.

1) Presentational Components: Stored in the components folder, these react components are actually stateless functional components which, given a set of props, return a rendered view of what our html page should look like. Some of these props may be callbacks and but they contain no logic which implement a change in the state of our application

2) Containers: Stored in the containers folder, these components are mapped to some presentational components within the components folder. These components are created via redux's connect method and essentially connect props on the presentaional view components to the different values on the state or dispatches to the state through functions. They can be though of as wiring between the presentational components and the global state object and handle purely data mutation and changes within the state. They contain no view logic or DOM manipulation which alter what the user sees. A naming method was chosen to easily tell which container matches to a component. Given a presentational component with a name such as 'value', if there is a container to match it, it is named 'valueContainer'

With that in mind, the main thing to understand in our application is the flow of information between client and server, which can be summarized in the following sections described below.


AUTHENTICATION

1) GET request to '/' renders index.html with bundled JS containg React/Redux files

2) When AppContainer component renders, it calls the App component into view and maps certain properties and dispatches to the Store object, a global state object to handle the entire App's state
in one place. Handling logic is implemented by actions dispatched by containers (actions/index.jsx)
and configured via reducers (reducers/actoins.jsx) which handle certain properties on the State object

3) The App component immediately checks to see if the user object on the state is valid and has a meals
property. If not, the App calls a getUser function which makes a GET request to '/login', hoping to obtain back a user object to attach to the state if the client is within a validated session. If it doesn't it renders the AuthContainer which shows either a login page or a signup page.

4) When the user enters login credentials, a POST request is made to '/login' and the server verifies
These credentials. If sucessful, the server starts a session with the client (thus the previously unsucessful GET request in step 3 now would work) and sends back a user object. The client attaches this to the global state object as state.user and the entire page re-renders due to the state change


MAIN COMPONENT

Now, because state.user and state.user.meals are valid, the MainContainer is displayed which maps
the foods and meals props on the Main component to state.user.foods and state.user.meals. The foods object acts as a dictionary, whose scheme can be represented as {food_id: nutritional info obj} where
the nutritional info object looks like {nf_calories: 250, nf_protein: 25g...}. The meals value on the user object is an array with meal objects. Each meal object has a createdAt key, a eatenBy key, and a foodsEaten key. The foodsEaten key matches to an object whose key is a food id and whose value is the quantity of that food eaten. Thus, as a simple example, if I ate 1 apple whose key was 123, and I drank 2 glasses of milk whose keys are 456, we could expect this meals object on the state.user object to look like this: 
	{createdAt: now,
	 eatenBy: Orlando,
	 foodsEaten: {
	 		123: 1,
	 		456: 2,
	 	}
	}
If I later had a burger, whose key was 789, my complete user state object would look like this:
state.user = {
			username: Orlando
			....
			foods: {
				123: apple nutr obj,
				456: milk nutr obj,
				789: burger nutr obj,
			},

			meals: [{
				eatenAt: now
				eatenBy: orlando
				foodsEaten: {
					123: 1,
					456: 2,
					}
				}, {
				eatenAt: later,
				eatenBy: orlando
				foodsEaten: {
					789: 1
					}
				}]
			}

Thus, we see how recreating any nutritional information necessiates use above both the meals array of meal objects, and the foods object-dictionary. These props are constantly passed down to child elements. Note also that in this example that accessing foods[123] would give me all the nutritional info for an apple, because that is its food_id. This is a technique that is constantly used 
(Note all ids are obtained from the Nutrionix requests on the server side and saved in the db and given to the client)

SUMMARY COMPONENT

Renders all relevant aggregate nutritonal information for the current day and on an average daily basis. Examine each file for individual calculations but they access the foods and meals props on the main container, which are tied to the state.user.foods and state.user.meals

CALORIE LOG

Similiar implementation logic to summary component as far as manipulation props that are inherited and determined by the global state object

RECORD MEALS

This presentational component and its children components need to mutate data and render different results, so they also have access to different properties on the state which are connected via their similiarily named containers. This component has two sections represented by child components, the
Search component and the SelectFood component. While details about these two components is given in the subsequent components, it is important to understand that the Search component displays all possible results to a user's query for a food, while the SelectFood component displays all foods which are about to be stored to the user's diet log, but need quantities assigned first

SEARCH

In the Search component, a user submits a POST request
to the server at '/search' and the searchContainer grabs this result, which is a list of possible matches and dispatches it to the global State object, who assigns this array of results to a property  accessible via state.foodQueries. The SearchContainer maps state.foodQueries to the prop 'foodList' on the Search component. Search component then renders these foods in its prop as a list of clickable options to select. If an option is selected, its matching food object in the foodsList array is sent to the state, who stores it at state.selectedFoods.
NOTE: the food objects in this array do not contain as much nutritional info as the food objects in state.foods because they are only tentative possibilites. Once the user has selected a food they know they want to store, we will grab the complete nutritional profile for that food

SELECTEDFOOD

The selectedFood component has a prop called selectedFoods (an array), which is mapped to the state.selectedFoods value via selectedFoodContainer. The selected Food then renders all foods in this array into a list with a possible input value, which represents the quantity that was consumed of this food which the user must input. Once the user has selected a quantity for each foodentry and clicked the submit buttton, the selectedFood container will use this data to create a new meal object which is pushed to the top of the array at state.user.meals. It will also check for any new foodIds that were submitted in this section and obtain their complete nutritional info and store that as a new entry in the dictionary object state.user.foods. Any components that depend on these values (mainly the Summary Component and the Calorie log component, will then re-render with the newly updated info)


TECHNOLOGIES:

Front-end: React, Redux, Gulp, Browserify. Note that a gulp file is setup to babelify and bundle all files on the client. If any change is made in the client files, run 'gulp' in the command-line to re-compile the bundle.js

Back-end: Mongodb, express, Nutrionix API