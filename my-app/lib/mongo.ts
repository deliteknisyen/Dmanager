import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "dmanager";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    // options can be added here if needed
  });
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise as Promise<MongoClient>;

export async function getDb(): Promise<Db> {
  const cli = await clientPromise;
  return cli.db(dbName);
}

export async function ping(): Promise<boolean> {
  const db = await getDb();
  const admin = db.admin();
  await admin.ping();
  return true;
}
