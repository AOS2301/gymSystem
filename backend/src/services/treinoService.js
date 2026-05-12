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
Você é um especialista em leitura de fichas de treino de academia. Sua tarefa é extrair dados estruturados de um texto de ficha de treino.
 
Retorne SOMENTE um JSON válido, sem nenhuma explicação, sem markdown, sem blocos de código, sem texto antes ou depois.
 
ESTRUTURA OBRIGATÓRIA do JSON:
{
  "aluno": "nome completo do aluno ou null",
  "personal": "nome completo do personal ou null",
  "mes": "mês e ano de referência ou null",
  "treinos": [
    {
      "diaSemana": "Segunda",
      "grupoMuscular": "nome do grupo muscular ou null",
      "exercicios": [
        {
          "nome": "nome do exercício",
          "series": número inteiro ou null,
          "repeticoes_min": número inteiro ou null,
          "repeticoes_max": número inteiro ou null,
          "descanso": segundos como inteiro ou null,
        }
      ]
    }
  ]
}
 
REGRAS DE EXTRAÇÃO:
 
1. IDENTIFICAÇÃO DOS TREINOS:
   - Treinos podem ser identificados como "TREINO A", "TREINO B", etc.
   - Reordene SEMPRE alfabeticamente (A, B, C, D...) independente da ordem no texto
   - Nunca mapeie pela ordem de aparição no texto, sempre pela letra
 
2. MAPEAMENTO DE DIAS (baseado na quantidade total de treinos encontrados):
   - 2 treinos → A=Segunda, B=Quinta
   - 3 treinos → A=Segunda, B=Quarta, C=Sexta
   - 4 treinos → A=Segunda, B=Terça, C=Quinta, D=Sexta
   - 5 treinos → A=Segunda, B=Terça, C=Quarta, D=Quinta, E=Sexta
 
3. REPETIÇÕES:
   - "6-8" → repeticoes_min=6, repeticoes_max=8
   - "12-15" → repeticoes_min=12, repeticoes_max=15
   - "10" (número único) → repeticoes_min=10, repeticoes_max=10
   - Ignore qualquer valor que não seja número (ex: "X" na coluna Técnica)
 
4. DESCANSO (sempre em segundos):
   - "2-3min" ou "2-3 min" → 120 (usa o valor mínimo)
   - "2min" ou "2 min" → 120
   - "90s" ou "90 seg" → 90
   - "1min30" → 90
   - Sem informação → null
 
5. GRUPO MUSCULAR:
   - Se não estiver explícito no texto, infira pelos exercícios:
     * Remada, Puxada, Pulldown → "Costas"
     * Supino, Voador, Crucifixo → "Peito"
     * Rosca, Bíceps → "Bíceps"
     * Tríceps, Mergulho → "Tríceps"
     * Agacho, Leg Press, Cadeira Extensora, Mesa Flexora → "Pernas"
     * Panturrilha → "Panturrilha"
     * Elevação Lateral, Desenvolvimento → "Ombros"
     * Stiff, Búlgaro, Cadeira Adutora, Cadeira Abdutora → "Pernas Posterior"
     * Combinações: use "Costas e Bíceps", "Peito e Tríceps", etc.
 
6. O QUE IGNORAR COMPLETAMENTE:
   - Dados de cardio (bike, esteira, BPM, frequência cardíaca, sprint)
   - Coluna "Técnica" (valores como "X", "AMPLITUDE NO MAX!", etc.)
   - Seções de dicas, observações ou recomendações gerais
   - Qualquer texto que não seja exercício, série, repetição ou intervalo
 
7. NOME DO EXERCÍCIO:
   - Use o nome exato como aparece na ficha
   - Se estiver em múltiplas linhas (ex: "Remada Convergente\nUnilateral"), junte em uma linha
 
Texto da ficha extraído do PDF:
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