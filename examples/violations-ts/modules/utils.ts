import * as React from "react";

export const showModal = modal => {
  if (!React.isValidElement(modal)) {
    throw new Error("Invalid element");
  }

  console.log(modal);
};
