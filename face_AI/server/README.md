# Server API cho Face AI

Server trung gian này giúp kết nối ứng dụng Face AI với các API như Replicate và Hugging Face, giúp giải quyết vấn đề CORS và bảo mật API key.

## Cài đặt

1. Cài đặt Node.js (phiên bản 14 trở lên) từ [nodejs.org](https://nodejs.org/)

2. Cài đặt các dependency:
   ```bash
   cd server
   npm install
   ```

3. Tạo file `.env` với nội dung:
   ```
   PORT=3000
   REPLICATE_API_TOKEN=r8_your_replicate_api_key_here
   HUGGINGFACE_API_TOKEN=hf_your_huggingface_api_key_here
   ```
   
   Lưu ý: Thay thế `your_replicate_api_key_here` và `your_huggingface_api_key_here` bằng API key thật của bạn.

## Khởi động server

```bash
npm start
```

Hoặc chạy trong chế độ development (tự động restart khi có thay đổi):

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`.

## API Endpoints

### Kiểm tra kết nối
- **POST** `/api/test-connection`
  - Kiểm tra kết nối với Replicate API

### Hugging Face API
- **POST** `/api/huggingface`
  - Body:
    ```json
    {
      "model": "stabilityai/stable-diffusion-xl-base-1.0",
      "inputs": {
        "prompt": "a photograph of an astronaut riding a horse",
        "image": "data:image/jpeg;base64,..."
      },
      "apiKey": "your_huggingface_api_key"
    }
    ```

### Replicate API
- **POST** `/api/replicate/run`
  - Chạy mô hình nhanh
  - Body:
    ```json
    {
      "version": "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
      "input": {
        "prompt": "a photograph of an astronaut riding a horse"
      },
      "apiKey": "your_replicate_api_key"
    }
    ```

- **POST** `/api/replicate/predictions`
  - Tạo prediction (bất đồng bộ)
  - Body:
    ```json
    {
      "version": "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
      "input": {
        "prompt": "a photograph of an astronaut riding a horse"
      },
      "apiKey": "your_replicate_api_key"
    }
    ```

- **GET** `/api/replicate/predictions/:id?apiKey=your_replicate_api_key`
  - Kiểm tra trạng thái prediction

## Tích hợp với Face AI

1. Cập nhật file `ai_face_transformer.js` để sử dụng server API thay vì gọi trực tiếp đến Replicate và Hugging Face API
2. Đảm bảo chạy server này cùng lúc với ứng dụng web Face AI 