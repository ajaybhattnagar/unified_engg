import React, { Component } from 'react';
import { connect } from 'react-redux';
// import 'bootswatch/dist/flatly/bootstrap.min.css';
import NavigationBar from './_components/_navigation/NavigationBar';
import Login from './_components/_login/Login.js';
import Signup from './_components/_signup/Signup.js';
import Home from './_components/_home/Home';
import Parcel from './_components/_parcel/Parcel';
import UploadParcels from './_components/_uploadParcels/UploadParcels';
// import 
import { BrowserRouter as Router, Routes , Route } from 'react-router-dom';


function App() {
	return (
		<Router>
			{/* <NavigationBar /> */}
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/signup' element={<Signup />} />
				<Route path='/home' element={<Home />} />
				<Route path='/uploadparcels' element={<UploadParcels />} />
				<Route path='/parcel/:parcel_id?' element={<Parcel />} />
			</Routes>
		</Router>
	);
}

export default App;