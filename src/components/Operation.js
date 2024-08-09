import React, { useEffect, useState } from "react";
import Form from 'react-bootstrap/Form';
import * as formik from 'formik';
import * as yup from 'yup';
import { Alert, Button, Card, Modal, Table } from "react-bootstrap";
import UserService from "../services/user.service";
import OperationService from "../services/operation.service";
import AuthService from "../services/auth.service";

const Operation = (props) => {
  const { Formik } = formik;
  var savedOperations = localStorage.getItem('operations') === null ? [] :
    JSON.parse(localStorage.getItem('operations'));

  const [message, setMessage] = useState("");
  const [ume, setUme] = useState(0);
  const [operations, setOperations] = useState(savedOperations);
  const [variant, setVariant] = useState("success");

  const signupSchema = yup.object().shape({
    type: yup.number().required("Il faut choisir un type"),
    montant: yup.number().min(200, "Le montant doit être supérieur à 200"),
    statut: yup.string().required("Il faut choisir un statut"),
  });

  useEffect(() => {
    let currentUser = AuthService.getCurrentUser();
    if (savedOperations.length === 0 || operations.length === 0) {
      UserService.getMontantInitial(currentUser.id).then(
        (res) => {
          setUme(res.data.montant);
          localStorage.setItem('initial-montant', res.data.montant);
        },
        (err) => {
          console.log(err)
        }
      );
    } else {
      const tabId = operations.map(op => op.id);
      const opMax = operations.filter(op => op.id === Math.max(...tabId));
      setUme(opMax[0].ume);
    }
  }, [operations, savedOperations.length]);

  const handleOperation = (values, { resetForm }) => {
    let maxId = 0;
    if (operations.length === 1) {
      maxId = operations[0].id;
    } else if (operations.length > 1) {
      for (let op of operations) {
        maxId = maxId > op.id ? maxId : op.id;
      }
    }
    maxId++;
    values.id = maxId;
    const newUme = OperationService.getUme(values.type, parseFloat(ume), parseFloat(values.montant));
    setUme(newUme);
    values.ume = newUme;
    var mDate = new Date();

    values.created_at = mDate.getFullYear() + '-' + (mDate.getMonth() + 1) +
      '-' + mDate.getDate() + ' ' + mDate.getHours() + ':' +
      mDate.getMinutes() + ':' + mDate.getSeconds();
    let arr = [...operations, values];
    setOperations(arr);
    localStorage.setItem('operations', JSON.stringify(arr));
    resetForm();
  };

  const handleSend = async (e) => {
    e.preventDefault()
    const response = await OperationService.handleSendOperation();
    if (response.statut === 'error') {
      setMessage(response.message);
      setVariant('danger');
    } else {
      setMessage(response.message);
      setVariant('success');
      localStorage.removeItem('operations');
      window.location.reload();
    }
  }

  return (
    <Formik
      validationSchema={signupSchema}
      onSubmit={handleOperation}
      initialValues={{
        type: "",
        montant: 0,
        statut: ""
      }}
      resetForm
    >
      {({ values, handleSubmit, handleChange, errors }) => (
        <Card xs={6}>
          <Card.Header as="h4">Opération</Card.Header>
          <Card.Body>
            <Form noValidate onSubmit={handleSubmit} id="form-operation">
              <Form.Group className="mb-3" controlId="type">
                <Form.Label>Type d'opération</Form.Label>
                <Form.Select
                  value={values.type}
                  onChange={handleChange}
                  name="type"
                  isInvalid={!!errors.type}
                >
                  <option value="">--Choisir une opération--</option>
                  <option value="1">Dépôt/Crédit</option>
                  <option value="2">Retrait</option>
                  <option value="3">Débit</option>
                  <option value="4">Takalo</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.type}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="montant">
                <Form.Label>Montant</Form.Label>
                <Form.Control
                  type="number"
                  step="100"
                  value={values.montant}
                  name="montant"
                  onChange={handleChange}
                  isInvalid={!!errors.montant}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.montant}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="statut">
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={values.statut}
                  onChange={handleChange}
                  name="statut"
                  isInvalid={!!errors.statut}
                >
                  <option value="">--Choisir le statut--</option>
                  <option value="en attente">En attente</option>
                  <option value="en cours">En cours</option>
                  <option value="terminé">Terminé</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.statut}
                </Form.Control.Feedback>
              </Form.Group>
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
            </Form>
            {operations.length !== 0 && (
              <div className="container">
                <LstOperation operations={operations} key={Math.random()} />
                <Button variant="secondary" onClick={handleSend}>Valider et Envoyer</Button>
              </div>
            )}
            {message && (
              <Alert key={variant} variant={variant}>
                {message}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </Formik>
  );
};

function LstOperation({ operations }) {
  const lstOperation = [];
  if (operations.length > 1) {
    operations.sort(function (a, b) {
      return a.created_at - b.created_at;
    })
  }
  let i = 0;
  for (const operation of operations) {
    ++i;
    lstOperation.push(<Row operation={operation} val={i} key={i} />)
  }
  return (

    <Table className="table table-striped overflow-scroll" id="table-operation" responsive>
      <thead>
        <tr>
          <td>Ordre</td>
          <td>Type Opération</td>
          <td>Montant</td>
          <td>Statut</td>
          <td>UME</td>
          <td>Action</td>
        </tr>
      </thead>
      <tbody>
        {lstOperation}
      </tbody>
    </Table>
  );
}

const ModalUpdate = function ({ operation, showModal, handleClose,
  handleSaveModal }) {
  const { Formik } = formik;

  const signupSchema = yup.object().shape({
    type: yup.number().required("Il faut choisir un type"),
    montant: yup.number().min(200, "Le montant doit être supérieur à 200"),
    statut: yup.string().required("Il faut choisir un statut"),
  });

  return (
    <Formik
      validationSchema={signupSchema}
      onSubmit={(values) => handleSaveModal(values, { operation })}
      initialValues={{
        type: operation.type,
        montant: operation.montant,
        statut: operation.statut
      }}
      resetForm
    >
      {({ values, handleSubmit, handleChange, errors }) => (
        <Modal show={showModal} onHide={handleClose}>
          <Form onSubmit={handleSubmit} id="form-modal">
            <Modal.Header closeButton={true}>
              <Modal.Title>Modification Opération</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Type opération</Form.Label>
                <Form.Select
                  value={values.type}
                  name="type"
                  onChange={handleChange}
                  isInvalid={!!errors.type}
                >
                  <option value="">--Choisir une opération--</option>
                  <option value="1">Dépôt/Crédit</option>
                  <option value="2">Retrait</option>
                  <option value="3">Débit</option>
                  <option value="4">Takalo</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.type}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPhone">
                <Form.Label>Montant</Form.Label>
                <Form.Control
                  type="number"
                  step="100"
                  value={values.montant}
                  name="montant"
                  onChange={handleChange}
                  isInvalid={!!errors.montant}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.montant}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicRole">
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={values.statut}
                  onChange={handleChange}
                  name="statut"
                  isInvalid={!!errors.statut}
                >
                  <option value="">--Choisir le statut--</option>
                  <option value="en attente">En attente</option>
                  <option value="en cours">En cours</option>
                  <option value="terminé">Terminé</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.statut}
                </Form.Control.Feedback>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Fermer
              </Button>
              <Button variant="primary" type="submit" >
                Enregistrer
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Formik>
  );
}

function Row({ operation, val }) {
  const [show, setShow] = useState(false);

  let type_operation = "";
  switch (operation.type) {
    case "1":
      type_operation = "Dépôt/Crédit";
      break;
    case "2":
      type_operation = "Retrait";
      break;
    case "3":
      type_operation = "Débit";
      break;
    case "4":
      type_operation = "Takalo";
      break;
  }
  const updateOperation = ({ operation }) => () => {
    setShow(true)
  }

  function deleteOperation(e, { operation }) {
    let operations = JSON.parse(localStorage.getItem('operations'));
    if (operations.length !== 1) {
      operations = operations.filter(u => u.id !== operation.id);
      operations = OperationService.reorderId(operations);
      operations = OperationService.recalculateUme(operations, operation);
    } else {
      operations = [];
      document.getElementById('table-operation').remove();
    }
    localStorage.setItem('operations', JSON.stringify(operations));
    e.target.parentElement.parentElement.parentElement.remove();
    window.location.reload();
  }
  const handleClose = () => setShow(false);
  const handleSaveModal = (values, { operation }) => {
    console.log(values, operation);
    values.id = operation.id;
    values.created_at = operation.created_at;
    values.ume = operation.ume;
    let operations = JSON.parse(localStorage.getItem('operations'));
    operations = operations.filter((o) => o.id !== values.id);
    operations = OperationService.recalculateUme([...operations, values], operation);
    localStorage.setItem('operations', JSON.stringify(operations));
    window.location.reload();
    setShow(false);
  };
  return (
    <>
      <tr key={val}>
        <td>{val}</td>
        <td>{type_operation}</td>
        <td>{operation.montant}</td>
        <td>{operation.statut}</td>
        <td>{operation.ume}</td>
        <td>
          <button onClick={updateOperation({ operation })} className="btn" title="mettre à jour"><i className="bi bi-pencil-square"></i></button>
          <button onClick={(e) => deleteOperation(e, { operation })} className="btn" title="supprimer"><i className="bi bi-trash"></i></button>
        </td>
      </tr>
      <ModalUpdate
        operation={operation} handleSaveModal={handleSaveModal}
        showModal={show} handleClose={handleClose}
      />
    </>
  );
}

export default Operation;
