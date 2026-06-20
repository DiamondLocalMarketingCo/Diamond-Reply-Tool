const { setCors, handleOptions, loadTraining } = require("./_lib");

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  const training = loadTraining();

  res.status(200).json({
    ok: true,
    styleGuideLoaded: Boolean(training.styleGuide),
    examplesLoaded: training.examples.length
  });
};
