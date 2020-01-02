import { TxModal } from "../../components/TxModal";
import { TxSuccessModal } from "../../components/TxSuccessModal";
import {showModal} from "../utils";

function transactionsSagas() {
    showModal(TxModal);

    // ...

    showModal(TxSuccessModal);
}

export { transactionsSagas };
