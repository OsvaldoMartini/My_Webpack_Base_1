import { watchUtils } from "esri/core/watchUtils";
import ZoomViewModel from "esri/widgets/Zoom/ZoomViewModel";
import React from "react";

class ZoomInOut extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maxZoomed: false,
      minZoomed: false
    };
  }

  componentDidMount() {
    this.state = {
      vm: new ZoomViewModel(),
      maxZoomed: false,
      minZoomed: false
    };
    this.props.view.when(this.onViewLoaded);
  }

  onViewLoaded(view) {
    this.state.vm.view = view;
    watchUtils.init(view, "zoom", this.onZoomChange);
  }

  onZoomChange(value) {
    this.setState({
      maxZoomed: value === view.constraints.maxZoom,
      minZoomed: value === view.constraints.minZoom
    });
  }

  zoomIn() {
    if (!this.state.maxZoomed) {
      this.state.vm.zoomIn();
    }
  }

  zoomOut() {
    if (!this.state.minZoomed) {
      this.state.vm.zoomOut();
    }
  }

  render() {
    console.log("object");
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

// const node = document.createElement("div");
// view.ui.add(node, "bottom-left");
// ReactDOM.render(<Zoom view={view} />, node);

// export class ZoomView extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       vm: null,
//       maxZoomed: false,
//       minZoomed: false
//     };
//   }

//   componentDidMount() {
//     this.setState({ vm: new ZoomViewModel() });

//     watchUtils(this, "view").then(this.onload.bind(this));

//     this.props.view.when(this.onViewLoaded);
//   }

//   onViewLoaded(view) {
//     this.state.vm.view = view;
//     watchUtils.init(view, "zoom", this.onZoomChange);
//   }

//   onZoomChange(value) {
//     this.setState({
//       maxZoomed: value === view.constraints.maxZoom,
//       minZoomed: value === view.constraints.minZoom
//     });
//   }

//   zoomIn() {
//     if (!this.state.maxZoomed) {
//       this.state.vm.zoomIn();
//     }
//   }

//   zoomOut() {
//     if (!this.state.minZoomed) {
//       this.state.vm.zoomOut();
//     }
//   }

//   render() {
//     const maxstate = this.state.maxZoomed
//       ? "button circle raised disable"
//       : "button circle raised";
//     const minstate = this.state.minZoomed
//       ? "button circle raised disable"
//       : "button circle raised";
//     return (
//       <div className="zoom-btns">
//         <div className={maxstate} onClick={this.zoomIn}>
//           <div className="center">
//             <i className="material-icons">add</i>
//           </div>
//         </div>
//         <div className={minstate} onClick={this.zoomOut}>
//           <div className="center">
//             <i className="material-icons">remove</i>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }
export default ZoomInOut;
