// FRONT-END: elios_FE/src/services/api.js
import http from "./http";

const API = {
  auth: {
    login: (data) => http.post("/auth/login", data),
    register: (data) => http.post("/auth/register", data),
  },
  cv: {
    generate: (data) => http.post("/cv/generate", data),
    list: () => http.get("/cv/list"),
  },
};

export default API;
