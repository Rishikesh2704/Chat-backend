import { body, matchedData, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { createToken, refreshToken } from "../utils/createToken.js";
import jwt from "jsonwebtoken";
import cookies from "cookie-parser";

const validateSignInUser = [
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
    .isLength({ min: 8 })
    .withMessage("Password should be atleast 8 characters long"),
];

const validateLogInUser = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Please Enter An Email")
    .isEmail()
    .withMessage("Value should be an email"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Please Enter An Password")
    .isLength({ min: 8 })
    .withMessage("Incorrect Password "),
];

export const signUpController = [
  validateSignInUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).send(errors.array());
    }
    try {
      const { email, username, password, profile } = matchedData(req);
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(400).json({ message: "User Already Exists!" });
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
      const token = await createToken(NewUser.id, res);
      const refToken = await refreshToken(NewUser.id, res);
      return res
        .status(201)
        .send({
          message: "User Created Successfully!",
          accessToken: token,
          refreshToken: refToken,
        });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
];

export const loginContoller = [
  validateLogInUser,
  async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).send(errors.array());
    }

    try {
      const { email, password } = matchedData(req);
      const user = await User.findOne({email:email})
      console.log(user)
      if (!user) {
        return res.status(404).json({ message: "User Doesn't Exist!" });
      }
      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res.status(401).send("Wrong Password!");
      }
      await createToken(user.id, res);
      return res.status(200).send({ message: "Logged In!" });
    } catch (error) {
      console.log(error)
      res.status(500).json({error});
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
