document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatBox = document.getElementById('chat-box');

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // En alta kaydır
    }

    sendButton.addEventListener('click', async () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            userInput.value = ''; // Giriş alanını temizle

            try {
                // Backend'deki Node.js Express uygulamasına POST isteği gönder
                const response = await fetch('/send_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message }) // Kullanıcının mesajını gönder
                });

                const data = await response.json();

                if (response.ok) {
                    addMessage('ai', data.response); // AI yanıtını göster
                } else {
                    addMessage('ai', `Hata: ${data.error || 'API yanıtı alınamadı.'}`);
                }
            } catch (error) {
                console.error('API isteği başarısız oldu:', error);
                addMessage('ai', 'Bir sorun oluştu. Lütfen tekrar deneyin.');
            }
        }
    });

    // Enter tuşuna basıldığında mesaj gönderme
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });
});
