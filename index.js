const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k8que7r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb://localhost:27017";

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
    const jobsCollection = client.db("jonNest").collection("allJobs");
    const appliedJobsCollection = client.db("jonNest").collection("appliedJobs");
    const SliderCollection = client.db("jonNest").collection("sliders");
    const ReviewCollection = client.db("jonNest").collection("feedBack");

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

    // Read Job Data by Email and Title
    app.get("/jobs", async (req, res) => {
      let query = {};
      if (req.query?.postByEmail) {
        query = { postByEmail: req.query.postByEmail };
      }
      if (req.query?.title) {
        query.title = { $regex: new RegExp(req.query.title, "i") };
      }
      const result = await jobsCollection.find(query).toArray();
      res.json(result);
    });

    // Read Single Job Data by ID
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;

      // Validate the ID
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid job ID format" });
      }

      try {
        const option = {
          projection: {
            _id: 1,
            title: 1,
            pictureUrl: 1,
            description: 1,
            salaryRange: 1,
            applicantsNumber: 1,
            category: 1,
            postingDate: 1,
            applicationDeadline: 1,
            postByEmail: 1, // Add this field
          },
        };
        const result = await jobsCollection.findOne({ _id: new ObjectId(id) }, option);

        if (!result) {
          return res.status(404).json({ error: "Job not found" });
        }

        res.json(result);
      } catch (error) {
        console.error("Error fetching job details:", error);
        res.status(500).json({ error: "An error occurred while fetching job details" });
      }
    });

    app.get("/applied/:jobId/:email", async (req, res) => {
      const { jobId, email } = req.params;

      try {
        const query = { jobId, email }; // jobId should be a string here
        const appliedJob = await appliedJobsCollection.findOne(query);

        res.json({ applied: !!appliedJob });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Read Single Job Data by ID
    app.get("/jobs/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.json(result);
    });

    // Read applied jobs
    app.get("/applied", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      console.log(req.query.email);
      const result = await appliedJobsCollection.find(query).toArray();
      res.json(result);
    });

    // Create all Jobs
    app.post("/jobs", async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job);
      res.json(result);
    });

    // Create Applied Jobs
    app.post("/applied", async (req, res) => {
      const userInfo = req.body;
      const result = await appliedJobsCollection.insertOne(userInfo);
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
