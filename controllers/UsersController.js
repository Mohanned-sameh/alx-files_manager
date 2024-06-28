import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { v4 as uuidv4 } from 'uuid';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });
    const user = await dbClient.getUser({ email });
    if (user) return res.status(400).send({ error: 'Already exist' });
    const userId = uuidv4();
    const key = `auth_${userId}`;
    await redisClient.set(key, 0, 86400);
    await dbClient.db
      .collection('users')
      .insertOne({ email, password, userId });
    return res.status(201).send({ userId, email });
  }

  static async getMe(req, res) {
    const auth = req.header('Authorization');
    if (!auth) return res.status(401).send({ error: 'Unauthorized' });
    const key = `auth_${auth}`;
    const userId = await redisClient.get(key);
    if (!userId) return res.status(401).send({ error: 'Unauthorized' });
    const user = await dbClient.db.collection('users').findOne({ userId });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    return res.status(200).send({ email: user.email, userId });
  }
}

export default UsersController;
