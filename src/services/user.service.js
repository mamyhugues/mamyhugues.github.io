import api from "../common/Api";

const API_URL = "http://localhost:8000/api/";

const getPublicContent = () => {
  return api.get(API_URL + "all");
};

const getUserBoard = () => {
  return api.get(API_URL + "user");
};

const getModeratorBoard = () => {
  return api.get(API_URL + "mod");
};

const getAdminBoard = () => {
  return api.get(API_URL + "admin");
};

const UserService = {
  getPublicContent,
  getUserBoard,
  getModeratorBoard,
  getAdminBoard,
}

export default UserService;
