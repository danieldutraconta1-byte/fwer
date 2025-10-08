const Aluno = require("../models/Aluno");

exports.createAluno = async (req, res) => {
  try {
    const newAluno = new Aluno(req.body);
    const aluno = await newAluno.save();
    res.status(201).json(aluno);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAlunos = async (req, res) => {
  try {
    const alunos = await Aluno.find();
    res.json(alunos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAlunoById = async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.id);
    if (!aluno) return res.status(404).json({ message: "Aluno not found" });
    res.json(aluno);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAluno = async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!aluno) return res.status(404).json({ message: "Aluno not found" });
    res.json(aluno);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAluno = async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);
    if (!aluno) return res.status(404).json({ message: "Aluno not found" });
    res.json({ message: "Aluno deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

