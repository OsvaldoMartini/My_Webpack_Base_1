# Server Side Render

You can download this repository by using the green `Clone or Download` button on the right hand side of this page.  
This will present you with the option to either clone the repository using Git, or to download it as a zip file.

If you want to download it using git, copy paste the link that is presented to you, then run the following at your terminal:

```
git clone https://github.com/OsvaldoMartini/My_Webpack_Base_1.git

cd My_Webpack_Base_1

npm install
```

# Render Server Side with React

## Video 23 - Ignoring File with WebpackNodeExternals
```
 So anything that's inside the nome modules folder will not be included inside of our server side bundle.
 
 externals: [webpackNodeExternals()]
```

## Video 24 - Renderer Helper
```

 This helpes to separate out this express related logic inside "index.js"

```

## Video 25 - Implementing React Router Support
```
 New Way to Route wih (Router-ReactConfig)
 React-Router-Config
 It will help Us to figure Out hat set of components are about to be rendered. Give some Particular URL
```
## IIS-Express
```
If wew want to add in some route for some API handlers or some handler that to return some JSON or any outside requests
we might want to take in.

We can certainly add those as routing logic to express (or other Server Side like .Net MVC)
```

## React Router 
```
But anthing that is meant to show HTML out.
We are always going to  ake sure that React-Router is in charge of that request.

```

## Video 26 - BrowserRouter vs StaticRouter

## StaticRouter
This is a special Library from React

```
When we do our initial render of the app it's going to be using
the StaticRouter
```

This can be useful in server-side rendering scenarios when the user isn’t actually clicking around, 
so the location never actually changes. 

Hence, the name: static. It’s also useful in simple tests when you just need to plug in a location and make assertions 
on the render output.

check the sample:
```
Here’s an example node server that sends a 302 status code for <Redirect>s and regular HTML for other requests:
```
https://reacttraining.com/react-router/web/api/StaticRouter



## BrowserRouter
This is a special Library from React
```
When our application gets shipped down to the browser and it gets rendered a second time or "hydrate on the browser"
as we call it.

We will swap out to using the BrowserRouter instead.
```

## Summary About "BrowserRouter vs StaticRouter"
```
We  have one running on the server (StaticRouter)
and another running on the browser (BrowserRouter) 
```

## List of Reducers for our Application

![alt text](Draws/Reducers/List-Of-Reducers.PNG "List of Reducers")

# 4 Big Challenges
 
 I will have 2 (Two) copies of Redux

## 1) First Challenge     
```
 Redux needs different configuration
 on browser vs server
```

## 2) Second Chanllenge 
```
Aspects of authentication needs to be handle on server. 
Normally this is only on browser 
```
## 3) Third Challenge
```
Need some way to detect when all initial data load "action creators" 
are completed on server
```

## 4) Fourth Challenge
```
Need state rehydration on the browser
```

![alt text](Draws/Reducers/4-Big-Redux-Challeges.PNG "4 Big Challenges")

# 1) Solving First Challenge

##  Redux -> Client Side Set-Up  

### "client.js"

* "Middleware" is used to hook up any middleware that we migth be using inside of our application
```js
import { createStore, applyMiddleware } from 'redux';
```

 * "Thunk" is used to handle Asynchronous calls for the action creators
```js
import thunk from 'redux-thunk';
```

* "Provider" is What Ties our Store and React side together
> Is used to communicate data from the store to any connected components in our application
```js
import { Provider } from 'react-redux';
```

* Create New Redux Store to use on the Client Side to Store all our Reducers
```
We Don't Have Any Reducers for now
No Reducers for now
Initial State = { } "empty Object"
And Hook Up the Middleware Call (thunk)

//Creating the first Store
```
```js
const store = createStore(reducers, {}, applyMiddleware(thunk));

```

* Sticking the "STORE" to the "Provider" to wrap all entire application

>Passing as  "prop" to the <Provider> 'Tag'
```js
<Provider store={store}>
```

* "The Provider" has reference to the read store, any time the redux store changes.
* "The Provider" Will note or will alert any connected components that they need to render

![alt text](Draws/Reducers/Client-Side-Redux-Store.PNG "Client Side Redux Store")

##  Redux -> Server Side Set-Up  

### "createStore.js"

> I Only need the store in Server-Side
```js
import { createStore, applyMiddleware } from 'redux';
```
* "Thunk" - Takecare about the Asynchronous call for the action creators
```js
import thunk from 'redux-thunk'; 
```

* Create Redux Store to use on the SERVER Side
```
We Don't Have Any Reducers for now
Initial State = { } "empty Object"
And Hook Up the Middleware Call (thunk)
```
> Creating the Second Store and Return It.
```js
export default () => {
  const store = createStore(reducers, {}, applyMiddleware(thunk));

  return store;
};
```
> I DON'T need the PROVIDER in Server-Side
```
 In Client Side I need the PROVIDER to Dispatch Notices and Alerts 
 for the components to attempt to render
```
### The Challenge is:
```
Some Detection of "When" we finish all of our initial data loading "Before" we attempt to render
```
> BUT I DO NEED the PROVIDER inside of  RENDERER JS BEFORE TO RENDER
```
 Inside to the RENDERER to handle the transformation Data Store to RAW HTML
 ```

![alt text](Draws/Reducers/Server-Side-Redux-Store.PNG "Server Side Redux Store")

# CLIENT FOLDER
> The Following files will be created inside of the "client" folder:
* "./client/actions/`index.js`"    -> it holds all `Action Creators` for the app
* "./client/reducers/`index.js`"   -> to `combine` all different `reducers` together
* "./client/reducer/`adminsReducer.js` -> to watch `FETCH_ADMINS` Action Creator

## Action Creators
> FETCH_ADMINS

#### "./client/actions/`index.js`"
```js
/**
|--------------------------------------------------
| Action Creator for List of Admins
|--------------------------------------------------
*/
import axios from 'axios';

export const FETCH_ADMINS = 'fetch_admins';
export const fetchAdmins = () => async dispatch => {
  const res = await axios.get('http://react-ssr-api.herokuapp.com/admins');

  dispatch: ({
    type: FETCH_ADMINS,
    payload: res
  });
};
```

## Reducers
> Reducer to Match with `FETCH_ADMINS` Action Creator
### This Reducer `watch's` the FETCH_ADMINS "Action Creator"
#### './client/reducers/`adminsReducer.js`"
```js
/**
|--------------------------------------------------
| Reducer to Watch FETCH_ADMINS Action Creator
|--------------------------------------------------
*/
import { FETCH_ADMINS } from '../actions';

export default (state = [], action) => {
  switch (action.type) {
    case FETCH_ADMINS:
      return action.payload.data;
    default:
      return state;
  }
};
```

## Combine all different reducers together
#### "./client/reducers/`index.js`"

```js
/**
|--------------------------------------------------
| Combine all Different Reducers together
|--------------------------------------------------
*/
import { combineReducers } from 'redux';
import usersReducer from './usersReducer';
import adminReducer from './adminsReducer';

export default combineReducers({
  users: usersReducer,
  admins: adminReducer
});

```
![alt text](Draws/Reducers/Setting-Up-Action-Creators.PNG "Setting Up Actions Creators and Reducers")

# `VERY IMPORTANT!`
## I will `Redefine` the exported name to `RootReducer` to make the things more clear
```js
const rootReducer = combineReducers({ ...
   ...
});

export default rootReducer;
```
![alt text](Draws/Reducers/CombinedReducers-to-RootReducers.PNG "Changing From CombinedReducers to RootReducers")


#

## About Redux DevTools
## Manual Integration

If you want to have full control over where DevTools are displayed, or are developing a custom monitor, you will probably want to integrate them manually.
It’s more steps, but you will have full control over monitors and their configuration.

### Installation

```
npm install --save-dev redux-devtools
```

You’ll also likely want to install some monitors:

```
npm install --save-dev redux-devtools-log-monitor
npm install --save-dev redux-devtools-dock-monitor
```

### Usage

#### Create a `DevTools` Component

Somewhere in your project, create a `DevTools` component by passing a `monitor` element to `createDevTools`. In the following example our `monitor` consists of [`LogMonitor`](https://github.com/gaearon/redux-devtools-log-monitor) docked within [`DockMonitor`](https://github.com/gaearon/redux-devtools-dock-monitor):

#### Defining wich `DevTools` use: `DockMonitor` and/or `LogMonitor`

##### `containers/DevTools.js`

* Create the folder `Containers` for the `DevTools.js` file
```
containers/DevTools.js
```
```js
import React from 'react';

// Exported from redux-devtools
import { createDevTools } from 'redux-devtools';

// Monitors are separate packages, and you can make a custom one
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

// createDevTools takes a monitor and produces a DevTools component
const DevTools = createDevTools(
  // Monitors are individually adjustable with props.
  // Consult their repositories to learn about those props.
  // Here, we put LogMonitor inside a DockMonitor.
  // Note: DockMonitor is visible by default.
  <DockMonitor
    toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-q"
    defaultIsVisible={true}
  >
    <LogMonitor theme="tomorrow" />
  </DockMonitor>
);

export default DevTools;
```

## Advanced Prod and Dev Enviromnet

### Configure `Create Store` for `Dev`
```
store/configureStore.dev.js
```
```js
/**
|--------------------------------------------------
| Dev - With No Persist State
| Configure Store for Development with "store enhancer"
|--------------------------------------------------
*/
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(d1, d2, d3),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument()
);

export default function configureStore(initialState) {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/reactjs/redux/releases/tag/v3.1.0
  const store = createStore(rootReducer, initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(
        require('../reducers') /*.default if you use Babel 6+ */
      )
    );
  }

  return store;
}
```
### Configure Configure `Create Store` for `Dev` - `With Persist State`
```
store/configureStore.dev.persist.state.js
```
```js
/**
|--------------------------------------------------
| Dev - With Persist State
| Configure Store for Development with "store enhancer"
|--------------------------------------------------
*/
import { createStore, applyMiddleware, compose } from 'redux';
import { persistState } from 'redux-devtools';

//Reducers Entry Point
import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(d1, d2, d3),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument(),
  // Optional. Lets you write ?debug_session=<key> in address bar to persist debug sessions
  persistState(getDebugSessionKey())
);

function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return matches && matches.length > 0 ? matches[1] : null;
}

export default function configureStore(initialState) {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  const store = createStore(rootReducer, initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(
        require('../reducers') /*.default if you use Babel 6+ */
      )
    );
  }

  return store;
}
```
### Configure `Create Store` for `Prod`
```
store/configureStore.prod.js
```
```js
/**
|--------------------------------------------------
| Configure Store for Production
|--------------------------------------------------
*/
import { createStore, applyMiddleware, compose } from 'redux';

// Reducers Entry Point
import rootReducer from '../reducers';

// Middleware you want to use in production:
const enhancer = applyMiddleware(p1, p2, p3);

export default function configureStore(initialState) {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  return createStore(rootReducer, initialState, enhancer);
}
```


### Exclude DevTools from `Production` Builds
#### Finally, to make sure we’re not pulling any DevTools-related code in the production builds, 
* We will `envify` our code. You can use `DefinePlugin` with `Webpack`, or `envify` for `Browserify`.
```
webpack.config.prod.js
```
```js
// ...
plugins: [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  })
],
// ...
```

# Using <DevTools> in 3 (Three) Ways
* `Render` direct in your `App`;
* `Define` a `Root.js` for your `Application`

## 1) Render direct in `Your App`
```
Finally, include the DevTools component in your page.
A naïve way to do this would be to render it right in your index.js:
```
>  Render direct in `Your App`...
* *`Important!` -> 'Don't do this!' You’re bringing 'DevTool's into the 'PRODUCTION' bundle.
```js
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import TodoApp from './containers/TodoApp';

// Don't do this! You’re bringing DevTools into the production bundle.
import DevTools from './containers/DevTools';

const store = configureStore();

render(
  <Provider store={store}>
    <div>
      <TodoApp />
      <DevTools />
    </div>
  </Provider>
  document.getElementById('app')
);
```
## 2) `Root` of the `Application`
We recommend a different approach. 
```
Create a Root.js component that renders the root of your application 
```
Usually some component surrounded by a `<Provider>` 
```
Then use the same trick with conditional require statements to have two versions of it
``` 
`One for development`, and one for `Production`
>  `Define` a `Root.js` for your `Application`
```
containers/Root.js
```
```js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./Root.prod');
} else {
  module.exports = require('./Root.dev');
}
```
#### `Root.dev`:
```
containers/Root.dev.js
```
```js
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import TodoApp from './TodoApp';
import DevTools from './DevTools';

export default class Root extends Component {
  render() {
    const { store } = this.props;
    return (
      <Provider store={store}>
        <div>
          <TodoApp />
          <DevTools />
        </div>
      </Provider>
    );
  }
}
```
#### `Root.prod.js`
```
containers/Root.prod.js
```
```js
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import TodoApp from './TodoApp';

export default class Root extends Component {
  render() {
    const { store } = this.props;
    return (
      <Provider store={store}>
        <TodoApp />
      </Provider>
    );
  }
}
```
## 3) Or Open Them in a New Window

When you use [`DockMonitor`](https://github.com/gaearon/redux-devtools-dock-monitor), you usually want to render `<DevTools>` at the root of your app. It will appear in a docked container above it. However, you can also render it anywhere else in your React component tree. To do this, you can remove `DockMonitor` and instead render `<DevTools>` inside some component of your app. Don’t forget to create two versions of this component to exclude `DevTools` in production!

However you don’t even have to render `<DevTools>` in the same window. For example, you may prefer to display it in a popup. In this case, you can remove `DockMonitor` from `DevTools.js` and just use the `LogMonitor`, and have some code like this:

##### `index.js`

```js
import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import configureStore from './store/configureStore';
import App from './containers/App';

const store = configureStore();

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

if (process.env.NODE_ENV !== 'production') {
  const showDevTools = require('./showDevTools');
  showDevTools(store);
}
```

##### `showDevTools.js`

```js
import React from 'react';
import { render } from 'react-dom';
import DevTools from './containers/DevTools';

export default function showDevTools(store) {
  const popup = window.open(
    null,
    'Redux DevTools',
    'menubar=no,location=no,resizable=yes,scrollbars=no,status=no'
  );
  // Reload in case it already exists
  popup.location.reload();

  setTimeout(() => {
    popup.document.write('<div id="react-devtools-root"></div>');
    render(
      <DevTools store={store} />,
      popup.document.getElementById('react-devtools-root')
    );
  }, 10);
}
```


# Extra Tips and Tools
## G Suite Toolbox - Dig DNS Dig Tool
https://toolbox.googleapps.com/apps/dig/#AAAA/
### Install:
https://help.dyn.com/how-to-use-binds-dig-tool/
https://www.isc.org/downloads/
#### Usage:
```
>dig www.wservices.co.uk +nostats +nocomments +nocmd
>dig www.wservices.co.uk +nostats +nocomments +nocmd
>dig www.wservices.co.uk +nostats +nocomments +nocmd
```
#### Videos 49 and 50
Deploymnet of Servers and Node and Webpack Integration

> Making webpack Middleware.
#### Creating a Stand Alone Server
```
npm install --save express
```

Install Webpack as  Middleware (For Intercept incoming request and hand it off to webpack)

```
npm install --save-dev webpack-dev-middleware@2.0.6
```
#### If you get this error:
```js
context.compiler.hooks.invalid.tap('WebpackDevMiddleware', invalid);
```

#### These Versions really works together
```
  "webpack": "^2.2.0-rc.0",
  "webpack-dev-middleware": "^2.0.6",
  "webpack-dev-server": "^2.2.0-rc.0"
```

#### Tests as PRODUCTION

```
SET NODE_ENV=production
Delete folder 'dist'
node server.js
```

#### Adding some Authentication or Databasic Logic or anything like that
It is to Add Additional Route ABOVE .. 
#### I meant: "ABOVE"... "ABOVE ALL WEBPACK INFORMATION"
`server.js`
```js
//Servers Routes...

app.get('/hello', (req, res) => res.send({ hi: 'there' }));

if (process.env.NODE_ENV !== 'production') { ...
```
