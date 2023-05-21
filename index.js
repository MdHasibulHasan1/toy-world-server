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
     client.connect();

    const db = client.db("toyMarketplace");
    const toysCollection = db.collection("toys");
    const blogsCollection= db.collection("blogs");
    const categoriesCollection= db.collection("categories");
    
    // Get Blogs
    app.get("/blogs", async (req, res) => {
      const blogs = await blogsCollection.find({}).toArray();
      res.send(blogs);
    });
    

// Get sub-categories
    app.get("/sub-categories", async (req, res) => {
      const result = await categoriesCollection.find({}).toArray();
      res.send(result);
    });


 // Endpoint to get details of a specific subcategory
app.get('/subCategories/:id', (req, res) => {
  const subCategoryId = req.params.id;

  // Find the subcategory based on the provided ID
  let subCategory;
  for (const category of categoriesCollection) {
    subCategory = category.subCategories.find(subCat => subCat._id === subCategoryId);
    if (subCategory) {
      break;
    }
  }

  if (!subCategory) {
    return res.status(404).json({ message: 'Subcategory not found' });
  }

  // Return the subcategory details
  res.send(subCategory);
});


// post a toy
    app.post("/toys", async (req, res) => {
      const body = req.body;
      
      const result = await toysCollection.insertOne(body);
      res.send(result);
      
    });
    app.get("/toys", async (req, res) => {
      const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter, defaulting to 1 if not provided
      const limit = 20; // Set the number of toys to fetch per page
      const skip = (page - 1) * limit; // Calculate the number of toys to skip based on the page number and limit
    
      const totalToys = await toysCollection.countDocuments({});
      const totalPages = Math.ceil(totalToys / limit);
    
      const toys = await toysCollection
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();
    
      res.send({
        toys: toys,
        currentPage: page,
        totalPages: totalPages,
      });
    });
    
    app.get("/getToysByText/:searchText", async (req, res) => {
      const searchText = req.params.searchText;
    
      const toys = await toysCollection
        .find({ toyName: { $regex: searchText, $options: "i" } })
        .toArray();
    
      res.send({
        toys: toys,
        currentPage: 1,
        totalPages: 1,
      });
    });
    
    
app.get("/toys/:Id", async (req, res) => {
  const { Id } = req.params;
  const toy = await toysCollection.findOne({ _id: Id });

  if (toy) {
    res.send({ toy });
  } else {
    res.status(404).send({ error: "Toy not found" });
  }
});
    
    
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(query);
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
    const { email } = req.params;
    const { sortBy, sortOrder } = req.query;
  
    const sortOptions = {};
    if (sortBy && sortOrder) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    }
  
    const toys = await toysCollection
      .find({ sellerEmail: email })
      .sort(sortOptions)
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








