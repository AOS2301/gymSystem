import { TreinoRepository } from "../repositories/TreinoRepository.js";
import { TreinoExercicioRepository } from "../repositories/TreinoExercicioRepository.js";
import { TreinoDTO } from "../dto/TreinosDto.js";
import { TreinoExercicioDTO } from "../dto/TreinoExercicioDto.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParseModule = require("pdf-parse-fork");
const pdfParse = pdfParseModule.default ?? pdfParseModule;

import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export class treinoService {
  static async listarTreinos(userId) {
    const treinos = await TreinoRepository.findByUserId(userId);

    return {
      treinos: treinos.map((treino) => new TreinoDTO(treino)),
    };
  }

  static async incluirTreino(userId, treinoData) {
    let treino = await TreinoRepository.findByUserIdDiaId(
      userId,
      treinoData.diaId
    );

    if (!treino) {
      treino = await TreinoRepository.create({
        usuario_id: userId,
        dia_semana: treinoData.diaId,
      });
    }

    const ultimaOrdem =
      await TreinoExercicioRepository.getMaiorOrdemByTreinoId(treino.id);

    const novaOrdem =
      ultimaOrdem !== null && ultimaOrdem !== undefined
        ? ultimaOrdem + 1
        : 0;

    const treinoExercicio = await TreinoExercicioRepository.create({
      treino_id: treino.id,
      exercicio_id: treinoData.exercicioId,
      series: treinoData.series,
      repeticoes_min: treinoData.repeticoes_min,
      repeticoes_max: treinoData.repeticoes_max,
      descanso: treinoData.descanso,
      peso: treinoData.peso,
      ordem: novaOrdem
    });

    return {
      treinoExercicio: new TreinoExercicioDTO(treinoExercicio),
    };
  }

  static async removerTreino(userId, data) {
    const result = await TreinoExercicioRepository.delete(
      userId,
      data.diaId,
      data.exercicioId
    );

    if (result.count === 0) {
      throw new Error("Exercício não encontrado para este dia");
    }

    return { success: true };
  }

  static async atualizarTreino(treinoId, data) {
    try {
      const result = await TreinoExercicioRepository.update(
        treinoId,
        data
      );

      return { success: true };

    } catch (error) {
      throw new Error("Falha ao atualizar treino: " + error.message);
    }

  }

  static async reordenarTreinos(userId, diaId, exercicios) {
    if (!Array.isArray(exercicios)) {
      throw new Error("Lista de exercícios inválida");
    }

    const treino = await TreinoRepository.findByUserIdDiaId(
      userId,
      diaId
    );

    if (!treino) {
      throw new Error("Treino não encontrado");
    }

    const exerciciosDoTreino =
      await TreinoExercicioRepository.findIdsByTreinoId(treino.id);

    const exerciciosIdsValidos = new Set(
      exerciciosDoTreino.map(e => e.id)
    );

    for (const { treinoExercicioId } of exercicios) {
      if (!exerciciosIdsValidos.has(treinoExercicioId)) {
        throw new Error(
          `Exercício ${treinoExercicioId} não pertence ao treino`
        );
      }
    }

    await TreinoExercicioRepository.updateOrdemEmLote(exercicios);

    return { success: true };
  }

  static async importarTreinos(userId, { pdf }) {
    const pdfBuffer = Buffer.from(pdf, "base64");
    const pdfData = await pdfParse(pdfBuffer);
    const textoPDF = pdfData.text?.trim();

    if (!textoPDF) {
      throw new Error("Não foi possível extrair texto do PDF.");
    }

    const prompt = `
Você é um assistente especialista em leitura de fichas de treino.
Analise e retorne SOMENTE um JSON válido, sem explicações, sem markdown.

{
  "aluno": "nome ou null",
  "personal": "nome ou null",
  "mes": "mês ou null",
  "treinos": [
    {
      "diaSemana": "Segunda|Terça|Quarta|Quinta|Sexta|Sábado|Domingo",
      "grupoMuscular": "ex: Peito e Tríceps ou null",
      "exercicios": [
        {
          "nome": "nome do exercício",
          "series": número inteiro ou null,
          "repeticoes_min": número inteiro ou null,
          "repeticoes_max": número inteiro ou null,
          "descanso": segundos como inteiro ou null,
          "peso": número decimal ou null
        }
      ]
    }
  ]
}

Regras:
- Reps "10-12" → min=10, max=12; "10" → ambos=10
- Descanso em segundos: "2 min"→120, "60s"→60, sem info→null
- Peso sem info → null
- Siglas: SEG→Segunda, TER→Terça, QUA→Quarta, QUI→Quinta, SEX→Sexta, SAB→Sábado, DOM→Domingo
- Treinos A/B/C sem dia → A=Segunda, B=Quarta, C=Sexta
- Ignore cardio

Texto da ficha:
${textoPDF}
  `.trim();

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });
    const textoResposta = result.choices[0].message.content;

    const limpo = textoResposta.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(limpo);
    } catch {
      throw new Error("A IA retornou um formato inesperado. Tente novamente.");
    }
  }
}