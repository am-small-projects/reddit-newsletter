require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("express-handlebars");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const service = require("./src/service");
const logger = require("./utils/logger");

const app = express();
const PORT = 5000;

// Swagger Setup
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Reddit Newsletter API",
      description: "",
      contact: {
        name: "Afshan Aman"
      },
      servers: ["http://localhost:5000"],
      version: "1.0.0"
    }
  },
  apis: ["./src/router.js"]
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);

// set view engine to handlebars
app.set("views", path.join(__dirname, "./views"));
app.engine("handlebars", hbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// set path for fixtures
app.use(express.static(path.join(__dirname, "./public")));

// Middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/", require("./src/router"));

// final error handling
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Start the server, and store the reference in server
let server = app.listen(PORT, () => {
  logger.info({
    Welcome: "The Reddit Newsletter App is running",
    ENV: process.env.NODE_ENV,
    URL: `http://localhost:${PORT}`,
    API_Documentation: `http://localhost:${PORT}/api-docs/`,
    DB_Connection: process.env.DATABASE_URL || "",
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || ""
  });

  // setup cron jobs for all timezones with the existing recipients list
  service.newsletterService();
});

// export the server for testing purposes
module.exports = server;
