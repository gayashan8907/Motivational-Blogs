import express from 'express';
import bodyParser from 'body-parser'
import pg from 'pg'
import bcrypt, { hash } from "bcrypt"
import env from "dotenv"


const app = express();
const saltRounds = 5;
env.config()
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());





const db = new pg.Client({
    user:process.env.USER,
    host:"localhost",
    database:process.env.DATABASE,
    password:process.env.PASSWORD,
    port:5432
})
db.connect();




app.get('/posts',async(req,res)=>{
    try{
        const result = await db.query('SELECT * FROM posts ORDER BY id ASC');
        res.json(result.rows)
        
    }catch(error){
        console.error('Error fetching data:',error);
        res.status(500).send('error retrieving data from database')
    }
})
app.post("/new",async(req,res) =>{
   
    const title = req.body.title;
    const content = req.body.content;
    const author = req.body.author;
    
    
    await db.query("INSERT INTO posts (title,content,author) VALUES ($1,$2,$3)",[title,content,author]);
    res.redirect("/posts");
})

app.post("/edit", async (req, res) => {
  const id = req.body.id;  
  console.log(id)
  try {
    const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (result.rows.length !== 0) {
      const data = result.rows[0];
      res.json(data);  
    } else {
      res.status(404).json({ message: "Story not found" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching post" });
  }
});



  app.post("/posts/edit",async(req,res) =>{
    const id = req.body.editId
    const title = req.body.title;
    const content = req.body.content;
    const author = req.body.author;
    
    
    await db.query("UPDATE posts SET title = $1,content = $2,author=$3 WHERE id = $4 " , [title,content,author,id])
     res.redirect("/posts");
  })

  app.post("/delete", async (req, res) => {
    const id = req.body.id;  
   
    try {
      const result = await db.query("DELETE  FROM posts WHERE id = $1", [id]);
      res.redirect("/posts")
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Error fetching post" });
    }
  });




  app.post("/user",async(req,res) =>{
   
    const email = req.body.email;
    const password = req.body.password;
    
    try{
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1",[email] )
      if (checkResult.rows.length >0){
        res.send("yes")
        
      }else{
        bcrypt.hash(password,saltRounds,async(err,hash)=>{
          if(err){
            console.log("Error hashing password",err)
          }else{
            const result =await db.query("INSERT INTO users (email,password) VALUES ($1,$2)",[email,hash]);
          }
          
        res.redirect("/posts");
        })
        
      }
  
    }catch(err){
      console.log(err)
    }
    
    
    
  })
  
  app.post('/sign', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.json({ success: false, message: 'User not found' });
      }
  
      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.json({ success: false, message: 'Incorrect password' });
      }
  
      return res.json({ success: true, user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  
  app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.json({ success: false, message: 'User not found' });
      }
  
      const user = result.rows[0];
      return res.json({ success: true, user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  
  
  

app.listen(3000,()=>{
    console.log("server running")
})