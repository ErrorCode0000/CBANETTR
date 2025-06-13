// Gerekli modülleri içeri aktar
const express = require('express');
const axios = require('axios'); // HTTP istekleri için
const dotenv = require('dotenv'); // Ortam değişkenleri için

// .env dosyasındaki ortam değişkenlerini yükle
dotenv.config();

const app = express();
const port = 3000; // Sunucunun çalışacağı port

// JSON body'leri parse etmek için middleware
app.use(express.json());
// 'public' klasörünü statik dosyalar için servis et
app.use(express.static('public'));

// API anahtarını ortam değişkeninden çekin
const API_KEY = process.env.API_KEY; 
// Google Gemini API'nin uç noktası
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// API anahtarının mevcut olup olmadığını kontrol et
if (!API_KEY) {
    console.error("Hata: API anahtarı bulunamadı. Lütfen '.env' dosyasını 'ai-js' klasörü içinde oluşturun ve 'API_KEY=sizin_anahtarınız' şeklinde ayarlayın.");
    process.exit(1); // Uygulamadan çık
}

// Mesaj gönderme endpoint'i
app.post('/send_message', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Mesaj boş olamaz" });
    }

    try {
        // Google Gemini API'sinin beklediği JSON yapısını oluştur
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: userMessage
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
                stopSequences: []
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
            ]
        };

        // API isteğini yap
        const apiResponse = await axios.post(`${API_URL}?key=${API_KEY}`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // API'den gelen yanıtı frontend'e geri gönder
        // Yanıtın yapısı API'ye göre değişebilir. Google Gemini için 'candidates' içinde 'text' bulunur.
        if (apiResponse.data && apiResponse.data.candidates && apiResponse.data.candidates.length > 0 &&
            apiResponse.data.candidates[0].content && apiResponse.data.candidates[0].content.parts &&
            apiResponse.data.candidates[0].content.parts.length > 0) {
            
            res.json({ response: apiResponse.data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "API yanıtı beklenen formatta değil.", rawResponse: apiResponse.data });
        }

    } catch (error) {
        console.error("API isteği sırasında hata oluştu:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "API isteği sırasında bir hata oluştu." });
    }
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
