const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tp1f27h.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    await client.connect();
    const carCollection = client.db('carsDB').collection('cars');
    const cartCollection = client.db("carsDB").collection("cart");

    app.get("/", async (req, res) => {
      res.send("Sweet Home");
    });
        
    app.get('/cars', async(req, res)=> {
      const cursor = carCollection.find();
      const result = await cursor.toArray();
      res.send(result );
    });


    app.get('/cars/:id', async(req, res)=> {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await carCollection.findOne(query)
      res.send(result || "{}");
    });
    

    app.get("/cartlist/:email", async (req, res) => {
      const email = req.params.email;
      const result = await cartCollection.find({ email }).toArray();
      res.send(result ||"[]");
    });

    app.post("/cartlist", async (req, res) => {
      const data = req.body;
      const result = await cartCollection.insertOne(data);
      res.send(result.acknowledged);
    });

    app.listen(port, ()=> {
      console.log(`http://localhost:${port}/`);
    });

    app.put('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updatedCar = req.body;

      const setCar = {
        $set: {
          ...updatedCar,
        }
      }
      const result = await carCollection.updateOne(filter, setCar, options);
      res.send(result);
    })

    app.post('/cars', async(req, res)=>{
      const newCar = req.body;
      const result = await carCollection.insertOne(newCar);
      res.send(result);
    })

    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);