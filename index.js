import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

// sets up the app and port
const app = express();
const port = 3000;

// sets up the postgres database
const db = new pg.Client({
  user: "postgres",
  database: "crudcapstone",
  password: "Ojiugo11",
  port: 5432,
  host: "localhost",
});

db.connect();

// sets up bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// initializes book array, postgres ORDER constraint and SORT field
let toDo = [];
let ORDER = "rating";
let SORT = "DESC";

// homepage route
app.get("/", async (req, res) => {
  const name = "MAZI CHIADI MBIBI";
  const heading = "BOOKS I'VE READ";

  // queries database and order the result sorting with specified field
  try {
    const result = await db.query(
      `SELECT to_char(read_on, 'yyyy-mm-dd') as dated, * FROM covers JOIN books ON covers.isbn = books.isbn ORDER BY ${ORDER} ${SORT}`
    );
    // returns the array of records  and renders to index.ejs
    toDo = result.rows;
    res.render("index.ejs", { bookList: toDo, name: name, heading: heading });
  } catch (error) {
    // renders error to user
    res.render("index.ejs", {
      error: error.message,
      suggestion:
        "Book not found; check your inputs making sure they are valid and retry. Check your internet connection too",
    });
  }
});

// queries the url to determing the field to base sorting on
app.get("/sort", (req, res) => {
  if (req.query.rating === "myRating") {
    ORDER = "rating";
    SORT = "DESC";
  }
  if (req.query.recency === "readOn") {
    ORDER = "read_on";
    SORT = "DESC";
  }
  if (req.query.author === "writer") {
    ORDER = "author";
    SORT = "ASC";
  }
  res.redirect("/");
});

// gets/renders the add new book form
app.get("/add", function (req, res) {
  res.render("addNote.ejs", { BookList: toDo });
});

// inserts data, including successfully fetched ones from API into db
app.post("/add", async (req, res) => {
  // destructure names from http body
  const { isbn, author, title, descriptions, rating, read_on } = req.body;
  // fetches book cover
  try {
    const result = await axios.get(
      `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg?default=false`
    );
    // inserts data to books table and covers table
    try {
      await db.query(
        "INSERT INTO books (isbn, author, title, descriptions, rating, read_on) VALUES($1, $2, $3, $4, $5, $6)",
        [isbn, author, title, descriptions, rating, read_on]
      );
      await db.query("INSERT INTO covers (isbn, imageurl) VALUES($1, $2)", [
        isbn,
        result.config.url,
      ]);

      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (error) {
    // const err = new Error("failed to fetch book cover");
    // console.log(error.response.config.url);
    // console.log(error.config.url);
    // console.log(error.response.data);
    // console.log(error.response.status);
    // console.log(error.response.statusText);
    if (error.response.status === 404) {
      // gets the url from res
      const url = error.response.config.url;
      // inserts the data into books and covers tables with covers as blank
      try {
        await db.query(
          "INSERT INTO books (isbn, author, title, descriptions, rating, read_on) VALUES($1, $2, $3, $4, $5, $6)",
          [isbn, author, title, descriptions, rating, read_on]
        );
        await db.query("INSERT INTO covers (isbn, imageurl) VALUES($1, $2)", [
          isbn,
          url,
        ]);

        res.redirect("/");
      } catch (err) {
        console.log(err);
      }
    }
  }
});

// edit records in database
app.post("/edit", async (req, res) => {
  // destructure some variables from request body (edit form section)
  const {
    editedBookId,
    editedBookAuthor,
    editedBookTitle,
    editedBookDescriptions,
    editedBookRating,
    editedBookReadOn,
  } = req.body;

  // update database using UPDATE
  try {
    db.query(
      "UPDATE books SET title = ($1), author = ($2), descriptions = ($3), rating = ($4), read_on = ($5) WHERE book_id = ($6)",
      [
        editedBookTitle,
        editedBookAuthor,
        editedBookDescriptions,
        editedBookRating,
        editedBookReadOn,
        editedBookId,
      ]
    );

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.render("index.ejs", {error: "Check your values and retry"})
  }
});

// delete a record from database
app.post("/delete", async (req, res) => {
  // destructure the id in the id field
  const { bookId } = req.body;
  // delete the record for the id field
  try {
    db.query("DELETE FROM books WHERE book_id = $1", [bookId]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
