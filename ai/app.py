import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai

# .env dosyasındaki ortam değişkenlerini yükle
# Bu, app.py ile aynı dizinde bulunan .env dosyasını arayacaktır.
load_dotenv()

# static_folder'ı 'static' olarak bırakıyoruz çünkü static klasörü app.py ile aynı dizinde
app = Flask(__name__, static_folder='static')

# API anahtarını ortam değişkeninden çekin
API_KEY = os.getenv("API_KEY") 

if not API_KEY:
    print("Hata: API anahtarı bulunamadı. Lütfen '.env' dosyasını 'ai' klasörü içinde oluşturun ve 'API_KEY=sizin_anahtarınız' şeklinde ayarlayın.")
    exit()

# Google Gemini API'yi yapılandır
genai.configure(api_key=API_KEY)

# Bir dil modeli başlatın
model = genai.GenerativeModel('gemini-pro')

@app.route('/')
def index():
    # render_template varsayılan olarak 'templates' klasörünü arar.
    # Ancak biz static_folder'ı 'static' olarak ayarladığımız için
    # ve index.html static klasörünün içinde olduğu için
    # doğrudan statik dosyayı servis etmenin bir yolu olarak bu örnekte doğrudan 'static' klasörüne koyduk.
    # Daha standart bir Flask yapısında 'templates' klasörü kullanılırdı.
    # Şimdilik bu haliyle çalışacaktır.
    return render_template('index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "Mesaj boş olamaz"}), 400

    try:
        response = model.generate_content(user_message)
        return jsonify({"response": response.text})
    except Exception as e:
        print(f"API isteği sırasında hata oluştu: {e}")
        return jsonify({"error": "API isteği sırasında bir hata oluştu."}), 500

if __name__ == '__main__':
    app.run(debug=True) # Geliştirme için debug=True, üretim için False olmalı
