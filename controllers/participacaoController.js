const Participacao = require("../models/Participacao");

exports.createParticipacao = async (req, res) => {
  try {
    const newParticipacao = new Participacao(req.body);
    const participacao = await newParticipacao.save();
    res.status(201).json(participacao);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getParticipacoes = async (req, res) => {
  try {
    const participacoes = await Participacao.find().populate("aluno").populate("sala");
    res.json(participacoes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getParticipacaoById = async (req, res) => {
  try {
    const participacao = await Participacao.findById(req.params.id).populate("aluno").populate("sala");
    if (!participacao) return res.status(404).json({ message: "Participacao not found" });
    res.json(participacao);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateParticipacao = async (req, res) => {
  try {
    const participacao = await Participacao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!participacao) return res.status(404).json({ message: "Participacao not found" });
    res.json(participacao);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteParticipacao = async (req, res) => {
  try {
    const participacao = await Participacao.findByIdAndDelete(req.params.id);
    if (!participacao) return res.status(404).json({ message: "Participacao not found" });
    res.json({ message: "Participacao deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

