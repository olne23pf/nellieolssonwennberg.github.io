//LOGIN AS THE ADMIN:
const adminName = "nellie";
//const adminPassword = "1234";
//const adminPassword = "$2b$12$GMh7liGIej8V1B4XHiZM4u/45htzmo/OfqHjCKzAko49qdxTLYwo.";

//const bcrypt = require("bcrypt");
//salt round for bcrypt algorithm
//const saltRounds = 12;

//run this code ONLY ONCE
/*
bcrypt.hash(adminPassword, saltRounds, function (err, hash) {
  if (err) {
    console.log("---> Error encrypting the password: ", err);
  } else {
    console.log("---> Hashed password (GENERATE only ONCE): ", hash);
  }
});*/

//-----------
// DATABASE
//-----------
const express = require("express");
const port = 8080;
const app = express();
/*const path = require("path");
const fs = require("fs");*/
const sqlite3 = require("sqlite3");
const dbFile = "my-project-data.sqlite3.db";
const db = new sqlite3.Database(dbFile);

const { engine } = require("express-handlebars"); //load the handlebars package for express
const bodyParser = require("body-parser"); //required to get data from POST forms
const session = require("express-session"); //sessions in express
const connectSqlite3 = require("connect-sqlite3"); //store the sessions in a SQlite3 database file

//-----------
// SESSIONS
//-----------
const SQliteStore = connectSqlite3(session); //store sessions in the database
/*
projects.sort((a, b) => {
  const order = { 1: 1, 8: 2, 2: 3, 3: 4, 4: 5, 6: 6, 7: 7 };
  return order[a.pid] - order[b.pid];
});*/

app.use(
  session({
    store: new SQliteStore({ db: "session-db.db" }),
    saveUninitialized: false,
    resave: false,
    secret: "This123Is@Another#456GreatSecret678%Sentence",
  })
);
app.use(function (req, res, next) {
  console.log("Session passed to response locals...");
  res.locals.session = req.session;
  next();
});
app.use(express.static("public")); //make everything public in the directory public
app.use(bodyParser.urlencoded({ extended: true }));

//-----------
// ROUTES
//-----------
app.get("/", function (req, res) {
  const model = {
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  };
  console.log("---> Home model: " + JSON.stringify(model));
  res.render("home.handlebars", model);
});

app.get("/about", function (req, res) {
  db.all("SELECT * FROM skills", (error, listOfSkills) => {
    if (error) {
      console.log("ERROR: ", error);
    } else {
      model = { skills: listOfSkills };
      res.render("about.handlebars", model);
    }
  });
});

app.get("/contact", function (req, res) {
  res.render("contact.handlebars");
});

app.get("/projectsarkviz", function (req, res) {
  const page = req.query.page || 1;
  const limit = 3;
  const offset = (page - 1) * limit;
  //ChatGPT
  //source: (ChatGPT, 2024, "help with creating next and previous page", https://chatgpt.com/share/66ffc07f-3fe4-800f-b7b8-0a2f0dfeeef1)
  const nextPage = parseInt(page) + 1;
  const previousPage = page > 1 ? page - 1 : null; // Set previousPage if not on the first page

  const query = `
  SELECT * FROM projectsarkviz
  LIMIT ? OFFSET ?;
`;
  // Execute the query
  const queryParams = [limit, offset];

  db.all(query, queryParams, (err, projectsarkviz = []) => {
    if (err) {
      console.error("Error fetching projects:", err);
      return res.status(500).send("Error retrieving projects.");
    }
    const hasNextPage = projectsarkviz.length === limit;

    res.render("projectsarkviz.handlebars", {
      projectsarkviz,
      page,
      nextPage,
      previousPage,
      hasNextPage,
    });
  });
});

app.get("/projectsarkviz/:projectid", function (req, res) {
  console.log(
    "Project route parameter projectid: " + JSON.stringify(req.params.projectid)
  );
  db.get(
    "SELECT * FROM projectsarkviz WHERE paid=?",
    [req.params.projectid],
    (error, theProject) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        const model = {
          project: theProject,
        };
        res.render("projectav.handlebars", model);
      }
    }
  );
});

app.get("/projects", function (req, res) {
  //const page = req.query.page || 1;
  // const limit = 3;
  //const offset = (page - 1) * limit;
  //ChatGPT
  //source: (ChatGPT, 2024, "help with creating next and previous page", https://chatgpt.com/share/66ffc07f-3fe4-800f-b7b8-0a2f0dfeeef1)
  //const nextPage = parseInt(page) + 1;
  //const previousPage = page > 1 ? page - 1 : null; // Set previousPage if not on the first page

  //ChatGPT
  //source: (ChatGPT, 2024, "How i created the filter function with categories", https://chatgpt.com/share/6704fe69-c440-8011-bf39-2b8e869ba1ed)
  const selectedCid = req.query.cid; // Get the selected category ID from the query

  //ChatGPT
  //source: (ChatGPT, 2024, "innerjoin with group_concat so filterfunction works", https://chatgpt.com/share/6704f5bc-32f4-8011-ae5a-218b10521456)
  const query = `
  SELECT projects.*, GROUP_CONCAT(categorie.ctitle) AS categories
    FROM projects
    INNER JOIN projects_categories ON projects.pid = projects_categories.pid
    INNER JOIN categorie ON categorie.cid = projects_categories.cid
    ${selectedCid ? `WHERE categorie.cid = ?` : ""} 
    GROUP BY projects.pid;
`;

  const queryParams = selectedCid
    ? [selectedCid, limit, offset]
    : [limit, offset];

  const categoriesQuery = `SELECT * FROM categorie`;

  db.all(query, queryParams, (err, projects = []) => {
    db.all(categoriesQuery, [], (err, categories = []) => {
      const hasNextPage = projects.length === limit;
      res.render("projects.handlebars", {
        projects,
        page,
        nextPage,
        previousPage,
        hasNextPage,
        categories, // Pass categories to template
        selectedCid,
      });
    });
  });
});

app.get("/project/:projectid", function (req, res) {
  console.log(
    "Project route parameter projectid: " + JSON.stringify(req.params.projectid)
  );
  db.get(
    "SELECT * FROM projects WHERE pid=?",
    [req.params.projectid],
    (error, theProject) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        const model = {
          project: theProject,
        };
        res.render("project.handlebars", model);
      }
    }
  );
});
/*
app.get("/project/modify/:projid", function (req, res) {
  const id = req.params.projid;
  db.get("SELECT * FROM projects WHERE pid=?", [id], (error, theProject) => {
    if (error) {
      console.log("ERROR: ", error);
      res.redirect("/projects");
    } else {
      model = { project: theProject };
      res.render("project-new.handlebars", model);
    }
  });
});

app.get("/project/delete/:projid", function (req, res) {
  if (req.session.isAdmin) {
    console.log(
      "Project route parameter projid: " + JSON.stringify(req.params.projid)
    );

    //Inspiration from r.276 (deletedUid)
    const deletedPid = parseInt(req.params.projid, 10); // Get the uid from the URL and convert it to an integer

    db.serialize(() => {
      db.run(
        "DELETE FROM projects WHERE pid=?",
        [deletedPid],
        function (error) {
          if (error) {
            console.log("ERROR: ", error);
          }
          console.log(
            "The project " + req.params.projid + " has been deleted..."
          );

          db.run(
            "UPDATE projects SET pid = pid - 1 WHERE pid > ?",
            [deletedPid],
            function (updateError) {
              if (updateError) {
                console.log("ERROR: ", updateError);
                return res.status(500).send("Error updating project ids.");
              }

              console.log("Project ID have been updated.");
              res.redirect("/projects");
            }
          );
        }
      );
    });
  } else {
    res.redirect("/login");
  }
});*/
/*
app.get("/project-new", function (req, res) {
  res.render("project-new.handlebars");
});*/
/*
app.get("/login", (req, res) => {
  res.render("login.handlebars");
});*/
/*
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("error while destroying the session: ", err);
    } else {
      console.log("Logged out...");
      res.redirect("/");
    }
  });
});*/
/*
app.get("/userpage", function (req, res) {
  db.all("SELECT * FROM users", (error, listOfUsers) => {
    if (error) {
      console.log("ERROR: ", error);
    } else {
      model = { users: listOfUsers };
      res.render("userpage.handlebars", model);
    }
  });
});

app.get("/userpage/:uid", function (req, res) {
  console.log(
    "Userpage route parameter uid: " + JSON.stringify(req.params.uid)
  );
  db.get(
    "SELECT * FROM users WHERE uid=?",
    [req.params.uid],
    (error, theUser) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        const model = {
          user: theUser,
        };
        res.render("userpage.handlebars", model);
      }
    }
  );
});

app.get("/user/modify/:uid", function (req, res) {
  const id = req.params.uid;
  db.get("SELECT * FROM users WHERE uid=?", [id], (error, theUser) => {
    if (error) {
      console.log("ERROR: ", error);
      res.redirect("/userpage");
    } else {
      model = { user: theUser };
      res.render("modifyuser.handlebars", model);
    }
  });
});

app.get("/user/delete/:uid", function (req, res) {
  console.log("User route parameter uid: " + JSON.stringify(req.params.uid));

  //ChatGPT
  //source: (ChatGPT, 2024, "delete user without having a gap in the table", https://chatgpt.com/share/6702ef19-a4c8-8011-a8ee-9a86c874a42e)
  const deletedUid = parseInt(req.params.uid, 10); // Get the uid from the URL and convert it to an integer

  db.serialize(() => {
    db.run("DELETE FROM users WHERE uid=?", [deletedUid], function (error) {
      if (error) {
        console.log("ERROR: ", error);
      }
      console.log("The user " + req.params.uid + "has been deleted...");

      db.run(
        "UPDATE users SET uid = uid - 1 WHERE uid > ?",
        [deletedUid],
        function (updateError) {
          if (updateError) {
            console.log("ERROR: ", updateError);
            return res.status(500).send("Error updating user ids.");
          }

          console.log("User IDs have been updated.");
          res.redirect("/userpage");
        }
      );
    });
  });
});

app.get("/newuser", function (req, res) {
  res.render("newuser.handlebars");
});

// User table!
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (uid INTEGER PRIMARY KEY, username TEXT, password TEXT)"
  );
});
app.get("/register", (req, res) => {
  res.render("register.handlebars");
});*/

//HANDLEBARS
//handlebars "ifeq" and "ifnoteq" from source: (Pablo, varando, https://stackoverflow.com/questions/34252817/handlebarsjs-check-if-a-string-is-equal-to-a-value, 2018)
app.engine(
  "handlebars",
  engine({
    helpers: {
      eq(a, b) {
        return a == b;
      },
    },
  })
);
app.set("view engine", "handlebars"); //set handlebars as the view engine
app.set("views", "./views"); //define the views directory to be ./views
/*
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        res.status(500).send("Server error");
      } else if (!user) {
        const model = {
          error: "Username not found",
          message: "",
        };
        res.status(400).render("login.handlebars", model);
      } else {
        const result = await bcrypt.compare(password, user.password);
        if (result && adminName === username) {
          req.session.isAdmin = true;
          req.session.isLoggedIn = true;
          req.session.user = user; // Store the user in the session

          res.redirect("/");
        } else if (result) {
          req.session.isAdmin = false;
          req.session.isLoggedIn = true;
          req.session.user = user;

          res.redirect("/");
        } else {
          const model = {
            error: "Wrong password",
            message: "",
          };
          res.status(400).render("login.handlebars", model);
        }
      }
    }
  );
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 14);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hash],
    (err) => {
      if (err) {
        res.status(500).send("Server error");
      } else {
        res.redirect("/login");
      }
    }
  );
});


//add new user in user management
app.post("/newuser", async (req, res) => {
  const { username, password } = req.body;
  const id = req.body.uid;
  const hash = await bcrypt.hash(password, 14);

  db.run(
    "INSERT INTO users (username, password, uid) VALUES (?, ?, ?)",
    [username, hash, id],
    (err) => {
      if (err) {
        res.status(500).send("Server error");
      } else {
        res.redirect("/userpage");
      }
    }
  );
});

app.post("/project-new", function (req, res) {
  const title = req.body.projtitle;
  const date = req.body.projdate;
  const desc = req.body.projdesc;
  const url = req.body.projurl;
  const cid = req.body.projcid;

  db.run(
    "INSERT INTO projects (ptitle, pdate, pimgURL, pdesc, cid) VALUES (?, ?, ?, ?, ?)",
    [title, date, url, desc, cid],
    function (error) {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        //Code from ChatGPT - starts
        //source:(ChatGPT, 2024, "How to get the created pid and insert to projects_categories", https://chatgpt.com/share/6706b30b-172c-8011-8136-2eff9d28242e)
        db.get(
          "SELECT pid FROM projects WHERE ptitle = ? AND pdate = ? AND pimgURL = ? AND pdesc = ?",
          [title, date, url, desc],
          (err, row) => {
            if (err) {
              console.log("Error fetching pid: ", err);
            } else if (row) {
              const pid = row.pid;

              db.run(
                "INSERT INTO projects_categories (pid, cid) VALUES (?, ?)",
                [pid, cid],
                (error) => {
                  if (error) {
                    console.log("ERROR: ", error);
                  } else {
                    console.log("Project and category successfully linked!");
                    res.redirect("/projects");
                  }
                }
              );
              //Code from ChatGPT- ends
            }
          }
        );
      }
    }
  );
});

app.post("/project/modify/:projid", function (req, res) {
  const id = req.params.projid;
  const title = req.body.projtitle;
  const date = req.body.projdate;
  const desc = req.body.projdesc;
  const cid = req.body.projcid;
  // let urls = req.body["projurl[]"];

  /*
  // Logga inkommande data för felsökning
  console.log("Modifying project with ID:", id);
  console.log("Form data received:", req.body);

  // Om endast en bild är skickad, gör den till en array
  if (!Array.isArray(urls)) {
    urls = [urls];
  }
  // Konvertera bild-URL:erna till JSON-sträng för att spara i databasen
  const imagesJson = JSON.stringify(urls);*/
/*
  db.run(
    `UPDATE projects SET ptitle=?, pdate=?, pimgURL=?, pdesc=?, cid=? WHERE pid=?`,
    [title, date, url, desc, cid, id],
    (error) => {
      if (error) {
        console.log("ERROR: ", error);
        const model = {
          error: "Failed with modifying the project",
          message: "",
        };
        res.status(400).render("project.handlebars", model);
      } else {
        res.redirect("/projects");
      }
    }
  );
});

app.post("/user/modify/:uid", async function (req, res) {
  const id = req.params.uid;
  const username = req.body.username;
  const password = req.body.password;
  var newpw = await bcrypt.hash(password, 12);

  db.run(
    `UPDATE users SET username=?, password=? WHERE uid=?`,
    [username, newpw, id],
    (error) => {
      if (error) {
        console.log("ERROR: ", error);
        res.redirect("/userpage");
      } else {
        res.redirect("/userpage");
      }
    }
  );
});
*/
//-----------
// LISTEN
//-----------
app.listen(port, function () {
  //initTableSkills(db); //create the Skills table and populate it
  //initTableProjects(db); //create the project table and populate it
  //initTableCateogrie(db);
  //initTableProjectsCategories(db);
  //initTableProjectImages(db);
  console.log("Server up and running, listening on port + " + port + "...");
});

function initTableSkills(mydb) {
  const skills = [
    {
      id: "1",
      title: "PHP",
      course: "Programming language",
      date: "Programming with PHP on the server side.",
    },
    {
      id: "2",
      title: "PHP",
      course: "Programming language",
      date: "Programming with PHP on the server side.",
    },
    {
      id: "3",
      title: "PHP",
      course: "Programming language",
      date: "Programming with PHP on the server side.",
    },
    {
      id: "4",
      title: "PHP",
      course: "Programming language",
      date: "Programming with PHP on the server side.",
    },
    {
      id: "5",
      title: "PHP",
      course: "Programming language",
      date: "Programming with PHP on the server side.",
    },
    {
      id: "6",
      title: "PHP",
      course: "Programming language",
      date: "Programming with PHP on the server side.",
    },
    {
      id: "7",
      title: "PHP",
      course: "Programming language",
      date: "Programming with PHP on the server side.",
    },
    {
      id: "8",
      title: "PHP",
      course: "Programming language",
      date: "Programming with PHP on the server side.",
    },
    {
      id: "9",
      title: "PHP",
      course: "Programming language",
      date: "Programming with PHP on the server side.",
    },
  ];

  mydb.run(
    "CREATE TABLE skills (sid INTEGER PRIMARY KEY AUTOINCREMENT, sname TEXT NOT NULL, sdesc TEXT NOT NULL)",
    (error) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        console.log("---> Table projects created!");
        skills.forEach((oneSkill) => {
          db.run(
            "INSERT INTO skills (sid, sname, sdesc) VALUES (?, ?, ?)",
            [oneSkill.id, oneSkill.name, oneSkill.sdesc],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("Line added into the skills table!");
              }
            }
          );
        });
      }
    }
  );
}

function initTableProjectImages(mydb) {
  mydb.run(
    "CREATE TABLE project_images (id INTEGER PRIMARY KEY AUTOINCREMENT,project_id INTEGER,image_url TEXT,FOREIGN KEY (project_id) REFERENCES projects(pid)"
  );
}

function initTableCateogrie(mydb) {
  const categorie = [
    {
      id: "1",
      title: "Branding",
      course: "Graphic Design",
      date: "2023-10-2",
    },
    {
      id: "2",
      title: "Illustrations",
      course: "",
      date: "2023-09-21",
    },
    {
      id: "3",
      title: "Programming",
      course: "Fundamentals Of Programming",
      date: "2024-05-20",
    },
    {
      id: "4",
      title: "Print ads",
      course: "Visual Communication",
      date: "2024-04-10",
    },
  ];
  mydb.run(
    "CREATE TABLE IF NOT EXISTS categorie (cid INTEGER PRIMARY KEY AUTOINCREMENT, ctitle TEXT NOT NULL, ccourse TEXT NOT NULL, cdate TEXT NOT NULL, pid INTEGER, FOREIGN KEY (pid) REFERENCES projects(pid))",
    (error) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        console.log("---> Table projects created!");
        categorie.forEach((oneCategorie) => {
          db.run(
            "INSERT INTO categorie (cid, ctitle, ccourse, cdate) VALUES (?, ?, ?, ?)",
            [
              oneCategorie.id,
              oneCategorie.title,
              oneCategorie.course,
              oneCategorie.date,
            ],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("Line added into the categorie table!");
              }
            }
          );
        });
      }
    }
  );
}
function initTableProjects(mydb) {
  const projects = [
    {
      id: "1",
      title: "Comic Serie",
      desc: "",
      date: "08-03-2024",
      url: "/img/comicserie.jpg",
    },
    {
      id: "2",
      title: "ZONNE Magazine",
      desc: "",
      date: "15-05-2024",
      url: "/img/Mockup.jpg",
    },
    {
      id: "3",
      title: "Cloudy With A Chance Of Meatballs",
      desc: "",
      date: "25-05-2024",
      url: "/img/meatballgame.png",
    },
    {
      id: "4",
      title: "Gona Café",
      desc: "",
      date: "14-11-2023",
      url: "/img/brandingGona.jpg",
    },
    {
      id: "5",
      title: "Magazine Spreads",
      desc: "",
      date: "13-10-2023",
      url: "/img/pablopicasso.jpg",
    },
    {
      id: "6",
      title: "Title",
      desc: "",
      date: "date",
      url: "/img/pablopicasso.jpg",
    },
    {
      id: "7",
      title: "Title",
      desc: "",
      date: "date",
      url: "/img/pablopicasso.jpg",
    },
    {
      id: "8",
      title: "Title",
      desc: "",
      date: "date",
      url: "/img/pablopicasso.jpg",
    },
    {
      id: "9",
      title: "Title",
      desc: "",
      date: "date",
      url: "/img/pablopicasso.jpg",
    },
  ];

  mydb.run(
    "CREATE TABLE IF NOT EXISTS projects (pid	INTEGER, ptitle	TEXT NOT NULL, pdate	TEXT NOT NULL, pimgURL	TEXT NOT NULL, pdesc	TEXT, cid	INTEGER, PRIMARY KEY(pid), FOREIGN KEY(cid) REFERENCES categorie(cid))",
    (error) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        console.log("---> Table projects created!");
        projects.forEach((oneProject) => {
          db.run(
            "INSERT INTO projects (pid, ptitle, pdate, pimgURL, pdesc, cid) VALUES (?, ?, ?, ?, ?, ?)",
            [
              oneProject.id,
              oneProject.title,
              oneProject.date,
              oneProject.url,
              oneProject.desc,
              oneProject.cid,
            ],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("rows added into the projects table!");
              }
            }
          );
        });
      }
    }
  );
}
function initTableProjectsCategories(mydb) {
  const projects_categories = [
    {
      pid: "1",
      cid: "2",
    },
    {
      pid: "1",
      cid: "5",
    },
  ];
  //Code inspiration from geeksforgeeks
  //source: (geeksforgeeks, 2024, "many to many table", https://www.geeksforgeeks.org/relationships-in-sql-one-to-one-one-to-many-many-to-many/)
  mydb.run(
    "CREATE TABLE IF NOT EXISTS projects_categories (pid INT, cid INT, PRIMARY KEY (pid, cid), FOREIGN KEY (pid) REFERENCES projects(pid), FOREIGN KEY (cid) REFERENCES categorie(cid))",
    (error) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        console.log("---> Table projects_categories created!");

        projects_categories.forEach((oneProjectsCategories) => {
          db.run(
            "INSERT INTO projects_categories (pid, cid) VALUES (?, ?)",
            [oneProjectsCategories.pid, oneProjectsCategories.cid],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("rows added into the projects_categories table!");
              }
            }
          );
        });
      }
    }
  );
}
