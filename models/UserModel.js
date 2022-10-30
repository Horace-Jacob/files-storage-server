import mongoose from "mongoose";

const UserModel = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  files: [],
});

const UserSchema = mongoose.model("Users", UserModel);

export default UserSchema;
