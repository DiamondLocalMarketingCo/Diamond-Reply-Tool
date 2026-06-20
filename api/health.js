const { setCors, handleOptions } = require("./_lib");

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  res.status(200).json({
    ok: true,
    service: "Diamond Reply Tool API",
    timestamp: new Date().toISOString()
  });
};
