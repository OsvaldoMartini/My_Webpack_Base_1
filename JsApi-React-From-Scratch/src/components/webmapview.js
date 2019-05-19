import SceneView from "esri/views/SceneView";
import React from "react";
import { render } from "react-dom";
import ZoomInOut from "./ZoomView";

export class WebMapComponent extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   view: null
    // };
  }

  componentDidMount() {
    const view = new SceneView({
      map: this.props.webmap,
      container: this.mapDiv
    });

    this.props.onload(view);
    const node = document.createElement("div");
    view.ui.add(node, "bottom-left");
    render(<ZoomInOut view={view} maxZoomed={false} minZoomed={false} />, node);
  }

  render() {
    return <div className="webmap" ref={element => (this.mapDiv = element)} />;
  }
}
