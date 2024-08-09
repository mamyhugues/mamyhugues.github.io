import React, { useState, useEffect } from "react";
import * as formik from 'formik';
import * as yup from 'yup';
import { Alert, Button, Card, Form } from "react-bootstrap";
import UserService from "../services/user.service";

const MontantInitial = () => {
  const { Formik } = formik;
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");
  const signupSchema = yup.object().shape({
    utilisateur: yup.number().required("Il faut choisir un utilisateur"),
    montant: yup.number().min(200, "Le montant doit être supérieur à 200"),
  });
  useEffect(() => {
    UserService.getPublicContent().then(
      (response) => {
        setUsers(response.data);
        setMessage(response.data.message)
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        setMessage(_content);
      }
    );
  }, []);


  const handleMontantInitial = (values) => {

    UserService.setMontantInitial(values).then(
      (response) => {
        setMessage(response.data.message);
        setVariant("success");
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessage(resMessage);
        setVariant("danger");
      }
    );
    /*  var data = new FormData(e.target);
     var dataObject = Object.fromEntries(data);
     let newMontant = [...montantInitial, dataObject];
     setMontantInitial(newMontant);
     localStorage.setItem('montant-initial', JSON.stringify(newMontant)); */
  };

  function LstOption({ users }) {
    const lstOption = [<option key={0} value="0">--Choisir une opération--</option>];
    for (let user of users) {
      lstOption.push(<option key={user.id} value={user.id}>{user.username}</option>)
    }
    return lstOption;
  }
  return (
    <Formik
      validationSchema={signupSchema}
      onSubmit={handleMontantInitial}
      initialValues={{
        utilisateur: "",
        montant: 0,
      }}
    >
      {({ values, handleSubmit, handleChange, errors }) => (

        <Card xs={6}>
          <Card.Header as="h4">Initialisation montant</Card.Header>
          <Card.Body>
            <Form noValidate onSubmit={handleSubmit} id="form-montant-initial">
              <Form.Group className="mb-3" controlId="type">
                <Form.Label>Opérateur</Form.Label>
                <Form.Select
                  value={values.utilisateur}
                  onChange={handleChange}
                  name="utilisateur"
                  isInvalid={!!errors.utilisateur}
                >
                  <LstOption users={users} />
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.utilisateur}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="montant">
                <Form.Label>Montant</Form.Label>
                <Form.Control
                  type="number"
                  step="100" value={values.montant}
                  name="montant"
                  onChange={handleChange}
                  isInvalid={!!errors.montant}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.montant}
                </Form.Control.Feedback>
              </Form.Group>
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
            </Form>
            {message && (
              <Alert key={variant} variant={variant}>
                {message}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )
      }
    </Formik>
  );
};

export default MontantInitial;