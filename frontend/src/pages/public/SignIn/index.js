import React from 'react';
import {Button, Form, Container, Row, Col} from 'react-bootstrap';
import Logo from '../../../assets/logo.png'

class SignIn extends React.Component{

    handleSignIn = async (event) => {
        event.preventDefault();
    }

    render (){
        return(
            <Container>
                <Row className="justify-content-md-center">
                    <Col xs={12} md={6}>
                        <div>
                            <img src={Logo} alt='MailShrimp'/>
                        </div>
                        <h2>Login</h2>
                        <p>Informe seus dados para autenticar:</p>

                        <Form onSubmit={this.handleSignIn}>
                            <Form.Group controlId="emailGroup">
                                <Form.Label>E-mail:</Form.Label>
                                <Form.Control 
                                type="email"
                                placeholder="Digite seu e-mail"
                                />
                            </Form.Group>

                            <Form.Group controlId="passwordGroup">
                                <Form.Label>Senha:</Form.Label>
                                <Form.Control 
                                type="password"
                                placeholder="Digite sua senha"
                                />
                            </Form.Group>

                            <Button variant="secondary" size="lg" block>
                                Fazer login
                            </Button>

                        </Form>
                    </Col>
                </Row>
            </Container>
        )
    }

}

export default SignIn;