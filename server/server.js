require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const service = require("./src/service");
const logger = require("./utils/logger");

const app = express();
const PORT = 5000;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Reddit Newsletter API",
      description: "",
      contact: {
        name: "Afshan Aman"
      },
      servers: ["http://localhost:5000"],
      version: "1.0.1"
    }
  },
  apis: ["./src/router.js"]
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

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

app.listen(PORT, () => {
  logger.info(`
      App is Listening on:
      ENV: ${process.env.NODE_ENV}
      URL: http://localhost:${PORT}
      API Documentation: http://localhost:${PORT}/api-docs/`);

  service.setSchedules();
});
