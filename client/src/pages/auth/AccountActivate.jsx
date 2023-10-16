import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/auth';

const AccountActivate = () => {
	const navigate = useNavigate();

	const [auth, setAuth] = useAuth();

	const { token } = useParams();
	useEffect(() => {
		if (token) requestActivation();
	}, [token]);
	const requestActivation = async () => {
		try {
			const { data } = await axios.post(`/register`, { token });
			if (data?.error) {
				toast.error(data.error);
			} else {
				localStorage.setItem('auth', JSON.stringify(data));
				setAuth(data);
				toast.success('Successfully registered....Welcome to HomeExplore!!! ');
				navigate('/');
			}
		} catch (error) {
			console.log('error: ', error);
			toast.error('Something Went Wrong!!!');
		}
	};

	return (
		<div className='display-1 d-flex justify-content-center align-items-center vh-100'>
			Please Wait....
		</div>
	);
};

export default AccountActivate;
