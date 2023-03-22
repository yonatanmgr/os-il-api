import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { MongoClient, ServerApiVersion } = require("mongodb");
  const uri = process.env.MONGODB_URI;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  const { company } = req.query

  try {
    await client.connect();
    const db = await client.db("osil");

    const compCollection = await db.collection("comps");

    const compsResult = await compCollection.findOne({
      _id: new ObjectId("641b2aaf8cf478f1b611c04e"),
    });


    res.status(200).json(compsResult.data.find(obj => {
      if (obj.organization) {        
        return obj.organization.login == company
      }
    }));
  } finally {
    await setTimeout(() => {
      client.close();
    });
  }
}
