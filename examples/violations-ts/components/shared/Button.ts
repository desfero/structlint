import { TxSuccessModal } from "../TxSuccessModal";
import { Link } from "./Link";

type TButtonExternalProps = {
  href?: string;
};

const Button = (props: TButtonExternalProps) => {
  if (props.href) {
    return Link;
  }

  return "button";
};

export { Button };
