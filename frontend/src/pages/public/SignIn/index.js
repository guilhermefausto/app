import React from 'react';
import {Button, Form, Container, Row, Col} from 'react-bootstrap';
import Logo from '../../../assets/logo.png'
import {BoxContent, BoxForm} from '../../../shared/styles';
import {Link, withRouter} from 'react-router-dom';
import AccountsServices from '../../../services/accounts'
import {login} from '../../../services/auth';


class SignIn extends React.Component{

    state = {
        email: '',
        password: '',
        error: ''
    }

    handleSignIn = async (event) => {
        event.preventDefault();

        const {email, password, error} = this.state;

        if(!email || !password){
            this.setState({error: "Informe todos os campos para fazer login"})
        }
        else{
            try {
                const service = new AccountsServices();
                const response = await service.login(email, password)
                login(response.data.token)
                this.props.history.push('/');
            } catch (error) {
                console.log(error);
                this.setState({error: "Ocorreu um erro durante a tentativa de login"});
            }        
        }
    }

    render (){
        return(
            <Container>
                <Row className="justify-content-md-center">
                    <Col xs={12} md={6}>
                        <BoxContent>
                            <img src={Logo} alt='MailShrimp'/>
                        </BoxContent>
                            
                        <BoxForm>    
                            <h2>Login</h2>
                            <p>Informe seus dados para autenticar:</p>

                            <Form onSubmit={this.handleSignIn}>
                                <Form.Group controlId="emailGroup">
                                    <Form.Label>E-mail:</Form.Label>
                                    <Form.Control 
                                    type="email"
                                    placeholder="Digite seu e-mail"
                                    onChange={e => this.setState({email: e.target.value})}
                                    />
                                </Form.Group>

                                <Form.Group controlId="passwordGroup">
                                    <Form.Label>Senha:</Form.Label>
                                    <Form.Control 
                                    type="password"
                                    placeholder="Digite sua senha"
                                    onChange={e => this.setState({password: e.target.value})}
                                    />
                                </Form.Group>
                                
                                {/*Mudança no Boostrap 5 que substitui o block do button, para colocar o botão na largura do container*/}
                                <div className="d-grid gap-2">
                                    <Button variant="secondary" type="submit">
                                        Fazer login
                                    </Button>
                                </div>
                            </Form>
                        </BoxForm>
                        <BoxContent>
                            <p>Novo na plataforma?</p>
                            <Link className="button" to="/signup">Crie sua conta agora</Link>
                        </BoxContent>
                    </Col>
                </Row>
            </Container>
        )
    }

}

export default withRouter(SignIn);