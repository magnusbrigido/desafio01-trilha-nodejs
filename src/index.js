const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user)
    return response.status(404).json({ error: "User not found" });

  request.user = user;

  return next();
}

function getTodoIndex(request, response, next){
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex(todo => todo.id === id);
  
  if(index < 0 || index > user.todos.length){
    return response.status(404).json({ error: "Todo does not exist" });
  }

  request.index = index;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if(users.find(user => user.username === username))
    return response.status(400).json({ error: "Username already exist" })

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, getTodoIndex, (request, response) => {
  const { user, index } = request;
  const { title, deadline } = request.body;
  
  user.todos[index].title = title;
  user.todos[index].deadline = new Date(deadline);
  
  return response.status(201).send(user.todos[index]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, getTodoIndex, (request, response) => {
  const { user, index } = request;

  user.todos[index].done = true;

  return response.status(201).send(user.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, getTodoIndex, (request, response) => {
  const { user, index } = request;

  user.todos.splice(index, 1);

  return response.status(204).json(user);
});

module.exports = app;