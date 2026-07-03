import { body, matchedData, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { createToken, refreshToken } from "../utils/createToken.js";
import jwt from "jsonwebtoken";
import cookies from "cookie-parser";
import { uploadFile } from "../utils/cloudinary.js";

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
      return res.status(201).send({
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

    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).send(errors.array());
    }

    try {
      const { email, password } = matchedData(req);
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ message: "User Doesn't Exist!" });
      }
      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res.status(400).send("Wrong Password!");
      }
      await createToken(user.id, res);
      const refToken = await refreshToken(user.id, res);

      return res.status(200).send({
        message: "Logged In!",
        User: {
          id: user.id,
          username: user.username,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  },
];

export const logOutController = (req, res) => {
  try {
    res.cookie("accessToken", "");
    res.cookie("refreshToken", "");
    res.status(200).send({ message: "Logged Out Successfully!" });
  } catch (error) {
    res.status(500).send(error);
  }
};

export const refreshTokenController = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    res.status(401).json({ message: "Empty Refresh Token" });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
    );
    if (!decodedToken) {
      throw new Error("Invalid Refresh token");
    }
    const accessToken = await createToken(decodedToken.userId, res);
    const newRefreshToken = await refreshToken(decodedToken.userId, res);
    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", newRefreshToken);
    res.status(200).send({
      message: "Created New AccessToken",
      accessToken,
      refreshTOken: newRefreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" } || error.message);
  }
};

export const uploadProfileController = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!req.file){ res.status(404).send({ message: "No Image Found!" });}
    // const { secure_url: profileUrl } = await uploadFile(req.file.path);
    const user = await User.findOne(
      { id: userId },
      
    );
    console.log("User in database", user);
    res.status(201).send({message:"Updated Profile", user:{
      id:user.id,
      username:user.username,
      profile:user.profile
    }})
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send({ message: "Internal Server Error!" });
  }
};
