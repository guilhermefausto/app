import React from 'react';
import {Container,Nav, Navbar} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import {Header, Logo} from './styles';
import {logout} from '../../services/auth';

import Icon from '../../assets/icone.png';

function MainMenu({history}){

    async function handleLogout(){
        await logout();

        history.push('/');
    }

    return (
        <Header>
            <Navbar>
                <Container>
                    <Navbar.Brand href="/">
                        <Logo src={Icon} alt="MailShrimp"/>
                    </Navbar.Brand>
                    <Nav>
                        <Nav.Link href="/contacts">Contatos</Nav.Link>
                        <Nav.Link href="/messages">Mensagens</Nav.Link>
                        <Nav.Link href="/settings">Minha conta</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link onClick={handleLogout}>Sair</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </Header>
    )
}

export default withRouter(MainMenu);
