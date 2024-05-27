import React, { useState, useEffect } from "react";

import { Navigate } from "react-router-dom"
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";

const Home = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    UserService.getPublicContent().then(
      (response) => {
        setUsers(response.data);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        setUsers(_content);
      }
    );
  }, []);
  const user = AuthService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="container">
      <header className="jumbotron">
        Liste des utilisateurs
      </header>
      <LstUsers users={users} />
    </div>
  );
};


function LstUsers({ users }) {
  const lstUser = [];
  for (let user of users) {
    lstUser.push(<Row key={user.id} user={user} />)
  }

  return <table className="form-table table">
    <thead>
      <tr>
        <th>Id</th>
        <th>Username</th>
        <th>Roles</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {lstUser}
    </tbody>
  </table>
}

function Row({ user }) {
  return (
    <tr key={user.key}><td>{user.id}</td><td>{user.username}</td><td>{JSON.parse(user.roles)}</td><td></td></tr>
  )
}

export default Home;
