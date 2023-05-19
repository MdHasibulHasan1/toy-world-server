const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.itpj9d6.mongodb.net/?retryWrites=true&w=majority`;

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
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query);
      res.send(result);
  })

  app.put("/updateToy/:id", async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    console.log(body);
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        price: body.price,
        quantity: body.quantity,
        toyName: body.toyName,
        description:body.description,
      },
    };
    const result = await toysCollection.updateOne(filter, updateDoc);
    res.send(result);
  }); 


  app.get("/getToysByText/:text", async (req, res) => {
    const text = req.params.text;
    const result = await toysCollection
      .find({
        $or: [
          { toyName: { $regex: text, $options: "i" } },
          
        ],
      })
      .toArray();
    res.send(result);
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
