function healthCheckController(req, res) {
  return res.status(200).send("api is ok!");
}

export { healthCheckController };
