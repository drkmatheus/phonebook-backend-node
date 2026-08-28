const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
const url = process.env.MONGODB_URI;

console.log('Connecting to', url);

mongoose
  .connect(url, { family: 4 })
  .then((result) => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error: ', error);
  });

const personSchema = new mongoose.Schema({
  name: { type: String, minLength: 5, required: true },
  number: {
    type: String,
    validate: {
      validator: (v) => {
        return /\d{2}-\d{4}-\d{4}/.test(v);
      },
    },
    required: true,
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
