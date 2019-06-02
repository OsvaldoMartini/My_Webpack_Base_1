/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

//import axios from 'axios';
/**
|--------------------------------------------------
| Action Creator for List of Users
| The FETCH_USERS is NOT SERVER SIDE rendering going on here yet
| The Rendering has be done by the CLIENT SIDE FUNCTIONS
|--------------------------------------------------
*/
var FETCH_USERS = exports.FETCH_USERS = 'fetch_users';
var fetchUsers = exports.fetchUsers = function fetchUsers() {
  return function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(dispatch, getState, api) {
      var res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return api.get('/users');

            case 2:
              res = _context.sent;


              dispatch({
                type: FETCH_USERS,
                payload: res
              });

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
};

/**
|--------------------------------------------------
| Asxios Instance to Request Ramdom Images
|--------------------------------------------------
*/
var axiosInstance = axios.create({
  baseUrl: 'https://api.unsplash.com',
  headers: {
    Authotization: 'Client-ID 43d68399a648aab9b8b72502c3feddddabbc9399d2d5f0cdd2df7a284d27c64f'
  }
});

/**
|--------------------------------------------------
| Action Creator for Random Images
|--------------------------------------------------
*/
var FETCH_IMAGES = exports.FETCH_IMAGES = 'fetch_images';
var fetchImages = exports.fetchImages = function fetchImages() {
  return function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dispatch) {
      var res;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return axiosInstance.get('/search/photos', {
                params: { query: term }
              });

            case 2:
              res = _context2.sent;


              dispatch: ({
                type: FETCH_IMAGES,
                payload: res
              });

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x4) {
      return _ref2.apply(this, arguments);
    };
  }();
};

/**
|--------------------------------------------------
| Action Creator for List of Admins
|--------------------------------------------------
*/
var FETCH_ADMINS = exports.FETCH_ADMINS = 'fetch_admins';
var fetchAdmins = exports.fetchAdmins = function fetchAdmins() {
  return function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(dispatch) {
      var res;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return axios.get('http://react-ssr-api.herokuapp.com/admins');

            case 2:
              res = _context3.sent;


              dispatch: ({
                type: FETCH_ADMINS,
                payload: res
              });

            case 4:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    }));

    return function (_x5) {
      return _ref3.apply(this, arguments);
    };
  }();
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("react-router-config");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
//import { Route } from 'react-router-dom';

//import UsersList, { loadData } from './components/UsersList';


var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _HomePage = __webpack_require__(25);

var _HomePage2 = _interopRequireDefault(_HomePage);

var _UsersListPage = __webpack_require__(27);

var _UsersListPage2 = _interopRequireDefault(_UsersListPage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Exact Prop I want to show this route if the URL is exactly the path "Slash"
// export default () => {
//     return (
//         <div>
//             <Route exact path="/" component={Home} />
//             <Route path="/hi" component={() => 'Hi'} />
//             <Route path="/users" component={UsersList} />
//         </div>
//     );
// }

// New Way to Route wih (Router-ReactConfig)
// React-Router-Config
// it will help Us to figure Out hat set of components are about to be rendered. Give some Particular URL
exports.default = [_extends({}, _HomePage2.default, { //ES2016 Syntax (some spread syntax)
  path: '/',
  //component: Home,
  exact: true
}), _extends({}, _UsersListPage2.default, {
  path: '/users'
  //component: UsersListPage
}), {
  path: '/Hi',
  component: function component() {
    return 'Hi';
  }
}, {
  path: '/MapBox',
  component: function component() {
    return 'MapBox';
  }
}, {
  path: '/images',
  component: function component() {
    return 'Images';
  }
}, {
  path: '/Admins',
  component: function component() {
    return 'Admins';
  }
}];

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("react-redux");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reduxDevtools = __webpack_require__(16);

var _reduxDevtoolsLogMonitor = __webpack_require__(17);

var _reduxDevtoolsLogMonitor2 = _interopRequireDefault(_reduxDevtoolsLogMonitor);

var _reduxDevtoolsDockMonitor = __webpack_require__(18);

var _reduxDevtoolsDockMonitor2 = _interopRequireDefault(_reduxDevtoolsDockMonitor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// createDevTools takes a monitor and produces a DevTools component


// Monitors are separate packages, and you can make a custom one
/**
|--------------------------------------------------
| DevTools definition with DockMonitor and Log Monitor
|--------------------------------------------------
*/
var DevToolsAsDock = (0, _reduxDevtools.createDevTools)(
// Monitors are individually adjustable with props.
// Consult their repositories to learn about those props.
// Here, we put LogMonitor inside a DockMonitor.
// Note: DockMonitor is visible by default.
_react2.default.createElement(
  _reduxDevtoolsDockMonitor2.default,
  {
    toggleVisibilityKey: 'ctrl-h',
    changePositionKey: 'ctrl-q',
    defaultIsVisible: true
  },
  _react2.default.createElement(_reduxDevtoolsLogMonitor2.default, { theme: 'tomorrow' })
));

// Exported from redux-devtools
exports.default = DevToolsAsDock;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("redux");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(8);

var _express = __webpack_require__(9);

var _express2 = _interopRequireDefault(_express);

var _reactRouterConfig = __webpack_require__(2);

var _expressHttpProxy = __webpack_require__(29);

var _expressHttpProxy2 = _interopRequireDefault(_expressHttpProxy);

var _Routes = __webpack_require__(3);

var _Routes2 = _interopRequireDefault(_Routes);

var _renderer = __webpack_require__(13);

var _renderer2 = _interopRequireDefault(_renderer);

var _configureStore = __webpack_require__(19);

var _configureStore2 = _interopRequireDefault(_configureStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//const express = require('express');
var app = (0, _express2.default)();

// Above all other Middlewares low level proxy
// Set up as Middleware Before all other Middlewares
// Any route whatsoever or any request that tries toa ccess a route '/api'
// Will be automatically sent off o this domain


// Two Ways Create Store
//import createStore from './helpers/createStore';
// To Be used with DevTools
//Isomorphic Java Script / Universal Javascript
app.use('/api', (0, _expressHttpProxy2.default)('http://react-ssr-api.herokuapp.com', {
  proxyReqOptDecorator: function proxyReqOptDecorator(opts) {
    // Just Set this for the Current Course in this App
    // Just to give as easy way to handle with Google Auth process
    // And don't run some security erros with the Google waterflow (that's all)
    opts.header['x-forwarded-host'] = 'localhost:3000';
    return opts;
  }
}));

//const React = require('react');
//const renderToString = require('react-dom/server').renderToString;
//const Home = require('./client/components/home').default;

app.use(_express2.default.static('public'));

// ## This tells express that it needs to treat that public directory as a static or public directory that is
// ## available o the outside world
// The BrowserRouter (Not The StaticRouter) BrowserRouter Has the ability to look directly at our browser's address bar to figure out what the current path is, and what set
// of components it needs to show on the screen.
// The StaticRouter however, needs to be told exactly what the current path is that it needs to consider.
// So for us, we need to somehow communicate the current path that the user is trying to access to the StaticRouter, So that StaticRouter knows what set of components it should show on the screen.
// The current path that it need to consider is contained in the original request object that express passed out to our Router Handler inside the JSX File.
// The "(req)" inside of "...app.get('/', (req, res) ..." This request ("..req..") contains the URL that the user is trying to access.

//Passing the " req " inside of the render as argument
app.get('*', function (req, res) {
  // Redux - Server Side Set-Up

  //const store = createStore();
  //to Be Used with DevTools
  var store = (0, _configureStore2.default)();

  // Some logic to initialize
  // and load data into the Store
  // List of Routes and Path That The User Want to Access
  // "matchRoutes" It's going to look at whatever route the user is trying to visit and
  // then it's going to return an array of components that are about to be rendered

  // lets console.log the MatchRoutes
  console.log((0, _reactRouterConfig.matchRoutes)(_Routes2.default, req.path));

  // Mapping matchRoutes
  //We Are Doing some Destructuring Here ({route})
  var promises = (0, _reactRouterConfig.matchRoutes)(_Routes2.default, req.path).map(function (_ref) {
    var route = _ref.route;

    return route.loadData ? route.loadData(store) : null;
  });

  console.log(promises);

  Promise.all(promises).then(function () {
    // Finnaly Call the Server Side Render
    res.send((0, _renderer2.default)(req, store));
  });
});

app.listen(3000, function () {
  console.log('listening on port 3000');
});

//  Building:
//  npm run dev:build:server

//  Running:
//  node build/bundle.js

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _server = __webpack_require__(14);

var _reactRouterDom = __webpack_require__(15);

var _reactRedux = __webpack_require__(4);

var _reactRouterConfig = __webpack_require__(2);

var _Routes = __webpack_require__(3);

var _Routes2 = _interopRequireDefault(_Routes);

var _serializeJavascript = __webpack_require__(28);

var _serializeJavascript2 = _interopRequireDefault(_serializeJavascript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (req, store) {
  console.log('Rendering in Server Side');

  var content = (0, _server.renderToString)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(
      _reactRouterDom.StaticRouter,
      { location: req.path, context: {} },
      _react2.default.createElement(
        'div',
        null,
        (0, _reactRouterConfig.renderRoutes)(_Routes2.default)
      )
    )
  ));

  // ## Underneath a tine little HTML. I'll snifft it (farejar)
  return '\n    <html>\n        <head></head>\n        <body>\n            <div id="root">' + content + '</div>\n            <script>\n            window=INITIAL_STATE = ' + (0, _serializeJavascript2.default)(store.getState()) + '\n            </script>\n            <script src="bundle.js"></script>\n        </body>\n    </html>\n    ';
};
//import DevToolsAsDock from '../../DevTools/DevToolsAsDock';
// this file is going to house a function that will simply render our react up and return it as a string

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("react-dom/server");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("react-router-dom");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("redux-devtools");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("redux-devtools-log-monitor");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("redux-devtools-dock-monitor");

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
|--------------------------------------------------
| Configure Store Entry Point Dev / Prod
|--------------------------------------------------
*/

// Use DefinePlugin (Webpack) or loose-envify (Browserify)
// together with Uglify to strip the dev branch in prod build.
if (false) {
  module.exports = require('./configureStore.prod');
} else {
  module.exports = __webpack_require__(20);
}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = configureStore;

var _redux = __webpack_require__(6);

var _reduxThunk = __webpack_require__(21);

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _reducers = __webpack_require__(22);

var _reducers2 = _interopRequireDefault(_reducers);

var _DevToolsAsDock = __webpack_require__(5);

var _DevToolsAsDock2 = _interopRequireDefault(_DevToolsAsDock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
|--------------------------------------------------
| Dev - With No Persist State
| Configure Store for Development with "store enhancer"
|--------------------------------------------------
*/
var enhancer = (0, _redux.compose)(
// Middleware you want to use in development:
(0, _redux.applyMiddleware)(_reduxThunk2.default), //(d1, d2, d3)
// Required! Enable Redux DevTools with the monitors you chose
_DevToolsAsDock2.default.instrument());

//Takecare about the Asynchronous call for the action creators
function configureStore(initialState) {
  console.log('DevTool Going through Development');

  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/reactjs/redux/releases/tag/v3.1.0
  var store = (0, _redux.createStore)(_reducers2.default, initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (false) {
    module.hot.accept('../client/reducers', function () {
      return store.replaceReducer(require('../client/reducers') /*.default if you use Babel 6+ */
      );
    });
  }

  return store;
}

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("redux-thunk");

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = __webpack_require__(6);

var _usersReducer = __webpack_require__(23);

var _usersReducer2 = _interopRequireDefault(_usersReducer);

var _adminsReducer = __webpack_require__(24);

var _adminsReducer2 = _interopRequireDefault(_adminsReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rootReducer = (0, _redux.combineReducers)({
  users: _usersReducer2.default,
  admins: _adminsReducer2.default
}); /**
    |--------------------------------------------------
    | Combine all Different Reducers together
    |--------------------------------------------------
    */
exports.default = rootReducer;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _actions = __webpack_require__(1);

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case _actions.FETCH_USERS:
      return action.payload.data;
    default:
      return state;
  }
}; /**
   |--------------------------------------------------
   | This Reducer it going to Watch the FETCH_USERS action creator
   |--------------------------------------------------
   */

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _actions = __webpack_require__(1);

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case _actions.FETCH_ADMINS:
      return action.payload.data;
    default:
      return state;
  }
}; /**
   |--------------------------------------------------
   | Reducer to Watch FETCH_ADMINS Action Creator
   |--------------------------------------------------
   */

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Home = function Home() {
  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(
      'div',
      null,
      'I\'m the VERY VERY very VERY home component'
    ),
    _react2.default.createElement(
      'button',
      { onClick: function onClick() {
          return console.log('Hi There!');
        } },
      'Press me!'
    )
  );
};

exports.default = {
  component: Home
};

/***/ }),
/* 26 */,
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRedux = __webpack_require__(4);

var _actions = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UsersList = function (_Component) {
  _inherits(UsersList, _Component);

  function UsersList() {
    _classCallCheck(this, UsersList);

    return _possibleConstructorReturn(this, (UsersList.__proto__ || Object.getPrototypeOf(UsersList)).apply(this, arguments));
  }

  _createClass(UsersList, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Commented just to figure out the flow of the Data Load Initialy
      this.props.fetchUsers();
    }
  }, {
    key: 'renderUsers',
    value: function renderUsers() {
      return this.props.users.map(function (user) {
        return _react2.default.createElement(
          'li',
          { key: user.id },
          user.name
        );
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        'Here\'s big list of Users',
        _react2.default.createElement(
          'ul',
          null,
          this.renderUsers()
        )
      );
    }
  }]);

  return UsersList;
}(_react.Component);

function mapStateToProps(state) {
  return { users: state.users };
}

// The Store is being used here!
// This is ONLY FOR THE SERVER SIDE RENDER
// I am Calling Store.Dispatch Directly
function loadData(store) {
  console.log("UserList says: I'm trying to load some data");
  return store.dispatch((0, _actions.fetchUsers)());
}

// Named Export
//export { loadData };

//Regular Reduxe Call
//mapStateToProps
//export default connect(mapStateToProps, { fetchUsers })(UsersList);

// Refactoring to Export as Component
exports.default = {
  loadData: loadData,
  component: (0, _reactRedux.connect)(mapStateToProps, { fetchUsers: _actions.fetchUsers })(UsersList)
};

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("serialize-javascript");

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = require("express-http-proxy");

/***/ })
/******/ ]);