import { User } from "../models/user.model.js"

export const getUsersController = async (req, res) => {
    try{
        const {id} = req.user
        const users = await User.find({ _id:{$ne:id}}).select('-password')
        res.status(200).json({
            Users:users
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Internal Server Error!"
        })
    }
}