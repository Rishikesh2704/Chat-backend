import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
export const verifyUser = async(req, res, next) => {
    try {
        var token = req.cookies.token
        console.log(token)
        // const {userId} =  jwt.verify(token,process.env.JWT_SECRET)
        // const user = await User.findOne({_id:userId}).select('-password')
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"UnAuthorized"
        })
    }
    
}