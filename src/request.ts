import axios from "axios";
import * as vscode from "vscode";

const instance = axios.create({
  timeout: 3000,
});

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    vscode.window.showErrorMessage("接口请求异常", error.message);
    return Promise.reject(error);
  }
);

export default instance;
