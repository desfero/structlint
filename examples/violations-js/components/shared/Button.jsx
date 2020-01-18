import React from "react";

import { TxSuccessModal } from "../TxSuccessModal";
import { Link } from "./Link";

const Button = props => {
  if (props.href) {
    return Link;
  }

  return <button onClick={props.onClick}>Click</button>;
};

export { TxSuccessModal, Button };
