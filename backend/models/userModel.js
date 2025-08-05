import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: {type:String , required:true, enum:['admin','editor','viewer'] , default:"viewer"}
}
,
{
  timestamps: true,
}
);

//userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
export default User;
