import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/auth';

const AccessAccount = () => {
	const navigate = useNavigate();

	const [auth, setAuth] = useAuth();

	const { token } = useParams();
	useEffect(() => {
		if (token) requestAccess();
	}, [token]);
	const requestAccess = async () => {
		try {
			const { data } = await axios.post(`/access-account`, {
				resetCode: token,
			});
			if (data?.error) {
				toast.error(data.error);
			} else {
				localStorage.setItem('auth', JSON.stringify(data));
				setAuth(data);
				toast.success('Please Update your password in Profile Page ');
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

export default AccessAccount;
