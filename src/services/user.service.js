import api from "../common/Api";

const API_URL = "http://localhost:8000/api/";

const getPublicContent = () => {
  return api.get(API_URL + "all");
};

const updateUser = (user_id, rawData) => {
  return api.post(API_URL + "update", {
    user_id,
    rawData
  });
}

const getUserBoard = () => {
  return api.get(API_URL + "user");
};

const getModeratorBoard = () => {
  return api.get(API_URL + "mod");
};

const getAdminBoard = () => {
  return api.get(API_URL + "admin");
};

const getMontantInitial = (userId) => {
  return api.get(API_URL + "montant-initial/" + userId);
}

const setMontantInitial = (rawData) => {
  return api.post(API_URL + "montant-initial", {
    rawData
  });
}

const UserService = {
  getPublicContent,
  getUserBoard,
  getModeratorBoard,
  getAdminBoard,
  updateUser,
  getMontantInitial,
  setMontantInitial,
}

export default UserService;
