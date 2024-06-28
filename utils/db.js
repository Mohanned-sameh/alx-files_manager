import { MongoClient } from 'mongodb';

const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const DB_HOST = process.env.DB_HOST || 'localhost';

class DBClient {
  constructor() {
    this.client = new MongoClient(DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.client.connect();
    this.db = this.client.db(DB_DATABASE);
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
