import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Tải biến môi trường từ file .env
load_dotenv()

app = Flask(__name__)
# Cho phép CORS để frontend (chạy trên một cổng khác) có thể giao tiếp với backend
CORS(app)

# Lấy API Key từ biến môi trường
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")

# Cấu hình Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Tên model Gemini bạn muốn sử dụng
MODEL_NAME = "gemini-2.0-flash"

# Hướng dẫn hệ thống (System Instruction) cho chatbot
# Đây là cách bạn định hình tính cách và vai trò của chatbot
SYSTEM_INSTRUCTION_CONTENT = [
    {"text": "Bạn là một chatbot tư vấn tâm lý thân thiện, thấu cảm và không phán xét. Bạn lắng nghe và đưa ra lời khuyên hỗ trợ tinh thần chân thành, phù hợp với văn hóa Việt Nam. Luôn khuyến khích người dùng chia sẻ và hướng họ đến những suy nghĩ tích cực. Nếu có bất kỳ dấu hiệu nguy hiểm (tự tử, bạo lực, v.v.), ngay lập tức cung cấp số điện thoại khẩn cấp 111 (Tổng đài quốc gia bảo vệ trẻ em) và 113 (Công an) và khuyên họ liên hệ ngay lập tức với chuyên gia hoặc tổ chức uy tín. Bạn không phải là chuyên gia y tế hay luật sư, chỉ là trợ lý thông tin."}
]

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message')
        history = data.get('history', []) # Lịch sử trò chuyện từ frontend

        if not user_message:
            return jsonify({"error": "Không có tin nhắn được cung cấp."}), 400

        # Khởi tạo model instance và truyền system_instruction vào đây
        # System instruction giúp định hình phản hồi của model
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYSTEM_INSTRUCTION_CONTENT
        )

        # Bắt đầu chat session với lịch sử đã có từ frontend
        # Lịch sử này không bao gồm system instruction nữa
        # Tối ưu hóa phản hồi của AI và quản lý ngữ cảnh:
        # Hiện tại, toàn bộ lịch sử từ frontend được truyền vào.
        # Đối với các cuộc trò chuyện rất dài, bạn có thể cần các chiến lược phức tạp hơn ở đây:
        # - Tóm tắt lịch sử: Sử dụng một lời gọi model khác để tóm tắt các đoạn hội thoại cũ.
        # - Cửa sổ trượt (Sliding Window): Chỉ giữ lại N tin nhắn gần nhất trong 'history'.
        # Ví dụ (chỉ là ý tưởng, cần triển khai chi tiết):
        # if len(history) > MAX_HISTORY_LENGTH:
        #     history = summarize_old_history(history) + history[-N_RECENT_MESSAGES:]
        chat_session = model.start_chat(history=history)

        # Gửi tin nhắn mới đến session
        response = chat_session.send_message(user_message)

        bot_reply = response.text
        return jsonify({"reply": bot_reply})

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Xử lý lỗi nâng cao: Trả về lỗi 500 nếu có vấn đề ở backend
        return jsonify({"error": "Đã xảy ra lỗi nội bộ khi xử lý yêu cầu của bạn."}), 500

if __name__ == '__main__':
    # Chạy ứng dụng Flask trên cổng 5000
    app.run(debug=True, port=5000)
