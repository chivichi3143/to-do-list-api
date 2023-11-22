const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

let items = [];
let itemId = 0;

app.use((req, res, next) => {
  if (req.headers["x-api-key"] != "JzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9") {
    res.sendStatus(401);
    return;
  }
  next();
});

app.get("/items", (req, res) => {
  const doneFilter = req.query["done"];
  if (doneFilter) {
    res.json(items.filter((item) => item.done.toString() == doneFilter));
    return;
  }
  res.json(items);
});

app.get("/items/:id", (req, res) => {
  const id = req.params["id"];
  const item = items.find((item) => item.id == id);
  if (!item) {
    res.sendStatus(404);
    return;
  }
  res.json(item);
});

app.post("/items", (req, res) => {
  const name = req.body.name;
  if (!name || typeof name != "string") {
    res.sendStatus(422);
    return;
  }

  const id = itemId + 1;
  itemId++;
  const item = {
    id: id,
    name: name,
    done: false,
  };
  items.push(item);

  res.json(item);
});

app.put("/items/:id", (req, res) => {
  const id = req.params["id"];
  const item = items.find((item) => item.id == id);
  if (!item) {
    res.sendStatus(404);
    return;
  }

  const name = req.body.name;
  const done = req.body.done;
  if (!name || typeof name != "string" || typeof done != "boolean") {
    res.sendStatus(422);
    return;
  }

  item.name = name;
  item.done = done;

  res.json(item);
});

app.delete("/items/:id", (req, res) => {
  const id = req.params["id"];
  const item = items.find((item) => item.id == id);
  if (!item) {
    res.sendStatus(404);
    return;
  }
  items = items.filter((item) => item.id != id);
  res.sendStatus(200);
});

const port = 8000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
