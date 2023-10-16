import React, { Component } from 'react';
import { connect } from 'react-redux';
import './App.css'
import 'bootswatch/dist/flatly/bootstrap.min.css';
import NavigationBar from './_components/_navigation/NavigationBar';
import Login from './_components/_login/Login.js';
import Home from './_components/_home/Home';
import RecordLabor from './_components/_RecordLabor/RecordLabor';
import Preferences from './_components/_preferences/Preferences';
import { BrowserRouter as Router, Routes , Route } from 'react-router-dom';


function App() {
	return (
		<Router>
			{/* <NavigationBar /> */}
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/home' element={<Home />} />
				<Route path='/recordLabor' element={<RecordLabor />} />
				<Route path='/preferences' element={<Preferences />} />
			</Routes>
		</Router>
	);
}

export default App;