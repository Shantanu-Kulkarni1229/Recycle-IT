import axios from "axios";

const api = axios.create({
  baseURL: "http://10.197.110.46:5000/api/", // your laptop LAN IP
  withCredentials: true,
});

export default api;
