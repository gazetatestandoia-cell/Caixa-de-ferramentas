/**
 * Vercel Serverless Function para intermediar chamadas à API do Google.
 * Esta função recebe o texto do frontend, utiliza a chave de API armazenada
 * de forma segura nas variáveis de ambiente da Vercel e retorna a resposta.
 */
export default async function handler(req, res) {
    // Define os cabeçalhos CORS para permitir requisições do seu frontend
    res.setHeader('Access-Control-Allow-Origin', '*'); // Em produção, pode restringir ao seu domínio
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde com sucesso a requisições OPTIONS (pre-flight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Garante que a requisição seja do tipo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Extrai os dados enviados pelo frontend
    const { userQuery, systemPrompt } = req.body;

    // Valida se os dados necessários foram recebidos
    if (!userQuery || !systemPrompt) {
        return res.status(400).json({ error: 'Faltam os parâmetros userQuery ou systemPrompt no corpo da requisição.' });
    }

    // Lê a chave da API do Google a partir das variáveis de ambiente da Vercel
    const apiKey = process.env.GOOGLE_API_KEY;

    // Verifica se a chave de API está configurada no servidor
    if (!apiKey) {
        console.error('A variável de ambiente GOOGLE_API_KEY não está configurada.');
        return res.status(500).json({ error: 'A chave da API não está configurada no servidor.' });
    }

    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // Monta o payload para a API do Google
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        // Faz a chamada para a API do Google
        const googleResponse = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Repassa a resposta (ou erro) da API do Google para o frontend
        const data = await googleResponse.json();
        if (!googleResponse.ok) {
            console.error('Erro da API do Google:', data);
            throw new Error(data.error?.message || 'Erro ao comunicar com a API do Google.');
        }
        
        res.status(200).json(data);

    } catch (error) {
        console.error('Erro na função serverless:', error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
}
