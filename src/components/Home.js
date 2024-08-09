import React, { useState, useRef, useEffect } from "react";

import { Navigate } from "react-router-dom"
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import "bootstrap-icons/font/bootstrap-icons.css";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { Badge, Nav, Table } from "react-bootstrap";

const Home = () => {

  const user = AuthService.getCurrentUser();

  const [users, setUsers] = useState([user]);
  const [showAdminBoard, setShowAdminBoard] = useState(false);


  useEffect(() => {
    if (user) {
      const roles = JSON.parse(user.roles);
      setShowAdminBoard(roles.includes("ROLE_ADMIN"));
    }
    UserService.getPublicContent().then(
      (response) => {
        setUsers(response.data);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        //setUsers(_content);
      }
    );
  }, []);

  if (!user) {
    return <Navigate to="/login" />
  }
  return (
    <>
      <div className="container">
        <header className="jumbotron">
          <h3>Liste des utilisateurs</h3>
          <div className="my-3">
            {(showAdminBoard) &&
              (<Button variant="primary" size="sm">
                <Nav.Link href={"/register"} className="text-light">Ajouter utilisateur</Nav.Link>
              </Button>)}
          </div>
        </header>
        <LstUsers users={users} />
      </div>
    </>
  );
};

const LstBtnRole = function ({ roles, removeBtn, lstRoles }) {

  const lstRole = [];
  for (let role of roles) {
    lstRole.push(
      <span key={role} className="me-3">
        <Button variant="info" disabled>
          {role}
        </Button>
        <Badge bg="danger" pill className="btn ms-2" onClick={(e) => removeBtn(e, { role, lstRoles })}><i className="bi bi-x-lg"></i></Badge>
      </span>
    );
  }
  return lstRole;
}


function LstUsers({ users }) {
  const lstUser = [];
  for (let user of users) {
    lstUser.push(<Row val={user.id} user={user} key={user.id} />)
  }

  return (
    <>
      <Table className="table table-striped overflow-scroll" responsive>
        <thead>
          <tr>
            <th>Id</th>
            <th>Username</th>
            <th>Phone</th>
            <th>Roles</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {lstUser}
        </tbody>
      </Table>
    </>
  )
}

const ModalUpdate = function ({ roles, lstRoles, username, phone, showModal,
  handleClose, handleSaveModal,
  updateUsername, onUpdatePhone,
  onUpdateRole, removeBtn, lstOptions }) {

  const form = useRef();

  const reload = () => window.location.reload();
  return (
    <Modal show={showModal} onHide={handleClose} onExited={reload}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Modification utilisateur</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSaveModal} ref={form} id="form-modal">
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" value={username} onChange={updateUsername} name="username" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control type="text" value={phone} onChange={onUpdatePhone} name="phone" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicRole">
            <Form.Label>Rôles</Form.Label>
            <Form.Select onChange={(e) => onUpdateRole(e, { lstRoles })}>
              {lstOptions}
            </Form.Select>
            <div className="mt-3">
              <LstBtnRole roles={roles} removeBtn={removeBtn} lstRoles={lstRoles} />
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
        <Button variant="primary" form="form-modal" type="submit" >
          Enregistrer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


function Row({ user, val }) {
  const [show, setShow] = useState(false);
  let userRoles = JSON.parse(user.roles);
  const [roles, setRoles] = useState(userRoles);
  const nativeRoles = ['ROLE_ADMIN', 'ROLE_GUEST'];
  const newLstroles = nativeRoles.filter(r => !userRoles.includes(r))
  const [lstroles, setLstroles] = useState(newLstroles);
  const [lstopts, setLstopts] = useState("")
  const [username, setUsername] = useState(user.username);
  const [phone, setPhone] = useState(user.phone);
  const [showAdminBoard, setShowAdminBoard] = useState(false);

  const updateUser = ({ user }) => () => {
    setShow(true)
  }
  const handleClose = () => setShow(false);
  const handleSaveModal = (e) => {
    e.preventDefault();
    var data = new FormData(e.target);
    var dataObject = Object.fromEntries(data);
    dataObject.roles = JSON.stringify(roles)
    UserService.updateUser(user.id, dataObject).then(
      (res) => {
        console.log(res.data)
      },
      (err) => {
        console.log(err)
      });
    setShow(false);
  };

  const onUpdateRole = (e, { lstRoles }) => {
    let newRole = e.target.value;
    let newLstroles = lstRoles.filter((r) => r !== newRole);
    roles.push(newRole);
    const opts = getOptions(roles, lstRoles);
    setLstopts(opts)
    setLstroles(newLstroles);
    setRoles(roles);
  }

  const onUpdateUsername = (e) => {
    var username = e.target.value;
    setUsername(username);
  }

  const onUpdatePhone = (e) => {
    var phone = e.target.value;
    setPhone(phone);
  }

  const removeBtn = function (e, { role, lstRoles }) {
    e.target.parentElement.remove();
    lstRoles.push(role);
    setLstroles(lstRoles);
    const newRole = roles.filter((r) => r !== role);
    setRoles(newRole);
  }

  function deleteUser(e, { user }) {
    let users = JSON.parse(localStorage.getItem('users'));
    users = users.filter(u => u.username != user.username);
    localStorage.setItem('users', JSON.stringify(users));
    e.target.parentElement.parentElement.parentElement.remove()
  }

  const getOptions = function (roles, lstRoles) {
    const lstOpt = [<option key="" value="">--Ajouter Role--</option>];
    let filteredRoles = lstRoles.filter(o => !(roles.includes(o)));
    for (let role of filteredRoles) {
      lstOpt.push(<option key={role} value={role}>{role}</option>)
    }
    return (
      <>
        {lstOpt}
      </>
    );
  }
  useEffect(() => {
    const opts = getOptions(roles, lstroles);
    setLstopts(opts);
  }, [lstroles, roles]);

  const connectedUser = AuthService.getCurrentUser();
  useEffect(() => {
    if (connectedUser) {
      const roles = JSON.parse(connectedUser.roles);
      setShowAdminBoard(roles.includes("ROLE_ADMIN"));
    }
  }, []);


  return (
    <>
      {(showAdminBoard || connectedUser.id === user.id) &&
        (<tr key={val}>
          <td>{user.id}</td>
          <td>{user.username}</td>
          <td>{user.phone}</td>
          <td>{JSON.parse(user.roles)}</td>
          {(showAdminBoard) && (<td>
            <button onClick={updateUser({ user })} className="btn" title="mettre à jour"><i className="bi bi-pencil-square"></i></button>
            <button onClick={(e) => deleteUser(e, { user })} className="btn" title="supprimer"><i className="bi bi-trash"></i></button>
          </td>)}
        </tr>
        )}
      <ModalUpdate roles={roles} username={username} phone={phone}
        showModal={show} onUpdatePhone={onUpdatePhone}
        handleClose={handleClose} updateUsername={onUpdateUsername}
        handleSaveModal={handleSaveModal} onUpdateRole={onUpdateRole}
        removeBtn={removeBtn} lstOptions={lstopts} lstRoles={lstroles}
      />
    </>

  )
}

export default Home;
