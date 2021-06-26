const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const app = express();
const database = require('./util/database');
const user = require('./routes/user');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users/v1_0', user);


database.getConnection().then(() => {
  console.log('Database ewali connected');
  app.listen(port, () => {
    console.log('Server ewali is listening to port ' + port);
  });
}).catch(err => console.log('Error connecting database'));