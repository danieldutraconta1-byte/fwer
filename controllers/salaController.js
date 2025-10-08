const Sala = require("../models/Sala");

exports.createSala = async (req, res) => {
  try {
    const newSala = new Sala(req.body);
    const sala = await newSala.save();
    res.status(201).json(sala);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSalas = async (req, res) => {
  try {
    const salas = await Sala.find().populate("professor");
    res.json(salas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSalaById = async (req, res) => {
  try {
    const sala = await Sala.findById(req.params.id).populate("professor");
    if (!sala) return res.status(404).json({ message: "Sala not found" });
    res.json(sala);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSala = async (req, res) => {
  try {
    const sala = await Sala.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sala) return res.status(404).json({ message: "Sala not found" });
    res.json(sala);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSala = async (req, res) => {
  try {
    const sala = await Sala.findByIdAndDelete(req.params.id);
    if (!sala) return res.status(404).json({ message: "Sala not found" });
    res.json({ message: "Sala deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

