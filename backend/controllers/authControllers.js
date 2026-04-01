import { body, matchedData, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { user } from "../models/usermodel.js";
import { createToken } from "../utils/createToken.js";
import jwt from 'jsonwebtoken'

const validateUser = [
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
      const { email, password } = matchedData(req);
      const existingUser = await user.findOne({ email: email });
      if (existingUser) {
        return res.status(400).send("<h1>User Already Exists!</h1>");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const User = new user({ email, password: hashedPassword });
      await User.save();
      const token = await createToken(User.id);
      return res.status(201).send({Token: token})
    } catch (err) {
      console.log(err);
    }
  },
];

export const loginContoller = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    var token = req.headers['authorization']
    console.log(token)
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }
    
    try {
     
      const { email, password } = matchedData(req);
      const User = await user.findOne({email:email})
      if(!User){
        return res.status(400).send("User Doesn't Exist!")
      }
      const comparePassword = await bcrypt.compare(password, User.password)
      if(!comparePassword){
        return res.send("Wrong Password!")
      }
      
      return res.status(200).send("Logged In!")

    } catch (error) {
      console.log(error);
    }
  },
];
