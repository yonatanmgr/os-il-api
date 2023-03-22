import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { MongoClient, ServerApiVersion } = require("mongodb");
  const uri = process.env.MONGODB_URI;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  try {
    await client.connect();
    const db = await client.db("osil");

    const repoCollection = await db.collection("repos");

    const reposResult = await repoCollection.findOne({
      _id: new ObjectId("641b1b262b3ed03c46995e60"),
    });

    res.status(200).json(reposResult.data);
  } finally {
    await setTimeout(() => {
      client.close();
    });
  }
}
