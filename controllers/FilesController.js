import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(request, response) {
    try {
      const { name, type, parentId, isPublic, data } = request.body;
      const token = request.header('X-Token');
      if (!token) return response.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return response.status(401).json({ error: 'Unauthorized' });

      if (!name) return response.status(400).json({ error: 'Missing name' });
      if (!type) return response.status(400).json({ error: 'Missing type' });
      if (!data) return response.status(400).json({ error: 'Missing data' });

      const parent = parentId ? await dbClient.get('files', parentId) : null;
      if (parentId && !parent)
        return response.status(400).json({ error: 'Parent not found' });

      const file = {
        userId,
        name,
        type,
        parentId,
        isPublic: isPublic || false,
        data,
      };

      const result = await dbClient.create('files', file);
      return response.status(201).json(result);
    } catch (err) {
      console.log(err);
      return response.status(500).json({ error: 'Server error' });
    }
  }

  static async getIndex(request, response) {
    try {
      const token = request.header('X-Token');
      if (!token) return response.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return response.status(401).json({ error: 'Unauthorized' });

      const files = await dbClient.get('files', { userId });
      return response.status(200).json(files);
    } catch (err) {
      console.log(err);
      return response.status(500).json({ error: 'Server error' });
    }
  }

  static async getShow(request, response) {
    try {
      const { id } = request.params;
      const token = request.header('X-Token');
      if (!token) return response.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return response.status(401).json({ error: 'Unauthorized' });

      const file = await dbClient.get('files', id);
      if (!file) return response.status(404).json({ error: 'Not found' });

      if (file.userId !== userId && !file.isPublic)
        return response.status(403).json({ error: 'Forbidden' });

      return response.status(200).json(file);
    } catch (err) {
      console.log(err);
      return response.status(500).json({ error: 'Server error' });
    }
  }

  static async putPublish(request, response) {
    try {
      const { id } = request.params;
      const token = request.header('X-Token');
      if (!token) return response.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return response.status(401).json({ error: 'Unauthorized' });

      const file = await dbClient.get('files', id);
      if (!file) return response.status(404).json({ error: 'Not found' });

      if (file.userId !== userId)
        return response.status(403).json({ error: 'Forbidden' });

      const updatedFile = await dbClient.update('files', id, {
        isPublic: true,
      });
      return response.status(200).json(updatedFile);
    } catch (err) {
      console.log(err);
      return response.status(500).json({ error: 'Server error' });
    }
  }

  static async putUnpublish(request, response) {
    try {
      const { id } = request.params;
      const token = request.header('X-Token');
      if (!token) return response.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return response.status(401).json({ error: 'Unauthorized' });

      const file = await dbClient.get('files', id);
      if (!file) return response.status(404).json({ error: 'Not found' });

      if (file.userId !== userId)
        return response.status(403).json({ error: 'Forbidden' });

      const updatedFile = await dbClient.update('files', id, {
        isPublic: false,
      });
      return response.status(200).json(updatedFile);
    } catch (err) {
      console.log(err);
      return response.status(500).json({ error: 'Server error' });
    }
  }

  static async getFile(request, response) {
    try {
      const { id } = request.params;
      const token = request.header('X-Token');
      if (!token) return response.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return response.status(401).json({ error: 'Unauthorized' });

      const file = await dbClient.get('files', id);
      if (!file) return response.status(404).json({ error: 'Not found' });

      if (file.userId !== userId && !file.isPublic)
        return response.status(403).json({ error: 'Forbidden' });

      const buff = Buffer.from(file.data, 'base64');
      response.status(200).send(buff);
    } catch (err) {
      console.log(err);
      return response.status(500).json({ error: 'Server error' });
    }
  }
}

export default FilesController;
