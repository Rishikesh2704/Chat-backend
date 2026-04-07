import { body, matchedData, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { createToken } from "../utils/createToken.js";
import jwt from "jsonwebtoken";
import cookies from "cookie-parser";

const validateUser = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Please Enter An Email")
    .isEmail()
    .withMessage("Value should be an email"),

  body("username").trim().notEmpty().withMessage("Username is Required"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Please Enter An Password")
    .isLength({ min: 1, max: 10 })
    .withMessage("Password should be atleast 8 characters long"),
];

export const signUpController = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }
    try {
      const { email, username, password, profile } = matchedData(req);

      const existingUser = await user.findOne({ email: email });
      if (existingUser) {
        return res.status(401).send("<h1>User Already Exists!</h1>");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const NewUser = new User({
        email,
        username,
        password: hashedPassword,
        profile,
      });
      await NewUser.save();
      await createToken(NewUser.id, res);
      return res.status(201).send({ NewUser });
    } catch (error) {
      res.status(500).send(error);
    }
  },
];

export const loginContoller = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }

    try {
      const { email, password } = matchedData(req);
      const User = await user.findOne({ email: email });

      if (!User) {
        return res.status(404).send("User Doesn't Exist!");
      }
      const comparePassword = await bcrypt.compare(password, User.password);
      if (!comparePassword) {
        return res.status(401).send("Wrong Password!");
      }
      await createToken(User.id, res);
      return res.status(200).send({ message: "Logged In!" });
    } catch (error) {
      res.status(500).send(error);
    }
  },
];

export const logOutController = (req, res) => {
  try {
    res.cookie("token", "");
    res.status(200).send({ message: "Logged Out Successfully!" });
  } catch (error) {
    res.status(500).send(error);
  }
};
