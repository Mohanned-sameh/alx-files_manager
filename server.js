import express from 'express';

const app = express();

app.use(express.json());

app.use(require('./routes/index'));

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
