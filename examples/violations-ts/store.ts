import * as React from "react";

const createStore = async () => {
  const { fetch } = await import("./lib/fetch");

  console.log("Creating redux store");

  fetch("google.com");
};
