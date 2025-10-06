/**
 * Vercel Serverless Function para chamar a API do Google de forma segura.
 * Esta função atua como um backend que recebe o prompt do frontend,
 * utiliza a chave de API armazenada nas variáveis de ambiente da Vercel
 * e faz a chamada para a API do Google, retornando a resposta para o frontend.
 */
export default async function handler(request, response) {
    // 1. Apenas permitir requisições do tipo POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Obter a chave da API a partir das variáveis de ambiente da Vercel
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('GOOGLE_API_KEY não está configurada nas variáveis de ambiente.');
        return response.status(500).json({ error: 'A chave de API não está configurada no servidor.' });
    }

    try {
        // 3. Extrair o prompt do corpo da requisição enviada pelo frontend
        const { prompt } = request.body;
        if (!prompt) {
            return response.status(400).json({ error: 'O prompt é obrigatório.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // 4. Preparar o payload para a API do Google (o mesmo que estava no frontend)
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        titulo: { type: "STRING" },
                        subtitulo: { type: "STRING" },
                        materia: { type: "STRING" },
                        resumo_agora: { type: "STRING" }
                    },
                    required: ["titulo", "subtitulo", "materia", "resumo_agora"]
                }
            }
        };

        // 5. Fazer a chamada para a API do Google
        const googleApiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // 6. Tratar a resposta da API do Google
        if (!googleApiResponse.ok) {
            const errorData = await googleApiResponse.json();
            console.error('Erro da API do Google:', errorData);
            return response.status(googleApiResponse.status).json({ error: 'Falha ao comunicar com a API do Google.', details: errorData });
        }

        const data = await googleApiResponse.json();
        
        // 7. Enviar a resposta de volta para o frontend
        return response.status(200).json(data);

    } catch (error) {
        console.error('Erro interno do servidor:', error);
        return response.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
}
