import React from 'react';
import Header from '../../../shared/header';
import { PageContent } from '../../../shared/styles';
import { Container, Button, Form, Alert, Row, Col, FormGroup, FormLabel, FormControl} from 'react-bootstrap';
import MessageService from '../../../services/messages';
import { Link, withRouter} from 'react-router-dom';
import MessagesService from '../../../services/messages';

class MessageAdd extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            isLoading: true,
            subject: '',
            body: '',
            error: ''
        }
    }

    handleSave = async(event) => {
        event.preventDefault();

        const {subject,body} = this.state;
        if(!subject || !body){
            this.setState({error: 'Informe todos os campos para adicionar a mensagem'});
        }else{
            try {
                const service = new MessagesService();
                await service.add({subject,body});
                this.props.history.push("/messages");
            } catch (error) {
                this.setState({error: 'Houve um erro ao salvar a mensagem'})
            }
        }
    }

    renderError = () => {
        return(
            <Alert variant="danger">{this.state.error}</Alert>
        )
    }

    render(){
        return (
            <>
                <Header/>
                <PageContent>
                    <Container>
                        <h3>Adicionar mensagem</h3>
                        <Form onSubmit={this.handleSave}>
                            {this.state.error && this.renderError()}
                            <Form.Group>
                                <Form.Label>Assunto</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Informe o assunto da mensagem"
                                    onChange={e => this.setState({subject: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Corpo da mensagem</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Digite o conteúdo da mensagem"
                                    onChange={e => this.setState({body: e.target.value})}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Salvar mensagem
                            </Button>
                            <Link className="btn btn-light" to="/messages">Voltar</Link>                            
                        </Form>
                    </Container>
                </PageContent>
            </>
        )
    }
}

export default withRouter(MessageAdd)