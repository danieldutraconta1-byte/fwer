const PerguntaAluno = require("../models/PerguntaAluno");

exports.createPerguntaAluno = async (req, res) => {
  try {
    const newPerguntaAluno = new PerguntaAluno(req.body);
    const perguntaAluno = await newPerguntaAluno.save();
    res.status(201).json(perguntaAluno);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPerguntasAluno = async (req, res) => {
  try {
    const perguntasAluno = await PerguntaAluno.find().populate("aluno").populate("sala");
    res.json(perguntasAluno);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPerguntaAlunoById = async (req, res) => {
  try {
    const perguntaAluno = await PerguntaAluno.findById(req.params.id).populate("aluno").populate("sala");
    if (!perguntaAluno) return res.status(404).json({ message: "PerguntaAluno not found" });
    res.json(perguntaAluno);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePerguntaAluno = async (req, res) => {
  try {
    const perguntaAluno = await PerguntaAluno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!perguntaAluno) return res.status(404).json({ message: "PerguntaAluno not found" });
    res.json(perguntaAluno);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePerguntaAluno = async (req, res) => {
  try {
    const perguntaAluno = await PerguntaAluno.findByIdAndDelete(req.params.id);
    if (!perguntaAluno) return res.status(404).json({ message: "PerguntaAluno not found" });
    res.json({ message: "PerguntaAluno deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

