import React, { Component } from 'react';
import { connect } from 'react-redux';
import './App.css'
import 'bootswatch/dist/flatly/bootstrap.min.css';
import NavigationBar from './_components/_navigation/NavigationBar';
import Login from './_components/_login/Login.js';
import Home from './_components/_home/Home';
import RecordLabor from './_components/_RecordLabor/RecordLabor';
import EOD from './_components/_reports/EndOfDay';
import ApproveLaborTickets from './_components/_approve_labor_tickets/ApproveLaborTickets';
import Preferences from './_components/_preferences/Preferences';
import { BrowserRouter as Router, Routes , Route } from 'react-router-dom';
import Users from './_components/_users/Users.js';
import TicketDetails from './_components/_ticketDetails/TicketDetails.js';
import CreateLaborTicket from './_components/_create_labor_ticket/CreateLaborTicket.js';


function App() {
	return (
		<Router>
			{/* <NavigationBar /> */}
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/home' element={<Home />} />
				<Route path='/recordLabor' element={<RecordLabor />} />
				<Route path='/approve_labor_tickets' element={<ApproveLaborTickets />} />
				<Route path='/reports/eod' element={<EOD />} />
				<Route path='/preferences' element={<Preferences />} />
				<Route path='/users' element={<Users />} />
				<Route path='/ticket_details' element={<TicketDetails />} />
				<Route path='/create_labor_ticket' element={<CreateLaborTicket />} />
			</Routes>
		</Router>
	);
}

export default App;