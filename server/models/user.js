import { model, Schema, ObjectId } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
	{
		username: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			lowercase: true,
		},
		name: {
			type: String,
			trim: true,
			default: '',
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			maxLength: 256,
		},
		address: {
			type: String,
			default: '',
		},
		company: {
			type: String,
			default: '',
		},
		phone: {
			type: String,
			default: '',
		},
		photo: {},
		role: {
			type: [String],
			default: ['Buyer'],
			enum: ['Buyer', 'Seller', 'Admin'],
		},
		enquiredproperties: [{ type: ObjectId, ref: 'Ad' }],
		wishlist: [{ type: ObjectId, ref: 'Ad' }],
		resetCode: '',
	},
	{ timestamps: true }
);

userSchema.pre('save', async function (next) {
	try {
		if (!this.isModified('password')) {
			next();
		}
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		console.log('Password Hashing Error: ', error);
	}
});

userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};
export default model('User', userSchema);
