import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

export const requireSignin = async (req, res, next) => {
	try {
		const decoded = jwt.verify(req.headers.authorization, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		console.log('error: ', err);
		res.status(401).json({ error: 'invalid or Expired Token' });
	}
};
