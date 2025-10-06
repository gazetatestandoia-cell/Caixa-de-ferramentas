// api/PraTV.js

// Handler da função serverless para a Vercel
export default async function handler(request, response) {
    // 1. Apenas permitir requisições do tipo POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Método não permitido' });
    }

    // 2. Obter a chave de API das variáveis de ambiente da Vercel
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('A variável de ambiente GOOGLE_API_KEY não está configurada.');
        return response.status(500).json({ error: 'Erro de configuração no servidor.' });
    }

    // 3. Extrair os dados enviados pelo frontend
    const { text, paragraphLimit } = request.body;
    if (!text || !paragraphLimit) {
        return response.status(400).json({ error: 'Dados de entrada ausentes (texto ou limite de parágrafos).' });
    }

    // 4. Montar a chamada para a API do Google (lógica movida do frontend para cá)
    const API_MODEL = 'gemini-2.5-flash-preview-05-20';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${apiKey}`;

    const SYSTEM_PROMPT = `Você é um jornalista de TV experiente, sênior, editor-chefe de telejornais da TV Globo.
    Objetivo geral: Transformar qualquer texto enviado pelo usuário em um texto pronto para exibição em telejornal, no formato NOTA COBERTA ou NOTA PELADA, respeitando as normas da língua portuguesa, o estilo jornalístico televisivo e a linguagem popular.
    Formatação final: O texto final deve estar em CAIXA ALTA. Vírgulas devem ser representadas por / e ponto final por //.`;

    const userPrompt = `Transforme o texto a seguir. Gere a NOTA PELADA e a NOTA COBERTA, respeitando o limite máximo de ${paragraphLimit} parágrafos. \n\nTEXTO BRUTO:\n---\n${text}\n---\n\nResponda APENAS com um objeto JSON válido no formato a seguir, sem nenhuma formatação de markdown ou texto adicional: {"nota_pelada": "TEXTO DA NOTA PELADA AQUI...", "nota_coberta": "TEXTO DA NOTA COBERTA COM SUGESTÕES DE IMAGEM AQUI..."}`;

    const payload = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }]
    };

    // 5. Executar a chamada e retornar a resposta para o frontend
    try {
        const googleApiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!googleApiResponse.ok) {
            const errorBody = await googleApiResponse.text();
            console.error('Erro da API do Google:', errorBody);
            return response.status(googleApiResponse.status).json({ error: 'Falha na comunicação com a API do Google.' });
        }

        const data = await googleApiResponse.json();
        const candidate = data.candidates?.[0];

        if (!candidate || !candidate.content?.parts?.[0]?.text) {
            throw new Error('Resposta inválida da API do Google.');
        }

        let responseText = candidate.content.parts[0].text;
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const finalJson = JSON.parse(responseText);

        // Envia a resposta final de volta para o frontend
        return response.status(200).json(finalJson);

    } catch (error) {
        console.error('Erro interno do servidor:', error);
        return response.status(500).json({ error: 'Ocorreu um erro ao processar sua solicitação.' });
    }
}
