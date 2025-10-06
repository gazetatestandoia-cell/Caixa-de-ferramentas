// api/Otimizador.js

// Handler da Função Serverless Vercel
export default async function handler(req, res) {
    // Permitir apenas requisições do tipo POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // Extrair o prompt do corpo da requisição enviada pelo frontend
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'O prompt é obrigatório no corpo da requisição.' });
        }

        // Ler a chave de API das variáveis de ambiente da Vercel (forma segura)
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.error("Chave de API do Google não encontrada nas variáveis de ambiente.");
            return res.status(500).json({ error: 'Erro de configuração no servidor.' });
        }
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // Construir o payload para a API do Google, incluindo a instrução do sistema
        const systemInstruction = {
            parts: [{
                text: `Você é um especialista em SEO para portais de notícias, com vasta experiência em otimização de títulos para mecanismos de busca (Google) e redes sociais. Sua tarefa é analisar o conteúdo fornecido e gerar sugestões de títulos que maximizem o alcance e o engajamento. Para a redação que usará esta ferramenta, o tamanho limite para um título é exatamente 69 caracteres. Leve isso como uma regra. Responda sempre em português do Brasil.`
            }]
        };

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction,
            generationConfig: {
                responseMimeType: "application/json",
            }
        };

        // Fazer a chamada para a API do Google
        const googleApiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Se a resposta da API do Google não for bem-sucedida, repasse o erro
        if (!googleApiResponse.ok) {
            const errorData = await googleApiResponse.json();
            console.error('Erro da API do Google:', errorData);
            return res.status(googleApiResponse.status).json({ error: errorData.error ? errorData.error.message : 'Falha na comunicação com a API do Google.' });
        }
        
        const result = await googleApiResponse.json();

        // Enviar a resposta bem-sucedida de volta para o frontend
        return res.status(200).json(result);

    } catch (error) {
        console.error('Erro Interno do Servidor:', error);
        return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
}
