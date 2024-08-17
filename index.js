const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors=require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5001
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdqfb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
    // Send a ping to confirm a successful connection
    const carCollection=client.db('carsDB').collection('cars')
    const userCollection=client.db('carUsersDB').collection('users')
    app.get(`/addcar`, async(req, res)=>{
      const cursor=carCollection.find();
      const result=await cursor.toArray();
      res.send(result);
    })

    app.get(`/car/:id`,async(req, res)=>{
      const id=req.params.id;
      console.log(id)
      const query={_id: new ObjectId(id)};
      const result=await carCollection.findOne(query)
      res.send(result);
    })
    
    app.put(`/car/:id`,async(req, res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const options={upsert:true};
      const updatedCar=req.body;
      const car={
        $set:{
          name: updatedCar.name,
          brand: updatedCar.brand,
          price: updatedCar.price,
          details: updatedCar.details,
          photo: updatedCar.photo,
          seat: updatedCar.seat,
          brandNew: updatedCar.brandNew,
          bankLoan: updatedCar.bankLoan,
        }
      }
      const result=await carCollection.updateOne(filter,car ,options)
      res.send(result);
    })

    app.post(`/addcar`, async(req, res)=>{
      const newCar=req.body;
      console.log(newCar);
      const result=await carCollection.insertOne(newCar);
      res.send(result);
    })

    app.delete(`/car/:id`, async(req, res)=>{
      const id=req.params.id;
      const query={_id : new ObjectId(id)};
      const result=await carCollection.deleteOne(query);
      res.send(result);
    })

    app.get(`/users`,async(req, res)=>{
      const cursor=userCollection.find();
      const result=await cursor.toArray();
      res.send(result);
    })

    app.get(`/users/:id`, async(req, res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const result=await userCollection.findOne(query)
      res.send(result)
    })
    
    app.post(`/user`, async(req, res)=>{
      const newUser=req.body;
      console.log(newUser);
      const result=await userCollection.insertOne(newUser);
      res.send(result)
    })

    app.put(`/user/:id`,async(req, res)=>{
      const id=req.params.id;
      const filter={_id : new ObjectId(id)};
      const option={upsert:true};
      const givenId=req.body
      const cart={
        $addToSet:{
          carId:{carId: givenId}
        }
      }
      try{
        const user=await userCollection.findOne(filter);
        if (!user.carId || !Array.isArray(user.carId)) {
          await userCollection.updateOne(filter, {$set:{carId:[]}});
        }
        const result=await userCollection.updateOne(filter,cart,option)
        res.send(result);

      }
      catch(err){
        console.log(err)
      }
      //const result=await userCollection.updateOne(filter,cart,option)
     // res.send(result);
      //console.log(id, req.body);
    })

    app.delete(`/user/:userId/car/:carId`, async(req, res)=>{
      const userId=req.params.userId;
      const carId=req.params.carId;

      const filter={_id: new ObjectId(userId)};
      const update={
        $pull:{
          carId: 
          {carId: 
            {
            carId: carId
          }}
        }
      };
      try{
        const result=await userCollection.updateOne(filter, update);
        res.send(result)
      }catch(err){
        console.log(err)
        res.send(err)
      }
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})