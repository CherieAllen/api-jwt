import functions from "firebase-functions";
import express from "express";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mySecretKey from './secrets.js'

const users =[ //fake database
    { id: 1, email:'cherie@bocacode.com', password:'abc123'},
    { id: 2, email:'todd@bocacode.com', password:'acc123'},
    { id: 3, email:'sam@bocacode.com', password:'adc123'},
]


const app=express();
app.use(cors());
app.use(express.json());

app.post('/login',(req,res) => {
    const {email, password} = req.body;
    // check to see if that email and password exist in database 
    // if they do, create and send back a token
    // if they don't send back an error message

    let user = users.find(user => user.email === email && user.password === password);
    if(!user){
        res.status(401).send('Invalid email or password');
        return;
    }
    user.password = undefined; // remove password from the user object
    // now we want to create and sign a token...
    const token =jwt.sign(user,mySecretKey,{expiresIn:'5h'})
    res.send(token) 
});

app.get('/public',(req,res) => {
    res.send('Welcome!') // anyone can see this 
});

app.get('/private',(req,res) => {
    // lets require a valid token to see this
    const token =req.headers.authorization || "";
    if (!token) {
        res.status(401).send ('You must be logged in to see this')
        return;
    }
    jwt.verify(token,mySecretKey,(err,decoded) =>{
        if(err){
            res.status(401).send ('You must use a valid login'+ err)
            return;
        }
        //here we know that the token is valid
        res.send(`Welcome ${decoded.email}!`);
    });
});


export const api = functions.https.onRequest(app);


