import React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import "./app.global.css";
import App from "renderer/App";
import store from "./renderer/store";
import {Provider} from 'mobx-react'

render(
  <AppContainer>
    <Provider store={store}>
      <App/>
    </Provider>
  </AppContainer>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept("./renderer/App", () => {
    const AppNext = require("./renderer/App"); // eslint-disable-line global-require
    render(
      <AppContainer>
        <Provider store={store}>
          <AppNext/>
        </Provider>
      </AppContainer>,
      document.getElementById("root")
    );
  });
}
