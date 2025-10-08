const MaoLevantada = require("../models/MaoLevantada");

exports.createMaoLevantada = async (req, res) => {
  try {
    const newMaoLevantada = new MaoLevantada(req.body);
    const maoLevantada = await newMaoLevantada.save();
    res.status(201).json(maoLevantada);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMaosLevantadas = async (req, res) => {
  try {
    const maosLevantadas = await MaoLevantada.find().populate("aluno").populate("sala");
    res.json(maosLevantadas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMaoLevantadaById = async (req, res) => {
  try {
    const maoLevantada = await MaoLevantada.findById(req.params.id).populate("aluno").populate("sala");
    if (!maoLevantada) return res.status(404).json({ message: "MaoLevantada not found" });
    res.json(maoLevantada);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMaoLevantada = async (req, res) => {
  try {
    const maoLevantada = await MaoLevantada.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!maoLevantada) return res.status(404).json({ message: "MaoLevantada not found" });
    res.json(maoLevantada);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMaoLevantada = async (req, res) => {
  try {
    const maoLevantada = await MaoLevantada.findByIdAndDelete(req.params.id);
    if (!maoLevantada) return res.status(404).json({ message: "MaoLevantada not found" });
    res.json({ message: "MaoLevantada deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

