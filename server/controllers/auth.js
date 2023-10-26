import * as config from '../config.js';
import jwt from 'jsonwebtoken';
import { emailTemplate, emailTemplateBackup } from '../helpers/email.js';

import User from '../models/user.js';
import Ad from '../models/ad.js';
import { nanoid } from 'nanoid';
import validator from 'email-validator';
import nodemailer from 'nodemailer';
const tokenAndUserResponse = (req, res, user) => {
	const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
		expiresIn: '1y',
	});
	const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
		expiresIn: '2y',
	});
	user.passowrd = undefined;
	user.resetCode = undefined;
	res.json({
		token,
		refreshToken,
		user,
	});
};
export const welcome = (req, res) => {
	res.json({
		data: 'hello from api server',
	});
};

const backupEmailService = async (clientMail, mailType, token, res) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: config.EMAIL_FROM,
			pass: config.pass,
		},
	});

	const mailOptionsActivate = emailTemplateBackup(
		clientMail,
		`
	  <p>Please click the link below to activate your account.</p>
	  <a href="${config.CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>
	  `,

		'Activate your acount'
	);

	const mailOptionsPasswordReset = emailTemplateBackup(
		clientMail,
		` <p>Please click the link below to access your account.</p>
		  <a href="${config.CLIENT_URL}/auth/access-account/${token}">Access my account</a>`,

		'Activate your acount'
	);

	if (mailType == 'Activate') {
		transporter.sendMail(mailOptionsActivate, function (err, info) {
			if (err) {
				console.log(err);
				res.json({ error: 'Try Again' });
			} else {
				res.json({
					ok: 'true',
				});
			}
		});
	} else if (mailType == 'Reset') {
		transporter.sendMail(mailOptionsPasswordReset, function (err, info) {
			if (err) {
				console.log(err);
				res.json({ error: 'Try Again' });
			} else {
				res.json({
					ok: 'true',
				});
			}
		});
	}
};

export const preRegister = async (req, res) => {
	try {
		console.log(req.body);
		const { email, password } = req.body;
		if (!validator.validate(email)) {
			return res.json({ error: 'A valid email is required!!!' });
		}
		if (!password) {
			return res.json({ error: 'Password is required!!' });
		}
		if (password && password?.length < 6) {
			return res.json({ error: 'Password should be atleast 6 char long' });
		}
		const user = await User.findOne({ email });
		if (user) {
			return res.json({ error: 'email already exist!!!' });
		}
		const token = jwt.sign({ email, password }, config.JWT_SECRET, {
			expiresIn: '1h',
		});
		config.AWSSES.sendEmail(
			emailTemplate(
				email,
				`
              <p>Please click the link below to activate your account.</p>
              <a href="${config.CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>
              `,
				config.REPLY_TO,
				'Activate your acount'
			),
			(error, data) => {
				if (error) {
					console.log(error);
					backupEmailService(email, 'Activate', token, res);
				} else {
					console.log(data);
					return res.json({ ok: true });
				}
			}
		);
	} catch (err) {
		console.log('error: '.err);
		res.json({ error: 'Something went Wrong!! Try Again' });
	}
};

export const register = async (req, res) => {
	try {
		const { email, password } = jwt.verify(req.body.token, config.JWT_SECRET);
		console.log(email);

		const user = await new User({
			username: nanoid(6),
			email,
			password,
		}).save();

		tokenAndUserResponse(req, res, user);
	} catch (err) {
		console.log('error: ', err);
		res.json({ error: 'Something went Wrong!! Try Again' });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			return res.json({ error: 'No such email exist!!' });
		}
		// const match = await comparePassword(password, user.password);
		const match = await user.comparePassword(password);
		if (!match) {
			return res.json({ error: 'Wrong password' });
		}
		tokenAndUserResponse(req, res, user);
	} catch (err) {
		console.log('error: ', err);
		res.json({ error: 'Something went Wrong!! Try Again' });
	}
};

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			return res.json({ error: 'No such email exist!!' });
		}
		const resetCode = nanoid();
		user.resetCode = resetCode;
		user.save();
		const token = jwt.sign({ resetCode }, config.JWT_SECRET, {
			expiresIn: '1h',
		});
		config.AWSSES.sendEmail(
			emailTemplate(
				email,
				` <p>Please click the link below to access your account.</p>
			      <a href="${config.CLIENT_URL}/auth/access-account/${token}">Access my account</a>`,
				config.REPLY_TO,
				'Access Your Account'
			),
			(err, data) => {
				if (err) {
					console.log(err);
					backupEmailService(email, 'Reset', token, res);
				} else {
					console.log(data);
					return res.json({ ok: true });
				}
			}
		);
	} catch (err) {
		console.log('error: ', err);
		res.json({ error: 'Something went Wrong!! Try Again' });
	}
};

export const accessAccount = async (req, res) => {
	try {
		const { resetCode } = jwt.verify(req.body.resetCode, config.JWT_SECRET);
		const user = await User.findOneAndUpdate({ resetCode }, { resetCode: '' });
		tokenAndUserResponse(req, res, user);
	} catch (err) {
		console.log('error: ', err);
		res.json({ error: 'Something went Wrong!! Try Again' });
	}
};

export const refreshToken = async (req, res) => {
	try {
		const { _id } = jwt.verify(req.headers.refresh_token, config.JWT_SECRET);

		const user = await User.findById(_id);

		tokenAndUserResponse(req, res, user);
	} catch (err) {
		console.log(err);
		return res.status(403).json({ error: 'Refresh token failed' });
	}
};

export const currentUser = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		user.password = undefined;
		user.resetCode = undefined;
		res.json(user);
	} catch (err) {
		console.log(err);
		return res.status(403).json({ error: 'Unauthorized' });
	}
};

export const publicProfile = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username });
		user.password = undefined;
		user.resetCode = undefined;
		res.json(user);
	} catch (err) {
		console.log(err);
		return res.status(403).json({ error: 'User not found' });
	}
};

export const updatePassword = async (req, res) => {
	try {
		const { password } = req.body;
		if (!password) {
			return res.json({ error: 'Password is required!!!' });
		}
		if (password && password?.length < 6) {
			return res.json({ error: 'Password should be atleast 6 char long' });
		}
		const user = await User.findByIdAndUpdate(req.user._id, {
			password,
		});
		res.json({ ok: true });
	} catch (err) {
		console.log('error: ', err);
		return res.status(403).json({ error: 'Unauthorized' });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.user._id, req.body, {
			new: true,
		});
		user.password = undefined;
		user.resetCode = undefined;
		res.json(user);
	} catch (err) {
		console.log('error: ', err);
		if (err.codeName === 'DuplicateKey') {
			res.status(404).json({ error: 'Username or Email is already taken!!!!' });
		} else {
			res.status(403).json({ error: 'Unauthorized!!!' });
		}
	}
};

export const agents = async (req, res) => {
	try {
		const agents = await User.find({ role: 'Seller' }).select(
			'-password -role -enquiredProperties -wishlist -photo.key -photo.Key -photo.Bucket'
		);
		res.json(agents);
	} catch (err) {
		console.log(err);
	}
};

export const agentAdCount = async (req, res) => {
	try {
		const ads = await Ad.find({ postedBy: req.params._id }).select('_id');
		// console.log("ads count => ", ads);
		res.json(ads);
	} catch (err) {
		console.log(err);
	}
};

export const agent = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username }).select(
			'-password -role -enquiredProperties -wishlist -photo.key -photo.Key -photo.Bucket'
		);
		const ads = await Ad.find({ postedBy: user._id }).select(
			'-photos.key -photos.Key -photos.ETag -photos.Bucket -location -googleMap'
		);
		res.json({ user, ads });
	} catch (err) {
		console.log(err);
	}
};
