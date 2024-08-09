import axios from "axios";
import api from "../common/Api";

const API_URL = "http://localhost:8000/api/";

const register = (rawData) => {
  return axios.post(API_URL + "register", {
    rawData
  });
};

const operation = (name, montant, statut) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user.id;
  return api.post(API_URL + "operation", {
    name,
    montant,
    statut,
    user_id
  });
};

const login = (username, password) => {
  return axios
    .post(API_URL + "login", {
      username,
      password,
    })
    .then((response) => {
      if (response.data.data.username) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }

      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
  return axios.post(API_URL + "logout").then((response) => {
    return response.data;
  });
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const AuthService = {
  register,
  operation,
  login,
  logout,
  getCurrentUser,
}

export default AuthService;
