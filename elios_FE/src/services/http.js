// FRONT-END: elios_FE/src/services/http.js
import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export default http;
