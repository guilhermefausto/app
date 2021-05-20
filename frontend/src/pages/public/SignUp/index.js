import React from 'react';
import {
    Container,
    Button,
    Row,
    Col,
    Alert,
    Form,
    FormGroup,
    FormLabel,
    FormControl
} from 'react-bootstrap';
import { Link, withRouter} from 'react-router-dom';
import Logo from '../../../assets/logo.png';
import {BoxContent, BoxForm} from '../../../shared/styles';
import AccountsServices from '../../../services/accounts'

class SignUp extends React.Component{
    state = {
        name: '',
        email: '',
        password: '',
        domain: '',
        error: '',
        isLoading: false,
    }

    handleSignUp = async(event) =>{
        event.preventDefault();
        const {name, email, password, domain, isLoading} = this.state

        if(!name || !email || !domain || !password){
            this.setState({error: "Informe todos os campos para se cadastrar"})
        }
        else{
            try {
                const service = new AccountsServices();
                await service.signup({name,email, password, domain})
                this.props.history.push('/signin');
            } catch (error) {
                console.log(error);
                this.setState({error: "ocorreu um erro durante a criação da conta"});
            }

        }
    }

    renderError = () => {
        return(
            <Alert variant="danger">
                {this.state.error}
            </Alert>
        )
    }

    render(){
        return (
            <Container>
                <Row className="justify-content-md-center">
                    <Col xs={12} md={6}>
                        <BoxContent>
                            <img src={Logo} alt='MailShrimp'/>
                        </BoxContent>
                        <BoxForm>
                            <h2>Cadastro</h2>
                            <p>Informe todos os campos para realizar o cadastro</p>
                            <Form onSubmit={this.handleSignUp}>
                                {this.state.error && this.renderError()}
                                <FormGroup controlId="nomeGroup">
                                    <FormLabel>Nome:</FormLabel>
                                    <FormControl
                                        type="text"
                                        placeholder="Digite o seu nome"
                                        onChange={e => this.setState({name: e.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup controlId="emailGroup">
                                    <FormLabel>E-mail:</FormLabel>
                                    <FormControl
                                        type="email"
                                        placeholder="Digite o seu email"
                                        onChange={e => this.setState({email: e.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup controlId="dominioGroup">
                                    <FormLabel>Domínio:</FormLabel>
                                    <FormControl
                                        type="url"
                                        placeholder="Digite o seu domínio"
                                        onChange={e => this.setState({domain: e.target.value})}
                                    />
                                </FormGroup>

                                <FormGroup controlId="senhaGroup">
                                    <FormLabel>Senha:</FormLabel>
                                    <FormControl
                                        type="password"
                                        placeholder="Digite sua senha"
                                        onChange={e => this.setState({password: e.target.value})}
                                    />
                                </FormGroup>

                                {/*Mudança no Boostrap 5 que substitui o block do button, para colocar o botão na largura do container*/}
                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit">
                                        Realizar Cadastro
                                    </Button>
                                </div>                                                                                                                         
                            </Form>
                        </BoxForm>

                        <BoxContent>
                            <Link className="button" to="/signin">Voltar para o login</Link>
                        </BoxContent>

                    </Col>
                </Row>        
            </Container>
        )
    }
}

export default withRouter(SignUp)