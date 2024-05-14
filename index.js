const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const jobsCollection = client.db("jobNest").collection("allJobs");
    const SliderCollection = client.db("jobNest").collection("sliders");

    // Read Slider Data
    app.get("/sliders", async (req, res) => {
      const cursor = SliderCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("JobNest Server is Running...!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
