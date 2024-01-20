const express  = require("express");
const session = require('express-session');
const dotenv  = require("dotenv");
const mongoose = require("mongoose");
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
dotenv.config();
app.use(express.json());

const store = new MongoDBStore({
    uri: process.env.mongoUrl,
    collection: 'sessions',
});

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        maxAge:   60 * 60 * 1000, // Session expires in 24 hours
      },
  }));

app.get("", (req, res)=>{
    res.json({message: "hi buddy"});
})

app.get('/login', async (req, res) => {
    const user = req.session.user;
    
    if (user) {
      res.send(`Welcome, ${user.username}!`);
    }else{
        req.session.user = { username: 'exampleUser' };
        try {
            await req.session.save();
        } catch (err) {
            console.error('Error saving to session storage: ', err);
            return next(new Error('Error creating user'));
        }
        res.send('Logged in successfully!');
    }
});

app.get('/profile', (req, res) => {
    const user = req.session.user;
    if (user) {
      res.send(`Welcome, ${user.username}!`);
    } else {
      res.send('User not logged in.');
    }
  });

app.post("/cart", async (req, res)=>{

    const user = req.session.user;
    if (user) {

        const preferences = {
            item1: {
                name: "pen",
                price: 10
            },
            item2:{
                name:"eraser",
                price: 3
            }
        }
    
        user.preferences = preferences;
        try {
            await req.session.save();
        } catch (err) {
            console.error('Error saving to session storage: ', err);
            return next(new Error('Error creating user'));
        }

      res.send(`Done Mr. ${user.username}!`);
    } else {
      res.send('User not logged in.');
    }

    

})  

app.get("/checkout", async(req,res)=>{
    const user = req.session.user;
    if (user) {
        
        delete user.preferences;

        try {
            await req.session.save();
        } catch (err) {
            console.error('Error saving to session storage: ', err);
            return next(new Error('Error creating user'));
        }

        res.send("Checkout successfull")
    }else{
        res.send('User not logged in.');
    }
} )

mongoose.connect( process.env.mongoUrl).then(()=>{
    
    console.log("MongoDB connected");
    app.listen(9000, ()=>{
         console.log("server running on port 9000");
    })
})
