const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");

process.env.TZ = "Etc/UTC";

const app = express();

app.use(cors());
app.use(bodyParser.json());

let items = [];
let itemId = 0;

const validateItem = () => {
  const statusList = ["todo", "doing", "done"];
  return [
    body("name").notEmpty().withMessage("name is required").isString().withMessage("name must be a valid string"),
    body("description").notEmpty().withMessage("description is required").isString().withMessage("description must be a valid string"),
    body("dueDate").notEmpty().withMessage("dueDate is required").isDate().withMessage("dueDate must be a valid date"),
    body("status")
      .notEmpty()
      .withMessage("status is required")
      .isString()
      .withMessage("status must be a valid string")
      .isIn(statusList)
      .withMessage(`status must be one of ${statusList.join(", ")}`),
  ];
};

const findItem = (id) => {
  return items.find((item) => item.id == id);
};

app.use((req, res, next) => {
  if (req.headers["x-api-key"] != "JzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9") {
    res.sendStatus(401);
    return;
  }
  next();
});

app.get("/items", (req, res) => {
  const statusFilter = req.query["status"];
  if (statusFilter) {
    res.json(items.filter((item) => item.status == statusFilter));
    return;
  }
  res.json(items);
});

app.get("/items/:id", (req, res) => {
  const id = req.params["id"];
  const item = findItem(id);
  if (!item) {
    res.sendStatus(404);
    return;
  }
  res.json(item);
});

app.post("/items", validateItem(), (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(422).send(result);
    return;
  }

  const name = req.body.name;
  const description = req.body.description;
  const dueDate = new Date(req.body.dueDate);
  const status = req.body.status;

  const id = itemId + 1;
  itemId++;
  const item = {
    id: id,
    name: name,
    description: description,
    status: status,
    creationDate: new Date(),
    dueDate: dueDate,
  };
  items.push(item);

  res.json(item);
});

app.put("/items/:id", validateItem(), (req, res) => {
  const id = req.params["id"];
  const item = findItem(id);
  if (!item) {
    res.sendStatus(404);
    return;
  }

  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(422).send(result);
    return;
  }

  const name = req.body.name;
  const description = req.body.description;
  const dueDate = new Date(req.body.dueDate);
  const status = req.body.status;

  item.name = name;
  item.description = description;
  item.dueDate = dueDate;
  item.status = status;

  res.json(item);
});

app.delete("/items/:id", (req, res) => {
  const id = req.params["id"];
  const item = findItem(id);
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
