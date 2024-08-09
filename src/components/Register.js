import React, { useState } from "react";
import Form from 'react-bootstrap/Form';

import { Alert, Button, Card } from "react-bootstrap";
import * as formik from 'formik';
import * as yup from 'yup';
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";

const Register = (props) => {

  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");
  const navigate = useNavigate();

  const { Formik } = formik;

  const signupSchema = yup.object().shape({
    username: yup.string().required('Remplir le champ username'),
    email: yup.string().required('Champ obligatoire').email('email non valide'),
    password: yup.string().required('Ce champ est obligatoire').min(6, 'Doit être plus de 5 caractères'),
    phone: yup.string().required('Remplir le champ téléphone'),
  });
  const handleRegister = (values) => {
    AuthService.register(values).then(
      (response) => {
        setMessage(response.data.message);
        setVariant("success");
        navigate("/home");
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setMessage(resMessage);
        setVariant("danger")
      }
    );

  };

  return (
    <Formik
      validationSchema={signupSchema}
      onSubmit={handleRegister}
      initialValues={{
        username: "",
        email: "",
        phone: "",
        password: "",
      }}
    >
      {({ values, handleSubmit, handleChange, errors }) => (
        <Card xs={6}>
          <Card.Header as="h4">Création utilisateur</Card.Header>
          <Card.Body>
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Nom d'utilisateur</Form.Label>
                <Form.Control
                  type="text" value={values.username}
                  name="username"
                  onChange={handleChange}
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="text" value={values.email}
                  name="email"
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="phone">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text" value={values.phone}
                  name="phone"
                  onChange={handleChange}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control type="password" value={values.password}
                  name="password"
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
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
      )}
    </Formik>
  );
};

export default Register;
