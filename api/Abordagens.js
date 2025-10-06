// api/Abordagens.js
// Esta é uma Função Serverless da Vercel que atua como um backend seguro.

export default async function handler(request, response) {
    // Permite apenas requisições do tipo POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Lê a chave da API do Google a partir das variáveis de ambiente da Vercel
    const apiKey = process.env.GOOGLE_API_KEY;

    // Verifica se a chave foi configurada no servidor
    if (!apiKey) {
        console.error("A variável de ambiente GOOGLE_API_KEY não está configurada.");
        return response.status(500).json({ error: 'A chave da API não está configurada no servidor.' });
    }

    try {
        // Extrai os dados enviados pelo frontend
        const { userQuery, systemPrompt } = request.body;

        if (!userQuery || !systemPrompt) {
            return response.status(400).json({ error: 'Faltando userQuery ou systemPrompt no corpo da requisição.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        // Monta o payload para a API do Google
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        // Faz a chamada para a API do Google a partir do backend
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await geminiResponse.json();

        // Se a resposta da API do Google não for bem-sucedida, repassa o erro
        if (!geminiResponse.ok) {
            console.error('Erro da API do Google:', responseData);
            return response.status(geminiResponse.status).json({ 
                error: `A API do Google retornou um erro: ${geminiResponse.statusText}`,
                details: responseData
            });
        }

        // Envia a resposta bem-sucedida de volta para o frontend
        return response.status(200).json(responseData);

    } catch (error) {
        console.error('Erro interno do servidor:', error);
        return response.status(500).json({ error: 'Ocorreu um erro interno no servidor.', details: error.message });
    }
}
