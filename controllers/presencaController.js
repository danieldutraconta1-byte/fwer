const Presenca = require("../models/Presenca");

exports.createPresenca = async (req, res) => {
  try {
    const newPresenca = new Presenca(req.body);
    const presenca = await newPresenca.save();
    res.status(201).json(presenca);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPresencas = async (req, res) => {
  try {
    const presencas = await Presenca.find().populate("aluno").populate("sala");
    res.json(presencas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPresencaById = async (req, res) => {
  try {
    const presenca = await Presenca.findById(req.params.id).populate("aluno").populate("sala");
    if (!presenca) return res.status(404).json({ message: "Presenca not found" });
    res.json(presenca);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePresenca = async (req, res) => {
  try {
    const presenca = await Presenca.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!presenca) return res.status(404).json({ message: "Presenca not found" });
    res.json(presenca);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePresenca = async (req, res) => {
  try {
    const presenca = await Presenca.findByIdAndDelete(req.params.id);
    if (!presenca) return res.status(404).json({ message: "Presenca not found" });
    res.json({ message: "Presenca deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

