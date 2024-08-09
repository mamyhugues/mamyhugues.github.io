import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AuthService from "./services/auth.service";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import BoardUser from "./components/BoardUser";
import Operation from "./components/Operation";
import MontantInitial from "./components/MontantInitial";
import BoardAdmin from "./components/BoardAdmin";

// import AuthVerify from "./common/AuthVerify";
import EventBus from "./common/EventBus";

const App = () => {
  const [showModeratorBoard, setShowModeratorBoard] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
      const roles = JSON.parse(user.roles);
      setShowModeratorBoard(roles.includes("ROLE_GUEST") || roles.includes("ROLE_ADMIN"));
      setShowAdminBoard(roles.includes("ROLE_ADMIN"));
    }

    EventBus.on("logout", () => {
      logOut();
    });

    return () => {
      EventBus.remove("logout");
    };
  }, []);

  const logOut = () => {
    AuthService.logout();
    setShowModeratorBoard(false);
    setShowAdminBoard(false);
    setCurrentUser(undefined);
  };

  return (
    <>
      <Navbar expand="lg" bg="primary" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href={"/"} className="text-light">MyApp</Navbar.Brand>
          <Nav className="me-auto d-flex flex-row">
            {showModeratorBoard && (
              <Nav.Link href={"/operation"} className="text-light" style={{marginRight:'10px'}}>Opération</Nav.Link>
            )}
            {showAdminBoard && (
              <NavDropdown title="Admin" style={{color:'#fff'}} drop="end">
                <NavDropdown.Item href={"/admin/initialize-montant"}>Réinitialisez Montant</NavDropdown.Item>
                <NavDropdown.Item href={"/admin/download-excel"}>Télécharger l'opération</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Navbar.Toggle id="toggle-two" color="white" />
          <Navbar.Collapse className="justify-content-end">
            {currentUser ? (
              <Nav>
                <Nav.Link href={"/profile"} className="text-light">{currentUser.username}</Nav.Link>
                <Nav.Link href={"/login"} onClick={logOut} className="text-light">Deconnecter</Nav.Link>
              </Nav>) : (
              <Nav>
                <Nav.Link href={"/login"} className="text-light">Connecter</Nav.Link>
                <Nav.Link href={"/register"} className="text-light">Enregistrer</Nav.Link>
              </Nav>)
            }
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="container mt-3">
        <Routes>
          <Route exact path={"/"} element={<Home />} />
          <Route exact path={"/home"} element={<Home />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/profile" element={<Profile />} />
          <Route path="/user" element={<BoardUser />} />
          <Route path="/operation" element={<Operation />} />
          <Route path="/admin/initialize-montant" element={<MontantInitial />} />
          <Route path="/admin/download-excel" element={<BoardAdmin />} />
        </Routes>
      </div>

      {/* <AuthVerify logOut={logOut}/> */}
    </>
  );
};

export default App;
