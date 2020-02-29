import { includes } from "lodash";

import { API_URL } from "../config/constants";
import { _fetch } from "../config/internal";
import { add } from "../modules/utils";

class HttpService {
  apiUrl = API_URL;

  send() {
    return _fetch(add(this.apiUrl, "v1"));
  }
}

export { HttpService };
