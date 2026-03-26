const {body, matchedResult, validationResult} = require('express-validator')

const validateUser = [
    body('email').trim()
    .isEmpty().withMessage("Please enter an email")
    .isEmail().withMessage("Value should be an email"),

    body('password').trim()
    .isEmpty().withMessage('Please enter password')
    .isLength({min:8}).withMessage('Password should be atleast 8 characters long')
    .isAlphanumeric().withMessage('Password must be Alphanumeric')
]


export const signinController = [
    validateUser,
    (req,res) => {
        const error = validationResult(req)
        if(!error.isEmpty()){
            res.status(404).send(error.array())
        }

        const { email, password } = matchedResult(req)
        console.log("email: ",email," password: ", password)
        res.send("email: ",email, " password: ", password)
    }
]

export const loginContoller = [
    validateUser,
    (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            res.status(404).send(errors.array())
        }
        const { email, password } = matchedResult(req)
        console.log("email: ", email, " password: ", password)
        res.send("email: ",email," password: ", password)
    }
]