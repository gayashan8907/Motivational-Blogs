import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import session from 'express-session';
import passport from 'passport';
import { Strategy } from "passport-local";


const app = express();

const API_URL = "http://localhost:3000";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'SECRETWORD',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
    },
  })
);


app.use(passport.initialize())
app.use(passport.session())


app.get("/",(req,res)=>{
  res.render("firstPage.ejs")
})

app.post("/register", (req, res) => {
  res.render("register.ejs", { heading: "Register Here", submit: "Register" });
});
app.post("/sign", (req, res) => {
  res.render("sign.ejs", { heading: "Login Here", submit: "Login" });
});

app.post("/api/register", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/user`, req.body);
    if(response.data=== "yes"){
      res.send("Email already exist,try to login")
    }else{
      res.redirect("/home");
    }
    // console.log(response.data);
    
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});



app.get("/home",async(req,res)=>{
    try{
        const response = await axios.get(`${API_URL}/posts`);
        res.render("index.ejs",{posts:response.data})
    }catch(error){
        res.status(500).json({message:"Error fetching posts"})
    }
})

app.get("/add", (req, res) => {
    res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const response = await axios.post(`${API_URL}/new`, req.body);
      console.log(response.data);
      res.redirect("/home");
    } catch (error) {
      res.status(500).json({ message: "Error creating post" });
    }
  });
  
  app.post("/edit",async(req,res)=>{
    const response = await axios.post(`${API_URL}/edit`,req.body);
    console.log(response.data);

        res.render("modify.ejs", {
          heading: "Edit Post",
          submit: "Update Post",
          post: response.data,
       
      })
    });

    app.post("/api/edit", async (req, res) => {
        console.log("called");
        try {
          const response = await axios.post( `${API_URL}/posts/edit`, req.body);
          console.log(response.data);
          res.redirect("/home");
        } catch (error) {
          res.status(500).json({ message: "Error updating post" });
        }
      });

      app.post("/delete",async(req,res)=>{
        const response = await axios.post(`${API_URL}/delete`,req.body);
        console.log(response.data);
        res.redirect("/home");
            
           
          
        });


        passport.use(
          new Strategy({ usernameField: 'email' }, async (email, password, cb) => {
            try {
              // Send a request to the Database Server to authenticate the user
              const response = await axios.post( `${API_URL}/sign`, { email, password });
              if (response.data.success === false) {
                return cb(null, false); // Authentication failed
              }
              return cb(null, response.data.user); // Authentication successful
            } catch (error) {
              return cb(error);
            }
          })
        );
        
        // Serialize user
        passport.serializeUser((user, cb) => {
          cb(null, user.id); // Store the user's ID in the session
        });
        
        // Deserialize user
        passport.deserializeUser(async (id, cb) => {
          try {
            // Send a request to the Database Server to fetch the user
            const response = await axios.get(`${API_URL}/user/${id}`);
            if (!response.data.user) {
              return cb(new Error('User not found'));
            }
            cb(null, response.data.user); // Return the user object
          } catch (error) {
            cb(error);
          }
        });
        app.post('/login', passport.authenticate('local', {
          successRedirect: '/secret',
          failureRedirect: '/',
        }));
        
        app.get('/secret', (req, res) => {
          if (req.isAuthenticated()) {
            res.redirect('/home');
          } else {
            res.redirect('/');
          }
        });
        
        app.post('/logout', (req, res) => {
          req.logout((err) => {
            if (err) {
              return res.status(500).send('Error logging out');
            }
            res.redirect('/');
          });
        });     
        
app.listen(4000,()=>{
    console.log("server running")
})
