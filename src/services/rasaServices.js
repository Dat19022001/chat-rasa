import {
    postRequest,
  } from "../api/apiCaller";
 
  export const sentMessage = async (params, successCallback, errorCallback) => {
    await postRequest("http://192.168.8.19:5005/webhooks/rest/webhook", params, successCallback, errorCallback);
  };
 