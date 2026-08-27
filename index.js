require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
});

const app = express();
app.use(express.static('dist'));
app.use(express.json());

// Unknown endpoint middleware
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};
//

// Error middleware
const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformated id' });
  }

  next(error);
};
//

// Req log middleware
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);
//

app.get('/', (req, res) => {
  res.send('<h1>Olá Mundo</h1><p>Saudável</p>');
});

app.get('/api/persons', async (req, res) => {
  const persons = await Person.find({});
  res.json(persons);
});

app.get('/info', async (req, res) => {
  const data = new Date();
  const persons = await Person.find({});

  res.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${data}</p>`,
  );
});

app.get('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const personFound = await Person.findById(id).exec();

    if (personFound) {
      return res.json(personFound);
    }

    res.status(404).json({
      error: 'ID not found',
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    await Person.findByIdAndDelete(id).then((result) => {
      res.status(204).end();
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/persons', async (req, res, next) => {
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({ error: 'name is missing' });
  }

  try {
    const existingPerson = await Person.findOne({ name: body.name }).exec();

    if (existingPerson) {
      return res.status(400).json({ error: 'name must be unique' });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    const savedPerson = await person.save();

    return res.json(savedPerson);
  } catch (error) {
    next(error);
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;
  const { name, number } = req.body;

  try {
    const personFound = await Person.findById(id).exec();

    if (!personFound) {
      return res.status(404).end();
    }

    personFound.name = name;
    personFound.number = number;

    const savedPerson = await personFound.save();

    return res.json(savedPerson);
  } catch (error) {
    next(error);
  }
});

app.use(unknownEndpoint);

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
