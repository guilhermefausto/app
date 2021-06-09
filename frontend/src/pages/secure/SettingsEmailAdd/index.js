import React from 'react';
import Header from '../../../shared/header';
import SettingsService from '../../../services/settings';
import { PageContent } from '../../../shared/styles';
import { Container, Form, FormGroup, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

class SettingsEmailAdd extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isLoading: false,
            name: '',
            email: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(event){
        event.preventDefault();

        const { name,email } = this.state;
        
        this.setState({ isLoading:true})
        
        const service = new SettingsService();

        await service.addAccountEmail({name, email});

        this.setState({ isLoading:false})
        this.props.history.push('/settings');
    }

    render(){
        return(
        <>
            <Header/>
            <PageContent>
                <Container>
                    <h4>Adicionar remetente</h4>
                    <p>Informe o nome e e-mail do remetente</p>
                    <p>Você recebera um e-mail da AWS com um link para confirmar o e-mail, clique no link para ativar</p>
                    <Row>
                        <Col lg={6} sm={12}>
                            <Form onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <Form.Label>Nome: </Form.Label>
                                    <Form.Control 
                                        type='text' 
                                        placeholder='Informe o nome'
                                        className='mb-2'
                                        onChange={e => this.setState({name: e.target.value})}/>
                                </FormGroup>
                                <FormGroup>
                                    <Form.Label>E-mail: </Form.Label>
                                    <Form.Control 
                                        type='email' 
                                        placeholder='email@seudominio.com'
                                        className='mb-4'
                                        onChange={e => this.setState({email: e.target.value})}/>
                                </FormGroup>
                                <Button variant='primary' type='submit'>Adicionar E-mail</Button>
                                <Link className="btn btn-default" to={'/settings'}></Link>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </PageContent>
        </>
        )
    }
}

export default SettingsEmailAdd;