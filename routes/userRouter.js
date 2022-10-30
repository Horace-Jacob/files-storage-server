import express from "express";
import bcrypt from "bcryptjs";
import UserSchema from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import dotEnv from "dotenv";
dotEnv.config();

const router = express.Router();

router.get("/", async (_, res) => {
  res.status(200).json({ message: "hello world" });
});

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const oldUser = await UserSchema.findOne({ email });
    if (oldUser) {
      return res.status(404).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUserRegister = new UserSchema({
      email,
      username,
      password: hashedPassword,
    });
    await newUserRegister.save();
    res.status(200).json({ user: newUserRegister });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const oldUser = await UserSchema.findOne({ email });
    if (!oldUser) {
      return res.status(404).json({ error: "User doesn't exist" });
    }
    const decryptPassword = await bcrypt.compare(password, oldUser.password);
    if (!decryptPassword) {
      return res.status(404).json({ error: "Incorrect Password" });
    }
    const token = jwt.sign(
      { email: oldUser.email, id: oldUser.id },
      process.env.SECRET,
      { expiresIn: "24hr" }
    );
    res
      .status(200)
      .json({ user: oldUser.username, id: oldUser.id, token: token });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
