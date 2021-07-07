const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const auth = require("./auth");
const { json } = require("body-parser");
const querystring = require('querystring');
// execute database connection
dbConnect();
app.use ((req, res, next) => {
  res.locals.url = req.originalUrl.params;
  res.locals.host = req.get('host');
  res.locals.protocol = req.protocol;
  next();
});

app.use(express.static('public'));
app.engine('html', require('ejs').renderFile);
// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/apply/:jobName", function (req, res) {
  res.render("loginapply.ejs");
  // Qs = querystring.stringify(req.params);
  // console.log(Qs);
  // temp=req.params;
  
});



app.post("/apply/:job", (request, response) => {
 
  const {job}=request.params;
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords do not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );
          if (response.statusCode == 200) {
            User.findOne({email:user.email}).then(user.jobsAppliedFor.push(job)).then(user.save())

            response.render("applied.html");
          }
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            //token,
            name: user.name,
            JobsApplied: user.jobsAppliedFor,
            DOB: user.dob,
          });
        })
        // catch error if password do not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});


app.get("/home.html", function (req, res) {
  res.render("home.html");
});
app.get("/events.html", function (req, res) {
  res.render("events.html");
});

app.get("/resources.html", function (req, res) {
  res.render("resources.html");
});
app.get("/jobs", function (req, res) {
  res.render("jobs.html");
});
app.get("/", function (req, res) {
  res.render("jobs.html");
});

app.get("/login.html", function (req, res) {
  res.render("login.html");
});

app.get("/register.html", function (req, res) {
  res.render("register.html");
});

app.get('/verify/:password', async (req, res) => {
  const { password } = req.params
  const user = await User.findOne({ password: password })
  if (user) {
    user.isValid = true
    await user.save()
    res.redirect('/home.html')
  } else {
    res.json('user not found')
  }
});


// register endpoint
app.post("/register", async (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
        name: request.body.name,
        dob: request.body.dob,
        isValid: false,
      });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sqrt4916253649@gmail.com',
          pass: 'squareroot'
        }
      });

      // email options
      let mailOptions = {
        from: 'sqrt4916253649@gmail.com',
        to: user.email,
        subject: 'subject',
        html: `Press <a href="http://localhost:3000/verify/${user.password}"> here </a>`
      };

      // send email
      transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
          console.log(error);
        }
        console.log(response)
      });
      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            // result,
          });
        })
        // catch erroe if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// login endpoint
app.post("/myspace", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          // response.status(200).render("temp.ejs");
          //return success response
          // User.find({}, function(err, users) {
          response.status(200).render("myspace.ejs", { users: user });
          //});
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            //token,
            name: user.name,
            JobsApplied: user.jobsAppliedFor,
            DOB: user.dob,
          });
        })
        // catch error if password do not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.send({ message: "You are authorized to access me" });
});

module.exports = app;
