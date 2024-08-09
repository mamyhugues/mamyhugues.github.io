import React, { useState, useEffect } from "react";

import UserService from "../services/user.service";
import EventBus from "../common/EventBus";
import { Button } from "react-bootstrap";

const BoardUser = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    UserService.getUserBoard().then(
      (response) => {
        response.data.roles = JSON.parse(response.data.roles)
        setContent({...response.data });
      },
      (error) => {
        const _content =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setContent(_content);

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    );
  }, []);
  return (
    <div className="container">
      <header className="jumbotron">
        <h3>Liste des applications</h3>
      </header>
      <div>
        <Button variant="primary">Télécharger la fiche d'opération</Button>
      </div>
    </div>
  );
};

export default BoardUser;
