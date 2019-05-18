//import "@dojo/shim/Promise";
import "@dojo/framework/shim/Promise";
import "./config";

import FeatureLayer from "esri/layers/FeatureLayer";
import WebMap from "esri/WebMap";

import React from "react";
import { render } from "react-dom";

import { Header } from "./components/header";
import { WebMapComponent } from "./components/webmapview";

import "./css/main.scss";

const addDOMNode = () => {
  const appNode = document.createElement("div");
  appNode.id = "app";
  document.body.appendChild(appNode);
  //const rootElement = document.getElementById("root");
  return appNode;
};

const onComponentLoad = view => {
  featureLayer.when(() => {
    view.goTo({ target: featureLayer.fullExtent });
  });
};

const featureLayer = new FeatureLayer({
  id: "states",
  portalItem: {
    id: "234a118ab6b4c91908a1cf677941702"
  },
  outfields: ["NAME", "STATE_NAME", "VACANT", "HSE_UNITS"],
  title: "U.S. counties"
});

const webmap = new WebMap({
  portalItem: {
    id: "3ff64504498c4e9581a7a754412b6a9e"
  },
  layers: [featureLayer]
});

//const rootElement = document.getElementById("root");
//const rootElement = document.getElementById("root");
//render(<Header />, rootElement);
render(
  <div className="main">
    <Header appName="WebPack Esri Map" />
    <WebMapComponent webmap={webmap} onload={onComponentLoad} />
  </div>,
  addDOMNode()
);
