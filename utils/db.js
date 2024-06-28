import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.client = new MongoClient(process.env.DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.client.connect();
    this.db = this.client.db(process.env.DB_DATABASE);
  }

  async isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
