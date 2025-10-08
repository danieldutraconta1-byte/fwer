const Pergunta = require("../models/Pergunta");

exports.createPergunta = async (req, res) => {
  try {
    const newPergunta = new Pergunta(req.body);
    const pergunta = await newPergunta.save();
    res.status(201).json(pergunta);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPerguntas = async (req, res) => {
  try {
    const perguntas = await Pergunta.find().populate("quiz");
    res.json(perguntas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPerguntaById = async (req, res) => {
  try {
    const pergunta = await Pergunta.findById(req.params.id).populate("quiz");
    if (!pergunta) return res.status(404).json({ message: "Pergunta not found" });
    res.json(pergunta);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePergunta = async (req, res) => {
  try {
    const pergunta = await Pergunta.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pergunta) return res.status(404).json({ message: "Pergunta not found" });
    res.json(pergunta);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePergunta = async (req, res) => {
  try {
    const pergunta = await Pergunta.findByIdAndDelete(req.params.id);
    if (!pergunta) return res.status(404).json({ message: "Pergunta not found" });
    res.json({ message: "Pergunta deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

