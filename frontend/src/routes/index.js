import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    useRouteMatch
} from 'react-router-dom';

import SignInPage from './../pages/public/SignIn';
import SignUpPage from './../pages/public/SignUp';
import DashboardPage from './../pages/secure/Dashboard';

import RoutePrivate from './route-wrapper';

export default function Routes(){
    return(
        <Router>
            <Switch>
                <RoutePrivate exact path="/" component={DashboardPage}/>
                <Route exact path="/signin" component={SignInPage}/>
                <Route exact path="/signup" component={SignUpPage}/>
            </Switch>
        </Router>
    )
}