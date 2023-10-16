import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import axios from 'axios';
import RedirectRoute from './RedirectRoute';
const PrivateRoute = () => {
	const [auth, setAuth] = useAuth();
	const [ok, setOk] = useState(false);

	const getCurrentUser = async () => {
		try {
			const { data } = await axios.get('/current-user');
			setOk(true);
		} catch (error) {
			setOk(false);
		}
	};

	useEffect(() => {
		if (auth?.token) getCurrentUser();
	}, [auth?.token]);
	return ok ? <Outlet /> : <RedirectRoute />;
};

export default PrivateRoute;
