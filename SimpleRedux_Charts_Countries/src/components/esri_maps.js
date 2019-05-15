import { loadModules } from 'esri-loader';

// if the API hasn't already been loaded (i.e. the frist time this is run)
// loadModules() will call loadScript() and pass these options, which,
// in this case are only needed b/c we're using v3.x instead of the latest 4.x
const options = { version: '4.11' };
window.dojoConfig = {
  async: true,
  packages: [
    {
      name: "react",
      location: "https://unpkg.com/react@16/umd/",
      main: "react.production.min"
    },
    {
      name: "react-dom",
      location: "https://unpkg.com/react-dom@16/umd/",
      main: "react-dom.production.min"
    }
  ]
};

// first, we use Dojo's loader to require the map class
loadModules([ 
"react",
"react-dom",
"esri/Map",
"esri/views/MapView",
"esri/core/watchUtils",
"esri/widgets/Zoom/ZoomViewModel"])
  .then(([React, ReactDOM, Map, MapView, watchUtils, ZoomViewModel],
    options) => {
    // then we load a web map from an id
    // var webmap = new WebMap({
    //   portalItem: { // autocasts as new PortalItem()
    //     id: 'f2e9b762544945f390ca4ac3671cfa72'
    //   }
    // });
    // and we show that map in a container w/ id #viewDiv
    // var view = new MapView({
    //   map: webmap,
    //   container: 'viewDiv'
    // });

    const map = new Map({
          basemap: "topo"
        });
      
        const view = new MapView({
          container: "viewDiv",
          map: map,
          center: [-100.33, 25.69],
          zoom: 10,
          ui: {
            components: ["attribution"] // empty the UI, except for attribution
          }
        });


        
  class Zoom extends React.Component {
    state = {
      vm: new ZoomViewModel(),
      maxZoomed: false,
      minZoomed: false
    };

    componentDidMount() {
      this.props.view.when(this.onViewLoaded);
    }

    onViewLoaded = (view) => {
      this.state.vm.view = view;
      watchUtils.init(view, "zoom", this.onZoomChange);
    };

    onZoomChange = (value) => {
      this.setState({
        maxZoomed: value === view.constraints.maxZoom,
        minZoomed: value === view.constraints.minZoom
      });
    };

    zoomIn = () => {
      if (!this.state.maxZoomed) {
        this.state.vm.zoomIn();
      }
    };

    zoomOut = () => {
      if (!this.state.minZoomed) {
        this.state.vm.zoomOut();
      }
    };

    render() {
      const maxstate = this.state.maxZoomed
        ? "button circle raised disable"
        : "button circle raised";
      const minstate = this.state.minZoomed
        ? "button circle raised disable"
        : "button circle raised";
      return (
        <div className="zoom-btns">
          <div className={maxstate} onClick={this.zoomIn}>
            <div className="center">
              <i className="material-icons">add</i>
            </div>
          </div>
          <div className={minstate} onClick={this.zoomOut}>
            <div className="center">
              <i className="material-icons">remove</i>
            </div>
          </div>
        </div>
      );
    }
  }
    const node = document.createElement("div");
    view.ui.add(node, "bottom-left");
    ReactDOM.render(<Zoom view={view} />, node);
  })
  .catch(err => {
    // handle any errors
    console.error(err);
  });

// require([
//   "react",
//   "react-dom",
//   "esri/Map",
//   "esri/views/MapView",
//   "esri/core/watchUtils",
//   "esri/widgets/Zoom/ZoomViewModel"
// ], function(React, ReactDOM, Map, MapView, watchUtils, ZoomViewModel) {
//   const map = new Map({
//     basemap: "topo"
//   });

//   const view = new MapView({
//     container: "viewDiv",
//     map: map,
//     center: [-100.33, 25.69],
//     zoom: 10,
//     ui: {
//       components: ["attribution"] // empty the UI, except for attribution
//     }
//   });

//   class Zoom extends React.Component {
//     state = {
//       vm: new ZoomViewModel(),
//       maxZoomed: false,
//       minZoomed: false
//     };

//     componentDidMount() {
//       this.props.view.when(this.onViewLoaded);
//     }

//     onViewLoaded = (view) => {
//       this.state.vm.view = view;
//       watchUtils.init(view, "zoom", this.onZoomChange);
//     };

//     onZoomChange = (value) => {
//       this.setState({
//         maxZoomed: value === view.constraints.maxZoom,
//         minZoomed: value === view.constraints.minZoom
//       });
//     };

//     zoomIn = () => {
//       if (!this.state.maxZoomed) {
//         this.state.vm.zoomIn();
//       }
//     };

//     zoomOut = () => {
//       if (!this.state.minZoomed) {
//         this.state.vm.zoomOut();
//       }
//     };

//     render() {
//       const maxstate = this.state.maxZoomed
//         ? "button circle raised disable"
//         : "button circle raised";
//       const minstate = this.state.minZoomed
//         ? "button circle raised disable"
//         : "button circle raised";
//       return (
//         <div className="zoom-btns">
//           <div className={maxstate} onClick={this.zoomIn}>
//             <div className="center">
//               <i className="material-icons">add</i>
//             </div>
//           </div>
//           <div className={minstate} onClick={this.zoomOut}>
//             <div className="center">
//               <i className="material-icons">remove</i>
//             </div>
//           </div>
//         </div>
//       );
//     }
//   }
//   const node = document.createElement("div");
//   view.ui.add(node, "bottom-left");
//   ReactDOM.render(<Zoom view={view} />, node);
// });