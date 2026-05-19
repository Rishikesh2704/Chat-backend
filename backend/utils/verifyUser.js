import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
export const verifyUser = async(req, res, next) => {
    try {
        var token = req.cookies.accessToken
        const isValid =  jwt.verify(token,process.env.JWT_ACCESS_TOKEN_SECRET)
        if(!isValid){
            console.log(isValid)
            throw new Error({message:"Access Token Expired"})
        }
        const { userId } = isValid
        const user = await User.findOne({_id:userId}).select('-password')
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message:"Unauthorized"
        })
    }
    
}