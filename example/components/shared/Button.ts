import { TxSuccessModal } from "../TxSuccessModal";
import { Link } from "./Link";

export const Button = () => {
  if (Math.random() > 0.5) {
    return Link;
  }

  return TxSuccessModal;
};
