import * as React from "react";

const createStore = async () => {
  const { fetch } = await import("./lib");

  console.log("Creating redux store");

  fetch("google.com");
};
