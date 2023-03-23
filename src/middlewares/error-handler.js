function logError(err) {
  console.error(`error: ${err.message}, status: ${err.code}`);
}

function logErrorMiddleware(err, req, res, next) {
  logError(err);
  next(err);
}

function returnError(err, req, res, next) {
  if (res.headerSent) {
    return next(err);
  }

  res.status(err.code || 500);
  res.json({
    status: "Fail",
    msg: err.message || "An unknown error occurred !",
  });
}

module.exports = {
  logError,
  logErrorMiddleware,
  returnError,
};
