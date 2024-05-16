const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const appliedJobsCollection = client.db("jobNest").collection("appliedJobs");
    const SliderCollection = client.db("jobNest").collection("sliders");
    const ReviewCollection = client.db("jobNest").collection("feedBack");

    // Read Slider Data
    app.get("/sliders", async (req, res) => {
      const cursor = SliderCollection.find();
      const result = await cursor.toArray();
      res.json(result);
    });

    // Read User Reviews
    app.get("/feedback", async (req, res) => {
      const cursor = ReviewCollection.find();
      const result = await cursor.toArray();
      res.json(result);
    });

    // Create all Jobs
    app.post("/jobs", async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job);
      res.json(result);
    });

    // Read All Jobs
    // app.get("/jobs", async (req, res) => {
    //   const cursor = jobsCollection.find();
    //   const result = await cursor.toArray();
    //   res.json(result);
    // });

    // Read Job Data by Email
    app.get("/jobs", async (req, res) => {
      let query = {};
      if (req.query?.postByEmail) {
        query = { postByEmail: req.query.postByEmail };
      }
      console.log(req.query);
      const result = await jobsCollection.find(query).toArray();
      res.json(result);
    });

    // Read Single Job Data by ID
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const option = {
        projection: {
          _id: 1,
          title: 1,
          pictureUrl: 1,
          description: 1,
          salaryRange: 1,
          applicantsNumber: 1,
        },
      };
      const result = await jobsCollection.findOne({ _id: new ObjectId(id) }, option);
      res.json(result);
    });

    app.get("/jobs/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.json(result);
    });

    // Update Job Data by ID
    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const updatedJob = req.body;

      // //updating in database
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const newUpdatedInformations = {
        $set: {
          title: updatedJob.title,
          salaryRange: updatedJob.salaryRange,
          pictureUrl: updatedJob.pictureUrl,
          category: updatedJob.category,
          applicantsNumber: updatedJob.applicantsNumber,
          postingDate: updatedJob.postingDate,
          applicationDeadline: updatedJob.applicationDeadline,
          postBy: updatedJob.postBy,
          postByEmail: updatedJob.postByEmail,
          description: updatedJob.description,
        },
      };
      const result = await jobsCollection.updateOne(filter, newUpdatedInformations, option);
      res.json(result);
    });

    // Delete Job Data by ID
    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.json(result);
    });

    // Create Applied Jobs
    app.post("/applied", async (req, res) => {
      const userInfo = req.body;
      const result = await appliedJobsCollection.insertOne(userInfo);
      res.json(result);
    });

    // Read applied jobs
    app.get("/applied", async (req, res) => {
      const result = await appliedJobsCollection.find().toArray();
      res.json(result);
    });

    // Check Database Connection
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
