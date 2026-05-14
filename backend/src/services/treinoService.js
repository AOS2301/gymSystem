import { TreinoRepository } from "../repositories/TreinoRepository.js";
import { TreinoExercicioRepository } from "../repositories/TreinoExercicioRepository.js";
import { TreinoDTO } from "../dto/TreinosDto.js";
import { TreinoExercicioDTO } from "../dto/TreinoExercicioDto.js";
import { ExercicioRepository } from "../repositories/ExercicioRepository.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParseModule = require("pdf-parse-fork");
const pdfParse = pdfParseModule.default ?? pdfParseModule;

import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DIA_SEMANA_ID = {
  "Segunda": 1,
  "Terça": 2,
  "Quarta": 3,
  "Quinta": 4,
  "Sexta": 5,
  "Sábado": 6,
  "Domingo": 7,
};

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
    const textoNormalizado = normalizarTexto(textoPDF);

    if (!textoNormalizado) {
      throw new Error("Não foi possível extrair texto do PDF.");
    }

    const prompt = `
Você é um especialista em leitura de fichas de treino.

Extraia os dados do texto abaixo e retorne SOMENTE um JSON válido.
 
Regras:
- Treinos são identificados por "TREINO A", "TREINO B", etc
- Ordene os treinos alfabeticamente antes de mapear os dias
- Ignore observações gerais
- Ignore coluna técnica
- "6-8" = repetições mínimas e máximas
- "2-3min" = 120 segundos

Mapeamento:
2 treinos:
A=Segunda
B=Quinta

3 treinos:
A=Segunda
B=Quarta
C=Sexta

4 treinos:
A=Segunda
B=Terça
C=Quinta
D=Sexta

ESTRUTURA OBRIGATÓRIA do JSON:
{
  "aluno": "nome completo do aluno ou null",
  "personal": "nome completo do personal ou null",
  "mes": "mês e ano de referência ou null",
  "treinos": [
    {
      "diaSemana": "Segunda",
      "exercicios": [
        {
          "nome": "nome do exercício",
          "series": número inteiro ou null,
          "repeticoes_min": número inteiro ou null,
          "repeticoes_max": número inteiro ou null,
          "descanso": segundos como inteiro ou null
        }
      ]
    }
  ]
}
${textoNormalizado}
    `.trim();

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });
    const textoResposta = result.choices[0].message.content;

    const limpo = textoResposta.replace(/```json|```/g, "").trim();
    const json = JSON.parse(limpo);

    corrigirDiasTreino(json);

    try {
      return json;
    } catch {
      throw new Error("A IA retornou um formato inesperado. Tente novamente.");
    }
  }

  static async adicionarPDF(userId, data) {
    const treinos = data?.treinos;

    if (!Array.isArray(treinos) || treinos.length === 0) {
      throw new Error("Nenhum treino encontrado no PDF.");
    }
    
    //Apaga todos os exercícios atuais do usuaário (PDF tem prioridade)
    await TreinoExercicioRepository.deleteByUserId(userId);

    const resultados = [];

    for (const treinoData of treinos) {
      const diaId = DIA_SEMANA_ID[treinoData.diaSemana];

      if (!diaId) {
        console.warn(`Dia inválido ignorado: ${treinoData.diaSemana}`);
        continue;
      }

      // 1️⃣ Busca ou cria o treino do dia
      let treino = await TreinoRepository.findByUserIdDiaId(userId, diaId);
      if (!treino) {
        treino = await TreinoRepository.create({
          usuario_id: userId,
          dia_semana: diaId,
        });
      }

      // 2️⃣ Cria cada exercício do PDF
      for (let ordem = 0; ordem < treinoData.exercicios.length; ordem++) {
        const ex = treinoData.exercicios[ordem];

        // Busca exercício no catálogo pelo nome
        let exercicio = await ExercicioRepository.findByNome(ex.nome);

        // Se não existir, cria no catálogo
        if (!exercicio) {
          exercicio = await ExercicioRepository.create(ex.nome);
        }

        await TreinoExercicioRepository.create({
          treino_id: treino.id,
          exercicio_id: exercicio.id,
          series: ex.series ?? null,
          repeticoes_min: ex.repeticoes_min ?? null,
          repeticoes_max: ex.repeticoes_max ?? null,
          descanso: ex.descanso ?? null,
          peso: null, // PDF não traz peso
          ordem,
        });
      }

      resultados.push(treinoData.diaSemana);
    }

    return {
      success: true,
      diasSalvos: resultados,
    };
  }
}

function normalizarTexto(texto) {
  return texto
    .replace(/\r/g, "")

    .replace(/TREINO\s+([A-Z])/gi, "\n\nTREINO $1\n")

    .replace(/\n{3,}/g, "\n\n")

    .replace(/([a-zÀ-ÿ])(\d)/g, "$1 $2")

    .replace(/[ \t]{2,}/g, " ")

    .trim();
}

function corrigirDiasTreino(json) {
  if (!json?.treinos?.length) return;

  const mapas = {
    2: ["Segunda", "Quinta"],
    3: ["Segunda", "Quarta", "Sexta"],
    4: ["Segunda", "Terça", "Quinta", "Sexta"],
    5: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
  };

  const dias = mapas[json.treinos.length];

  if (!dias) return;

  json.treinos = json.treinos.map((treino, index) => ({
    ...treino,
    diaSemana: dias[index],
  }));
}