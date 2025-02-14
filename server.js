import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();

const API_URL = "http://localhost:3000";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get("/",(req,res)=>{
  res.render("firstPage.ejs")
})

app.post("/register", (req, res) => {
  res.render("register.ejs", { heading: "Register Here", submit: "Register" });
});
app.post("/login", (req, res) => {
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

app.post("/api/sign", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/sign`, req.body);
    console.log(response.data);
    if (response.data === 'Incorrect'){
      res.send("Incorrect password")
    }else if (response.data === 'notFound') {
      res.send('User not found')
    } 
    else{
      res.redirect("/home")
    }
    
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

app.listen(4000,()=>{
    console.log("server running")
})
