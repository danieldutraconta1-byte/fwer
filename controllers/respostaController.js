const Resposta = require("../models/Resposta");

exports.createResposta = async (req, res) => {
  try {
    const newResposta = new Resposta(req.body);
    const resposta = await newResposta.save();
    res.status(201).json(resposta);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getRespostas = async (req, res) => {
  try {
    const respostas = await Resposta.find().populate("pergunta").populate("aluno").populate("opcao_selecionada");
    res.json(respostas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRespostaById = async (req, res) => {
  try {
    const resposta = await Resposta.findById(req.params.id).populate("pergunta").populate("aluno").populate("opcao_selecionada");
    if (!resposta) return res.status(404).json({ message: "Resposta not found" });
    res.json(resposta);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateResposta = async (req, res) => {
  try {
    const resposta = await Resposta.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resposta) return res.status(404).json({ message: "Resposta not found" });
    res.json(resposta);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteResposta = async (req, res) => {
  try {
    const resposta = await Resposta.findByIdAndDelete(req.params.id);
    if (!resposta) return res.status(404).json({ message: "Resposta not found" });
    res.json({ message: "Resposta deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

