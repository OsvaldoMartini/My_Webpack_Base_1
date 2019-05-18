import React from "react";
import { render } from "react-dom";

const CSS = {
  base: "top-nave fade-in",
  title: "top-nav-title margin-left-1",
  titlePhoneHide: "phone-hide"
};

export const Header = props => {
  return (
    <div>
      <header className={CSS.base}>
        <span className={CSS.title}>
          ArcGIS<span className={CSS.titlePhoneHide}>{props.appName}</span>
        </span>
      </header>
    </div>
  );
};
