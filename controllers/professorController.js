const Professor = require("../models/Professor");

exports.createProfessor = async (req, res) => {
  try {
    const newProfessor = new Professor(req.body);
    const professor = await newProfessor.save();
    res.status(201).json(professor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProfessors = async (req, res) => {
  try {
    const professors = await Professor.find();
    res.json(professors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfessorById = async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ message: "Professor not found" });
    res.json(professor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfessor = async (req, res) => {
  try {
    const professor = await Professor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!professor) return res.status(404).json({ message: "Professor not found" });
    res.json(professor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProfessor = async (req, res) => {
  try {
    const professor = await Professor.findByIdAndDelete(req.params.id);
    if (!professor) return res.status(404).json({ message: "Professor not found" });
    res.json({ message: "Professor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

