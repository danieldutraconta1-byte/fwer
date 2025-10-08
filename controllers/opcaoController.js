const Opcao = require("../models/Opcao");

exports.createOpcao = async (req, res) => {
  try {
    const newOpcao = new Opcao(req.body);
    const opcao = await newOpcao.save();
    res.status(201).json(opcao);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getOpcoes = async (req, res) => {
  try {
    const opcoes = await Opcao.find().populate("pergunta");
    res.json(opcoes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOpcaoById = async (req, res) => {
  try {
    const opcao = await Opcao.findById(req.params.id).populate("pergunta");
    if (!opcao) return res.status(404).json({ message: "Opcao not found" });
    res.json(opcao);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOpcao = async (req, res) => {
  try {
    const opcao = await Opcao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!opcao) return res.status(404).json({ message: "Opcao not found" });
    res.json(opcao);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteOpcao = async (req, res) => {
  try {
    const opcao = await Opcao.findByIdAndDelete(req.params.id);
    if (!opcao) return res.status(404).json({ message: "Opcao not found" });
    res.json({ message: "Opcao deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

