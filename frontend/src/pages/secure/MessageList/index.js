import React from 'react';
import Header from '../../../shared/header';
import {PageContent} from '../../../shared/styles';
import { Container, Table, Row, Col, Badge } from 'react-bootstrap';
import { Link, withRouter, userRouteMatch, useRouteMatch} from 'react-router-dom';
import MessagesService from '../../../services/messages';

function RenderMessageStatus({status}){
    let statusName = {}

    switch (status) {
        case 100: statusName = {title: 'CRIADA', css:'primary'}
            break;
        
        case 200: statusName = {title: 'ENVIADA', css:'success'}
            break;
        
        case 300: statusName = {title: 'CRIADA', css:'secondary'}
            break;        
    
        default: statusName = {title: 'INDEFINIDO', css:'light'}
            break;
    }

    return(
        <Badge pill variant={statusName.css}>
            {statusName.title}
        </Badge>
    )
}

function RenderEmptyRow({mensagem}) {
    return(
        <tr>
            <td colSpan="2">{mensagem}</td>
        </tr>
    )
}

function RenderLine({message}){
    let {url} = useRouteMatch();
    return(
        <tr>
            <td>
                <Link to={`${url}/${message.id}`}>{message.subject}</Link>
            </td>
            <td>
                <RenderMessageStatus status={message.status} />
            </td>
        </tr>
    )
}

function RenderTable({messages}){
    return(
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Assunto</th>
                    <th>Status</th>
                </tr>    
            </thead>
            <tbody>
                {messages.length === 0 && <RenderEmptyRow mensagem="Nenhuma mensagem foi adicionada."/>}
                {messages.map((item) => <RenderLine key={item.id} message={item}/>)}
            </tbody>
        </Table>
    )
}

function RenderButtonAdd(){
    let {url} = useRouteMatch();
    return(
        <Link className="btn btn-success float-right" to={`${url}/add`}>Adicionar mensagem</Link>
    )
}

class MessageList extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isLoading: true,
            messages: []
        }
    }

    async componentDidMount(){
        const service = new MessagesService();
        const result = await service.getAll();
        
        this.setState({
            messages: result,
            isLoading: false
        })
    }

    render(){
        const { messages } = this.state;
        return(
            <>    
                <Header />
                <PageContent>
                    <Container>
                        <Row>
                            <Col>
                                <h3>Mensagens</h3>
                            </Col>
                            <Col>
                                <RenderButtonAdd />
                            </Col>
                        </Row>
                        <p>Lista de mensagens:</p>
                        <RenderTable messages={messages} />
                    </Container>
                </PageContent>
            </>    
        )
    }
}

export default withRouter(MessageList);