import React from 'react';
import Header from '../../../shared/header';
import { PageContent } from '../../../shared/styles';
import { Container, Badge, Button } from 'react-bootstrap';
import MessageService from '../../../services/messages';
import SettingsService from '../../../services/settings';
import { withRouter } from 'react-router';

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

/*function RenderMessage({message}){
    return(
        <>
            <RenderMessageStatus status={message.status} />
            <p><b>Assunto:</b><br/>{message.subject}</p>
            <p><b>Email do remetente:</b><br/>{message.fromName}({message.fromEmail})</p>
            <p><b>Conteúdo:</b><br/>{message.body}</p>
        </>
    )
}*/

function RenderMessage({message}){
    return(
        <>
            <RenderMessageStatus status={message.status} />
            <p><b>Assunto:</b><br/>{message.subject}</p>
            <p><b>Conteúdo:</b><br/>{message.body}</p>
        </>
    )
}

class MessageDetail extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            isSending: false,
            isLoading: true,
            message: null
        }
    }

    /*async componentDidMount(){
        const {params: {messageId}} = this.props.match;
        
        const messageService = new MessageService();
        const settingsService = new SettingsService();

        const message = await messageService.getOne(messageId);
        const {name: fromName, email: fromEmail} = await settingsService.getOneAccountEmail(message.accountEmailId)

        this.setState({
            //esses ... quer dizer que pega todo o objeto de message e adiciona mais as propriedades depois da virgula
            message: {...message,fromName,fromEmail}, 
            isLoading: false})
    }*/

    async componentDidMount(){
        const {params: {messageId}} = this.props.match;
        
        const service = new MessageService();
        const result = await service.getOne(messageId);

        this.setState({message: result, isLoading: false})
    }

    handleSendMessage = async (messageId) => {
        this.setState({
            isSending: true,
        })
        const service = new MessageService();
        await service.send(messageId);

        this.setState({isSending: false})

        this.props.history.push('messages');
    }

    render(){
        const{message,isLoading,isSending} = this.state;
        return(
            <>
                <Header />
                <PageContent>
                    <Container>
                        <h3>Detalhes da mensagem</h3>
                        {isLoading ? (
                            <p>Carregando</p>
                        ): 
                        (
                            <>
                            <RenderMessage message={message} />
                            <Button disabled={isSending} variant="primary" onClick={() => this.handleSendMessage(message.id)}>
                                {isSending ? ('Enviando...'): ('Enviar mensagem')}
                            </Button>
                            </>
                        )}
                        
                    </Container>
                </PageContent>
            </>
        )
    }
}

export default withRouter(MessageDetail);