import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(request, response) {
    try {
      const { email, password } = request.body;
      if (!email) return response.status(400).json({ error: 'Missing email' });
      if (!password)
        return response.status(400).json({ error: 'Missing password' });

      const user = await dbClient.getUser({ email });
      if (!user) return response.status(400).json({ error: 'Unauthorized' });

      if (user.password !== sha1(password))
        return response.status(400).json({ error: 'Unauthorized' });

      const userId = user.userId;
      const userToken = uuidv4();
      await redisClient.set(`auth_${userToken}`, userId, 86400);

      return response.status(200).json({ userToken });
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: 'Server error' });
    }
  }

  static async getDisconnect(request, response) {
    try {
      const userToken = request.header('X-Token');
      if (!userToken) response.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${userToken}`);
      if (!userId) response.status(401).json({ error: 'Unauthorized' });

      await redisClient.del(`auth_${userToken}`);
      response.status(204).end();
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: 'Server error' });
    }
  }
}

export default AuthController;
