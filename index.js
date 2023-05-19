const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://toysManager:ilwDAieHk6rcjiP0@cluster0.itpj9d6.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("toyMarketplace");
    const toysCollection = db.collection("toys");
// post a toy
    app.post("/toys", async (req, res) => {
      const body = req.body;
      
      const result = await toysCollection.insertOne(body);
      
      
    });
    app.get("/toys", async (req, res) => {
      const toys = await toysCollection
        .find({})
        .toArray();
      res.send(toys);
    });
    
    app.get("/myToys/:email", async (req, res) => {
      
      
      const toys = await  toysCollection
        .find({
          sellerEmail: req.params.email,
        })
        .toArray();
      res.send(toys);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Your server is running')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})
