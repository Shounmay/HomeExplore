import React, { useState } from 'react';
import axios from 'axios';

import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
	const [email, setEmail] = useState('');

	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			// console.table({ email, password });
			const { data } = await axios.post(`/forgot-password`, {
				email,
			});
			if (data?.error) {
				toast.error(data.error);
				setLoading(false);
			} else {
				toast.success('Please Check your Email for Password-Reset Link ');
				setLoading(false);
				navigate('/');
			}
			console.log(data);
		} catch (err) {
			toast.error('Something Went Wrong....Try Again!!!');
			console.log('error: ', err);
			setLoading(false);
		}
	};
	return (
		<div>
			<h1 className='display-1 bg-primary text-light p-5'>Forgot Password</h1>
			<div className='container'>
				<div className='row'>
					<div className='col-lg-4 offset-lg-4'>
						<form onSubmit={handleSubmit}>
							<input
								type='text'
								placeholder='Enter your email'
								className='form-control mb-4'
								required
								autoFocus
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>

							<button disable={loading} className='btn btn-primary col-12 mb-4'>
								{loading ? 'Waiting....' : 'Submit'}
							</button>
						</form>
						<Link className='text-danger' to='/login'>
							Back to Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
