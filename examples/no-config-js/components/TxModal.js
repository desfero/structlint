import { isEmailValid } from "../modules/utils";

export const TxModal = ({ email }) => {
  if (!isEmailValid(email)) {
    return "invalid email modal";
  }

  return "modal";
};
