// api/generate_thread.js

// A Vercel executará esta função para requisições em /api/generate_thread
export default async function handler(request, response) {
    // Permitir apenas requisições do tipo POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Obter a URL do corpo da requisição enviada pelo frontend
        const { url: articleUrl } = request.body;

        if (!articleUrl) {
            return response.status(400).json({ error: "URL não fornecida" });
        }

        // Obter a chave de API das variáveis de ambiente configuradas na Vercel
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            // Este erro aparecerá nos logs da Vercel se a chave não estiver configurada
            console.error("A variável de ambiente GOOGLE_API_KEY não foi encontrada.");
            return response.status(500).json({ error: "Chave de API não configurada no servidor." });
        }
        
        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const systemPrompt = `Você é um especialista em mídias sociais que cria threads para o X (Twitter). Sua tarefa é resumir uma reportagem em uma thread.
REGRAS:
1. FIDELIDADE AO TEXTO: NÃO insira NENHUMA informação que não esteja no texto da reportagem. Não invente nomes, cargos, dados ou altere o sentido do texto original. O material para a thread é EXCLUSIVAMENTE o texto da reportagem.
2. Crie entre 4 e 10 tweets.
3. Numere cada tweet (ex: 1/5, 2/5...).
4. Cada tweet deve ter menos de 280 caracteres.
5. Use emojis relevantes.
6. O último tweet deve conter 3-5 hashtags.
7. Mantenha um tom neutro e jornalístico.
8. A resposta DEVE ser em português do Brasil.
9. IMPORTANTE: Sua resposta deve conter APENAS a thread numerada, sem nenhuma introdução, título, conclusão ou qualquer outro texto. Comece diretamente no "1/X".`;
            
        const userQuery = `Com base no conteúdo da reportagem no link a seguir, crie uma thread: ${articleUrl}`;
        
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        // Fazer a chamada para a API do Google a partir do servidor seguro da Vercel
        const googleApiResponse = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await googleApiResponse.json();

        if (!googleApiResponse.ok) {
            console.error('Erro da API do Google:', data);
            throw new Error(data.error?.message || `Erro na API do Google: ${googleApiResponse.statusText}`);
        }
        
        // Devolver a resposta bem-sucedida da API do Google para o frontend
        return response.status(200).json(data);

    } catch (error) {
        console.error('Erro interno do servidor:', error);
        return response.status(500).json({ error: error.message || 'Ocorreu um erro interno no servidor.' });
    }
}

