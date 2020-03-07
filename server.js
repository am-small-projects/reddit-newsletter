const express = require('express')
const app = express()
const PORT = 3000;

app.use('/simple', require('./router.simple'))

// final error handling
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.listen(PORT, () => {
    console.log(`
      App is Listening on port ${PORT}
      ENV: ${process.env.NODE_ENV}
      URL: http://localhost:${PORT}`);
  });