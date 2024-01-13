import axios from "axios";



axios.interceptors.request.use((config) => {
//   const token = getToken();
//   // const tokenType = getTokenType();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

  config.headers["Access-Control-Allow-Origin"] = "*";
  config.headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, OPTIONS, DELETE";
  config.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
  // config.headers["Access-Control-Max-Age"] = 1728000;
  config.headers["Content-Type"] = "application/json";
  return config;
});

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return new Promise((resolve, reject) => {
      // const originalReq = error.config;
      // if (
      //   error.response.status === 401 &&
      //   error.config &&
      //   !error.config.__isRetryRequest
      // ) {
      //   originalReq._retry = true;

      //   requestNewToken();
      // }
      return reject(error);
    });
  }
);


export const postRequest = async (
  url = "",
  params,
  successCallback,
  errorCallback,
  timeout
) => {
  return await axios
    .post(url, params)
    .then((response) => {
      if (successCallback) {
        try {
          successCallback(response);
        } catch (error) {
          console.log("error", error);
        }
      }
    })
    .catch((error) => {
      if (errorCallback)
        try {
          errorCallback(error);
        } finally {
          console.log(error);
        }
    });
};



