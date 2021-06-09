import React from 'react';
import Header from '../../../shared/header';
import {PageContent} from '../../../shared/styles';
import {Container, Row, Col, Table, Badge} from 'react-bootstrap';
import SettingsService from '../../../services/settings';
import {Link} from 'react-router-dom';

class SettingsDetails extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
            dnsSettings: null
        }
    }

    async componentDidMount(){
        const service = new SettingsService();

        const {DKIM, SPF, Domain, EmailAddresses} = await service.get();

        this.setState({
            isLoading: false,
            dnsSettings: {
                DKIM,
                SPF,
                Domain,
                EmailAddresses
            }
        })
    }

    render(){
        const { isLoading, dnsSettings } = this.state;
        return (
            <>
                <Header/>
                <PageContent>
                    <Container>
                        <Row>
                            <Col>
                                <h3>Minha conta</h3>
                                <p>Para realizar  o envio de mensagens pelo MailShrimp, você precisa possuir um domínio associado à sua conta</p>
                                <p>Você precisa atualizar seus DNS, adicionando as novas entrada a seguir e adicionar um email para ser o remetente de envio</p>
                                {isLoading && <p>Carregando ... </p>}

                                <h4>Configurações no DNS</h4>
                                <h5>Entrada TXT</h5>
                                <p>Crie uma entrada TXT com a seguinte informação:</p>
                                <Table bordered striped hover>
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Nome</th>
                                            <th>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading && <RenderLoaderRow/>}
                                        {!isLoading &&<RenderLines records={dnsSettings.Domain} />}
                                    </tbody>
                                </Table>

                                <h5>DKIM</h5>
                                <p>Adicione uma entrada DKIM no seu provedor a seguinte informação:</p>
                                <Table bordered striped hover>
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Nome</th>
                                            <th>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading && <RenderLoaderRow/>}
                                        {!isLoading &&<RenderLines records={dnsSettings.DKIM} />}
                                    </tbody>
                                </Table>

                                <h5>SPF</h5>
                                <p>Crie ou atualize a entrada SPF no seu DNS. Para configuração MX adicione a prioridade informada:</p>
                                <Table bordered striped hover>
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Nome</th>
                                            <th>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading && <RenderLoaderRow/>}
                                        {!isLoading &&<RenderLines records={dnsSettings.SPF} />}
                                    </tbody>
                                </Table>

                                <h4>Endereços de e-mail</h4>
                                <p>Lista de endereços de e-mails configurados como remetente:</p>
                                <Link className='btn btn-success mb-4' to={'settings/email/add'}>Adicionar Remetente</Link>
                                <Table bordered striped hover>
                                    <thead>
                                        <tr>
                                            <th>E-mail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading && <RenderLoaderRow/>}
                                        {!isLoading &&<RenderEmails records={dnsSettings.EmailAddresses} />}
                                    </tbody>
                                </Table>                                                              
                            </Col>
                        </Row>
                    </Container>
                </PageContent>
            </>
        )
    }
}

function RenderEmails({records}){
    return(
        <>
            {records.length === 0 ?
                <RenderEmptyRow message='Nenhum e-mail cadastrado' />
                :
                records.map((item, index) => (
                    <tr key={index}>
                        <td>
                            {item.email}
                            {(item.verified 
                                ? <Badge className='ml-2' variant='success'>E-mail verificado</Badge>
                                : <Badge className='ml-2' variant='warning'>Aguardando verificação</Badge>)}
                        </td>
                    </tr>
                ))
            }
        </>
    )
}

function RenderLines({records}){
    return(
        <>
            {records.dnsRecords.lenght === 0 && <RenderEmptyRow message='Nenhum DNS disponível para configuração'/>}
            {records.verified ? 
                <RenderVerifiedRow /> :
                records.dnsRecords.map((item,index)=>(
                    <tr key={index}>
                        <td>{item.type}</td>
                        <td>{item.name}</td>
                        <td>{(item.priority ? (`${item.value} - Prioridade: ${item.priority}`) : item.value)}</td>
                    </tr>
                ))
            }
        </>
    )
}

function RenderEmptyRow({message}){
    return(
        <>
            <tr>
                <td colSpan='3'>{message}</td>
            </tr>
        </>
    )
}

function RenderVerifiedRow(){
    return(
        <tr>
            <td colSpan='3'>configuração realizada com sucesso.</td>
        </tr>
    )
}

function RenderLoaderRow(){
    return(
        <>
            <tr>
                <td colSpan='3'><Loader/></td>
            </tr>
        </>
    )
}

function Loader(){
    return(
        <>
            Carregando...
        </>
    )
}

export default SettingsDetails