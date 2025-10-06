import os
import requests
from flask import Flask, request, jsonify

# Vercel espera uma variável 'app' para servir
app = Flask(__name__)

# A rota agora é a raiz, pois o nome do arquivo (generate_thread) já define o caminho da API
@app.route('/', methods=['POST'])
def generate_thread():
    # Pega a URL enviada pelo frontend
    data = request.get_json()
    article_url = data.get('url')

    if not article_url:
        return jsonify({"error": "URL não fornecida"}), 400

    # Pega a chave da API do ambiente (funciona na Vercel)
    api_key = os.getenv('GOOGLE_API_KEY')

    if not api_key:
        return jsonify({"error": "Chave de API não configurada no servidor. Verifique as variáveis de ambiente na Vercel."}), 500

    # Prepara a chamada para a API do Google Gemini
    google_api_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={api_key}'

    system_prompt = """Você é um especialista em mídias sociais que cria threads para o X (Twitter). Sua tarefa é resumir uma reportagem em uma thread.
    REGRAS:
    1. FIDELIDADE AO TEXTO: NÃO insira NENHUMA informação que não esteja no texto da reportagem. Não invente nomes, cargos, dados ou altere o sentido do texto original. O material para a thread é EXCLUSIVAMENTE o texto da reportagem.
    2. Crie entre 4 e 10 tweets.
    3. Numere cada tweet (ex: 1/5, 2/5...).
    4. Cada tweet deve ter menos de 280 caracteres.
    5. Use emojis relevantes.
    6. O último tweet deve conter 3-5 hashtags.
    7. Mantenha um tom neutro e jornalístico.
    8. A resposta DEVE ser em português do Brasil.
    9. IMPORTANTE: Sua resposta deve conter APENAS a thread numerada, sem nenhuma introdução, título, conclusão ou qualquer outro texto. Comece diretamente no "1/X"."""
    
    user_query = f"Com base no conteúdo da reportagem no link a seguir, crie uma thread: {article_url}"

    payload = {
        "contents": [{"parts": [{"text": user_query}]}],
        "tools": [{"google_search": {}}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
    }

    try:
        # Faz a requisição para a API do Google
        response = requests.post(google_api_url, json=payload)
        response.raise_for_status()  # Lança um erro para respostas com status 4xx/5xx
        
        # Retorna a resposta da API do Google para o frontend
        return jsonify(response.json())

    except requests.exceptions.RequestException as e:
        print(f"Erro ao chamar a API do Google: {e}")
        return jsonify({"error": f"Erro de comunicação com a API do Google: {e}"}), 500
