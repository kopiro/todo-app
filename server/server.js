const PORT = process.env.PORT ?? 8000;
const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

const authMiddleware = async (req, res, next) => {
  const token = req.headers["x-token"];
  if (!token) return res.status(401).json({ detail: "Token not present" });
  try {
    const { email } = await jwt.verify(token, process.env.JWT_SECRET);
    req.email = email;
    await next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ detail: "Unauthorized" });
  }
};

/* ------------------- GET ELEMENT FROM DATABASE ----------------------*/
app.get("/todos", authMiddleware, async (req, res) => {
  try {
    // qui stai autorizzando l'utente ad accedere alla sua todos
    const todos = await pool.query("SELECT * FROM todos WHERE user_email=$1", [
      req.email,
    ]);
    res.json(todos.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/* ------------------- POST / INSERT A NEW ELEMENT TO DATABASE   
(Quando qualcuno fa una post dal lato client, segue questo codice qui)
----------------------*/
app.post("/todos", authMiddleware, async (req, res) => {
  const { title, progress, date } = req.body;
  const id = uuidv4();

  try {
    const newToDo = await pool.query(
      `INSERT INTO todos(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5)`,
      [id, req.email, title, progress, date]
    );
    // return new to do response
    res.json(newToDo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

/* ------------------- EDIT AN ELEMENT AND SEND IT TO DATABASE ----------------------*/
app.put("/todos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const todo = await pool.query("SELECT * FROM todos WHERE id=$1", [id]);
    if (!todo) return res.status(404).json({ detail: "Not found" });

    if (todo.rows[0].user_email !== req.email) {
      return res
        .status(401)
        .json({ detail: "You're not authorized to modify this resource" });
    }

    const { title, progress, date } = req.body;

    const editToDo = await pool.query(
      "UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id= $5",
      [req.email, title, progress, date, id]
    );
    res.json(editToDo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

/* ------------------- DELETE AN ELEMENT AND UPDATE THE DATABASE ----------------------*/
app.delete("/todos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const todo = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    if (!todo) return res.status(404).json({ detail: "Not found" });

    if (todo.rows[0].user_email !== req.email) {
      return res
        .status(401)
        .json({ detail: "You're not authorized to delete this resource" });
    }

    const deleteToDo = await pool.query("DELETE FROM todos WHERE id = $1", [
      id,
    ]);
    res.json(deleteToDo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

/* ------------------- SIGN UP  ----------------------*/
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ detail: "Invalid email" });

  try {
    const signUp = await pool.query(
      "INSERT INTO users (email, hashed_password) VALUES($1, $2)",
      [email, hashedPassword]
    );
    if (signUp.rowCount === 0)
      return res.status(500).json({ detail: "Sign up failed" });
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1hr",
    });
    res.json({ email, token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

/* ------------------- LOGIN  ----------------------*/
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ detail: "Invalid email" });

  try {
    const users = await pool.query("SELECT * FROM users WHERE email =$1", [
      email,
    ]);
    if (!users.rows.length)
      return res.status(404).json({ detail: "User does not exist!" });
    const success = await bcrypt.compare(
      password,
      users.rows[0].hashed_password
    );
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1hr",
    });
    if (success) {
      res.json({ email: users.rows[0].email, token });
    } else {
      res.json({ detail: "Login failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
