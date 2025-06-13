require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');
const fetch = require('node-fetch');
const OpenAI = require('openai');
// Thêm package cho Google Generative AI
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3004;

// Khởi tạo OpenAI client
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Cấu hình CORS chi tiết
const corsOptions = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'http://127.0.0.1:3000', 'file://', 'null', '*'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions)); // Cho phép CORS để client có thể kết nối
app.use(express.json({ limit: '50mb' })); // Tăng giới hạn kích thước cho hình ảnh base64

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Lỗi không xác định từ server'
  });
});

// Khởi tạo Replicate với API key
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Route kiểm tra kết nối tới server
app.get('/api/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server API đang hoạt động',
    timestamp: new Date().toISOString()
  });
});

// Route proxy để tải ảnh từ Replicate (giải quyết CORS)
app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu tham số URL' 
      });
    }
    
    // Kiểm tra URL có hợp lệ không
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL không hợp lệ' 
      });
    }
    
    // Chỉ cho phép tải từ các domain tin cậy
    const allowedDomains = [
      'replicate.delivery',
      'pbxt.replicate.delivery',
      'cdn.openai.com',
      'oaidalleapiprodscus.blob.core.windows.net'
    ];
    
    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
    
    if (!isAllowed) {
      return res.status(403).json({ 
        success: false, 
        error: 'Domain không được phép' 
      });
    }
    
    console.log('Đang tải ảnh từ:', url);
    
    // Tải ảnh từ URL gốc
    const imageResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!imageResponse.ok) {
      return res.status(imageResponse.status).json({ 
        success: false, 
        error: `Không thể tải ảnh: ${imageResponse.status} ${imageResponse.statusText}` 
      });
    }
    
    // Kiểm tra content type
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL không trỏ đến một hình ảnh hợp lệ' 
      });
    }
    
    // Thiết lập headers cho response
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache 1 giờ
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    // Stream ảnh về client
    imageResponse.body.pipe(res);
    
  } catch (error) {
    console.error('Lỗi khi proxy ảnh:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi server khi tải ảnh',
      detail: error.message 
    });
  }
});

// Route kiểm tra kết nối tới Replicate API
app.post('/api/test-connection', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.REPLICATE_API_TOKEN;
    
    // Kiểm tra nếu API key không tồn tại
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key không được cung cấp' 
      });
    }
    
    // Khởi tạo client với API key từ request
    const client = new Replicate({
      auth: apiKey,
    });
    
    // Kiểm tra kết nối bằng cách gọi API models
    const response = await client.models.list({ page_size: 1 });
    res.json({ success: true, message: 'Kết nối thành công đến Replicate API' });
  } catch (error) {
    console.error('Lỗi khi kết nối tới Replicate API:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route kiểm tra kết nối tới OpenAI API
app.post('/api/test-openai-connection', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.OPENAI_API_KEY;
    
    // Kiểm tra nếu API key không tồn tại
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'OpenAI API key không được cung cấp' 
      });
    }
    
    // Khởi tạo client với API key từ request
    const client = new OpenAI({
      apiKey: apiKey
    });
    
    // Kiểm tra kết nối bằng cách gọi một API đơn giản
    const response = await client.models.list();
    res.json({ success: true, message: 'Kết nối thành công đến OpenAI API' });
  } catch (error) {
    console.error('Lỗi khi kết nối tới OpenAI API:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route gọi DALL-E của OpenAI để biến đổi hình ảnh
app.post('/api/openai/dall-e', async (req, res) => {
  try {
    const { prompt, image, mask, apiKey, model = 'dall-e-3', size = '1024x1024' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu tham số prompt' 
      });
    }
    
    // Khởi tạo client với API key từ request hoặc biến môi trường
    const client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    
    if (!client) {
      return res.status(400).json({ 
        success: false, 
        error: 'Không thể khởi tạo OpenAI client, vui lòng kiểm tra API key' 
      });
    }

    console.log(`Đang gọi DALL-E với prompt: ${prompt.substring(0, 50)}...`);
    
    let response;
    
    // Xử lý khác nhau tùy vào có ảnh gốc hay không
    if (image) {
      try {
        // Chuẩn bị dữ liệu hình ảnh
        let imageBuffer;
        if (typeof image === 'string' && image.startsWith('data:image')) {
          // Xử lý nếu image là data URL
          imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        } else {
          // Trả về lỗi nếu image không đúng định dạng
          return res.status(400).json({
            success: false,
            error: 'Định dạng hình ảnh không hợp lệ, yêu cầu data URL với base64'
          });
        }
        
        // Tạo temporary file
        const tempImagePath = `./temp/input_image_${Date.now()}.png`;
        const fs = require('fs');
        
        // Đảm bảo thư mục temp tồn tại
        if (!fs.existsSync('./temp')) {
          fs.mkdirSync('./temp', { recursive: true });
        }
        
        // Ghi file
        fs.writeFileSync(tempImagePath, imageBuffer);
        
        // Chuẩn bị mask nếu có
        let maskPath = undefined;
        if (mask) {
          const maskBuffer = Buffer.from(mask.replace(/^data:image\/\w+;base64,/, ""), 'base64');
          maskPath = `./temp/mask_image_${Date.now()}.png`;
          fs.writeFileSync(maskPath, maskBuffer);
        }
        
        // Gọi OpenAI API với file thay vì base64
        response = await client.images.edit({
          prompt: prompt,
          image: fs.createReadStream(tempImagePath),
          mask: maskPath ? fs.createReadStream(maskPath) : undefined,
          n: 1,
          size: size,
          response_format: 'b64_json'
        });
        
        // Dọn dẹp files tạm
        try {
          fs.unlinkSync(tempImagePath);
          if (maskPath) fs.unlinkSync(maskPath);
        } catch (cleanupError) {
          console.warn('Lỗi khi xóa file tạm:', cleanupError);
        }
      } catch (imageError) {
        console.error('Lỗi khi xử lý hình ảnh:', imageError);
        
        // Thử tạo hình ảnh mới nếu edit thất bại
        console.log('Chuyển sang tạo hình ảnh mới với DALL-E...');
        response = await client.images.generate({
          prompt: `${prompt}. This is based on a real photograph.`,
          n: 1,
          size: size,
          response_format: 'b64_json',
          model: model
        });
      }
    } else {
      // Sử dụng Image Generation API nếu không có ảnh gốc
      response = await client.images.generate({
        prompt: prompt,
        n: 1,
        size: size,
        response_format: 'b64_json',
        model: model
      });
    }
    
    if (!response || !response.data || response.data.length === 0) {
      throw new Error('Không nhận được phản hồi từ OpenAI API');
    }
    
    // Trả về base64 của ảnh
    const imageData = response.data[0];
    const base64Image = imageData.b64_json;
    const contentType = 'image/png';
    
    res.json({ 
      success: true, 
      output: `data:${contentType};base64,${base64Image}`,
      model: model
    });
    
  } catch (error) {
    console.error('Lỗi khi gọi OpenAI DALL-E API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      detail: 'Đã xảy ra lỗi khi gọi API OpenAI DALL-E'
    });
  }
});

// Route gọi Hugging Face API
app.post('/api/huggingface', async (req, res) => {
  try {
    const { model, inputs, apiKey } = req.body;
    
    if (!model || !inputs) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu tham số model hoặc inputs' 
      });
    }
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey || process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inputs)
    });
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }
    
    // Nếu response là hình ảnh, chuyển đổi thành base64
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('image')) {
      const buffer = await response.buffer();
      const base64 = buffer.toString('base64');
      res.json({ success: true, output: `data:${contentType};base64,${base64}` });
    } else {
      const data = await response.json();
      res.json({ success: true, output: data });
    }
  } catch (error) {
    console.error('Lỗi khi gọi Hugging Face API:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route mới: Stable Diffusion thông qua Hugging Face
app.post('/api/huggingface/stable-diffusion', async (req, res) => {
  try {
    const { image, prompt, negative_prompt, apiKey, mask } = req.body;
    
    if (!image || !prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu tham số image hoặc prompt' 
      });
    }

    // Lấy API key từ request hoặc biến môi trường
    const token = apiKey || process.env.HUGGINGFACE_API_TOKEN;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key không được cung cấp' 
      });
    }
    
    // Xác định model dựa trên có mask hay không
    let model = req.body.model || 'stabilityai/stable-diffusion-xl-base-1.0';
    
    // Nếu có mask, chuyển sang mô hình inpainting
    if (mask) {
      console.log('Phát hiện mask, sử dụng mô hình inpainting');
      
      // Sử dụng mô hình SDXL Inpainting nếu ban đầu là SDXL
      if (model.includes('stable-diffusion-xl') || model.includes('sdxl')) {
        model = 'diffusers/stable-diffusion-xl-1.0-inpainting';
      } else {
        // Sử dụng mô hình SD 2.0 Inpainting cho các mô hình khác
        model = 'stabilityai/stable-diffusion-2-inpainting';
      }
    }
    
    console.log(`Đang gọi model ${model} với prompt: ${prompt.substring(0, 50)}...`);
    
    // Chuẩn bị đầu vào cho model
    const inputs = {
      prompt: prompt,
      image: image,
      negative_prompt: negative_prompt || ""
    };
    
    // Thêm mask nếu có
    if (mask) {
      inputs.mask = mask;
      console.log('Đã thêm mask vào yêu cầu inpainting');
    }
    
    // Thêm các tham số tùy chọn khác nếu có
    if (req.body.num_inference_steps) inputs.num_inference_steps = req.body.num_inference_steps;
    if (req.body.guidance_scale) inputs.guidance_scale = req.body.guidance_scale;
    
    // Gọi API của Hugging Face
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inputs)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // Xử lý phản hồi
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('image')) {
      // Trả về ảnh dạng base64
      const buffer = await response.buffer();
      const base64 = buffer.toString('base64');
      res.json({ 
        success: true, 
        output: `data:${contentType};base64,${base64}`,
        model: model
      });
    } else {
      // Trả về JSON nếu không phải ảnh
      const data = await response.json();
      res.json({ 
        success: true, 
        output: data,
        model: model
      });
    }
  } catch (error) {
    console.error('Lỗi khi gọi Hugging Face Stable Diffusion:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      detail: 'Đã xảy ra lỗi khi gọi API Hugging Face Stable Diffusion'
    });
  }
});

// Route kiểm tra tình trạng của Hugging Face API
app.post('/api/huggingface/status', async (req, res) => {
  try {
    const { model, apiKey } = req.body;
    
    if (!model) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu tham số model' 
      });
    }
    
    // Lấy API key từ request hoặc biến môi trường
    const token = apiKey || process.env.HUGGINGFACE_API_TOKEN;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key không được cung cấp' 
      });
    }
    
    // Gọi API kiểm tra trạng thái model
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    res.json({ 
      success: true, 
      status: data,
      message: 'Kết nối thành công đến Hugging Face API'
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái Hugging Face API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route chạy mô hình trên Replicate
app.post('/api/replicate/run', async (req, res) => {
  try {
    const { version, input, apiKey } = req.body;
    
    if (!version || !input) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu tham số version hoặc input' 
      });
    }
    
    // Khởi tạo client với API key từ request
    const client = new Replicate({
      auth: apiKey || process.env.REPLICATE_API_TOKEN,
    });
    
    // Chạy mô hình
    const prediction = await client.run(version, { input });
    
    res.json({ success: true, output: prediction });
  } catch (error) {
    console.error('Lỗi khi chạy mô hình trên Replicate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route tạo prediction trên Replicate
app.post('/api/replicate/predictions', async (req, res) => {
  try {
    const { version, input, apiKey } = req.body;
    
    if (!version || !input) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu tham số version hoặc input' 
      });
    }
    
    // Khởi tạo client với API key từ request
    const client = new Replicate({
      auth: apiKey || process.env.REPLICATE_API_TOKEN,
    });
    
    // Kiểm tra API key
    if (!apiKey && !process.env.REPLICATE_API_TOKEN) {
      return res.status(400).json({
        success: false,
        error: 'Không có API key cho Replicate',
        detail: 'Vui lòng cung cấp API key hoặc cấu hình REPLICATE_API_TOKEN trong biến môi trường'
      });
    }
    
    // Kiểm tra input
    if (input.image && typeof input.image === 'string') {
      // Đảm bảo input.image là một data URL hợp lệ
      if (!input.image.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          error: 'Định dạng hình ảnh không hợp lệ',
          detail: 'Hình ảnh phải là một data URL hợp lệ (data:image/xxx;base64,...)'
        });
      }
      
      // Đảm bảo input.image không quá dài hoặc quá ngắn
      const base64Part = input.image.split(',')[1];
      if (!base64Part || base64Part.length < 100) {
        return res.status(400).json({
          success: false,
          error: 'Dữ liệu hình ảnh không hợp lệ',
          detail: 'Dữ liệu hình ảnh quá ngắn hoặc không phải là base64 hợp lệ'
        });
      }
    }
    
    // Kiểm tra mask nếu có
    if (input.mask && typeof input.mask === 'string') {
      // Đảm bảo mask là một data URL hợp lệ
      if (!input.mask.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          error: 'Định dạng mask không hợp lệ',
          detail: 'Mask phải là một data URL hợp lệ (data:image/xxx;base64,...)'
        });
      }
    }
    
    // Xác định model phù hợp dựa trên việc có mask hay không
    let modelVersion = version;
    
    // Nếu có mask và đang sử dụng mô hình SDXL, chuyển sang mô hình inpainting
    if (input.mask && version.includes('stability-ai/sdxl')) {
      console.log('Phát hiện mask, chuyển sang mô hình SDXL inpainting');
      // Sử dụng model version hợp lệ cho SDXL inpainting
      modelVersion = 'stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3';
      
      // Đảm bảo prompt được tối ưu hóa cho inpainting
      if (!input.prompt.includes('inpainting')) {
        input.prompt = `${input.prompt}, precise inpainting, same identity, seamless edit`;
      }
    }
    
    // Log chi tiết để debug
    console.log(`Đang tạo prediction trên Replicate với model: ${modelVersion}`);
    console.log(`Prompt: ${input.prompt ? input.prompt.substring(0, 100) + '...' : 'Không có prompt'}`);
    if (input.mask) {
      console.log('Có sử dụng mask để inpainting');
    }
    
    // Tạo prediction
    try {
      const prediction = await client.predictions.create({
        version: modelVersion,
        input,
      });
      
      // Log thông tin về prediction
      console.log(`Prediction đã tạo thành công với ID: ${prediction.id}`);
      console.log(`Trạng thái: ${prediction.status}`);
      
      res.json({ 
        success: true, 
        prediction,
        detail: 'Prediction đã được tạo thành công'
      });
    } catch (predictionError) {
      console.error('Lỗi cụ thể khi tạo prediction:', predictionError);
      
      // Xử lý lỗi an toàn hơn để tránh đọc body nhiều lần
      let errorDetail = 'Lỗi không xác định từ Replicate API';
      let errorStatus = 500;
      
      // Kiểm tra xem có response và có thể đọc không
      if (predictionError.response && !predictionError.response.bodyUsed) {
        try {
          // Lấy thông tin từ response object trực tiếp
          errorStatus = predictionError.response.status || 500;
          
          // Đọc response text một lần duy nhất
          const responseText = await predictionError.response.text();
          
          try {
            // Thử parse JSON nếu có thể
            const errorJson = JSON.parse(responseText);
            errorDetail = errorJson.detail || errorJson.error || errorJson.message || responseText;
          } catch (parseError) {
            // Nếu không parse được JSON, dùng text
            errorDetail = responseText || predictionError.message;
          }
        } catch (responseError) {
          console.warn('Không thể đọc response:', responseError);
          errorDetail = predictionError.message;
        }
      } else {
        // Nếu không có response hoặc đã được đọc, dùng message từ error
        errorDetail = predictionError.message;
        
        // Phân tích error message để xác định status code và detail
        if (predictionError.message.includes('not found')) {
          errorDetail = `Prediction với ID ${id} không tồn tại hoặc đã bị xóa`;
          errorStatus = 404;
        } else if (predictionError.message.includes('401') || predictionError.message.includes('unauthorized')) {
          errorStatus = 401;
          errorDetail = 'API key không hợp lệ hoặc không có quyền truy cập';
        } else if (predictionError.message.includes('403') || predictionError.message.includes('forbidden')) {
          errorStatus = 403;
          errorDetail = 'Không có quyền truy cập prediction này';
        }
      }
      
      return res.status(errorStatus).json({
        success: false,
        error: predictionError.message,
        detail: errorDetail,
        statusCode: errorStatus
      });
    }
  } catch (error) {
    console.error('Lỗi khi tạo prediction trên Replicate:', error);
    
    // Xác định loại lỗi để trả về thông báo phù hợp
    let errorDetail = 'Đã xảy ra lỗi khi gọi Replicate API';
    let errorStatus = 500;
    
    if (error.name === 'AbortError') {
      errorDetail = 'Yêu cầu đã quá thời gian chờ';
      errorStatus = 408; // Request Timeout
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      errorDetail = 'Lỗi kết nối mạng khi gọi Replicate API';
      errorStatus = 503; // Service Unavailable
    } else if (error.message.includes('invalid_auth') || error.message.includes('unauthorized')) {
      errorDetail = 'API key không hợp lệ hoặc đã hết hạn';
      errorStatus = 401; // Unauthorized
    }
    
    res.status(errorStatus).json({ 
      success: false, 
      error: error.message,
      detail: errorDetail,
      statusCode: errorStatus
    });
  }
});

// Route kiểm tra trạng thái prediction
app.get('/api/replicate/predictions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKey } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu ID prediction' 
      });
    }
    
    // Kiểm tra API key
    if (!apiKey && !process.env.REPLICATE_API_TOKEN) {
      return res.status(400).json({
        success: false,
        error: 'Không có API key cho Replicate',
        detail: 'Vui lòng cung cấp API key hoặc cấu hình REPLICATE_API_TOKEN trong biến môi trường'
      });
    }
    
    // Khởi tạo client với API key từ request
    const client = new Replicate({
      auth: apiKey || process.env.REPLICATE_API_TOKEN,
    });
    
    // Log để debug
    console.log(`Đang kiểm tra prediction với ID: ${id}`);
    
    try {
    // Kiểm tra trạng thái
    const prediction = await client.predictions.get(id);
    
      // Log kết quả
      console.log(`Trạng thái prediction ${id}: ${prediction.status}`);
      if (prediction.output && prediction.output.length > 0) {
        console.log(`Có output: ${prediction.output[0].substring(0, 50)}...`);
      }
      
      // Kiểm tra URL trong output nếu có
      if (prediction.status === 'succeeded' && prediction.output && prediction.output.length > 0) {
        try {
          const outputUrl = prediction.output[0];
          // Kiểm tra xem URL có hợp lệ không
          new URL(outputUrl);
          
          // Thêm các headers CORS để cho phép client truy cập ảnh
          res.setHeader('Access-Control-Expose-Headers', 'x-output-url');
          res.setHeader('x-output-url', outputUrl);
          
          // Thử kiểm tra xem URL có truy cập được không (tùy chọn)
          try {
            const imageCheck = await fetch(outputUrl, { 
              method: 'HEAD',
              signal: AbortSignal.timeout(3000) // Timeout sau 3 giây
            });
            
            if (!imageCheck.ok) {
              console.warn(`URL output không thể truy cập: ${outputUrl}, status: ${imageCheck.status}`);
            }
          } catch (imageError) {
            // Lỗi khi kiểm tra URL (có thể do CORS), nhưng vẫn tiếp tục trả về kết quả
            console.warn(`Không thể kiểm tra URL output: ${imageError.message}`);
          }
        } catch (urlError) {
          console.warn(`URL output không hợp lệ: ${urlError.message}`);
        }
      }
      
      res.json({ 
        success: true, 
        prediction,
        detail: `Trạng thái: ${prediction.status}`
      });
    } catch (predictionError) {
      console.error('Lỗi cụ thể khi kiểm tra prediction:', predictionError);
      
      // Xử lý lỗi an toàn hơn để tránh đọc body nhiều lần
      let errorDetail = 'Lỗi không xác định từ Replicate API';
      let errorStatus = 500;
      
      // Kiểm tra xem có response và có thể đọc không
      if (predictionError.response && !predictionError.response.bodyUsed) {
        try {
          // Lấy thông tin từ response object trực tiếp
          errorStatus = predictionError.response.status || 500;
          
          // Đọc response text một lần duy nhất
          const responseText = await predictionError.response.text();
          
          try {
            // Thử parse JSON nếu có thể
            const errorJson = JSON.parse(responseText);
            errorDetail = errorJson.detail || errorJson.error || errorJson.message || responseText;
          } catch (parseError) {
            // Nếu không parse được JSON, dùng text
            errorDetail = responseText || predictionError.message;
          }
        } catch (responseError) {
          console.warn('Không thể đọc response:', responseError);
          errorDetail = predictionError.message;
        }
      } else {
        // Nếu không có response hoặc đã được đọc, dùng message từ error
        errorDetail = predictionError.message;
        
        // Phân tích error message để xác định status code và detail
        if (predictionError.message.includes('not found')) {
          errorDetail = `Prediction với ID ${id} không tồn tại hoặc đã bị xóa`;
          errorStatus = 404;
        } else if (predictionError.message.includes('401') || predictionError.message.includes('unauthorized')) {
          errorStatus = 401;
          errorDetail = 'API key không hợp lệ hoặc không có quyền truy cập';
        } else if (predictionError.message.includes('403') || predictionError.message.includes('forbidden')) {
          errorStatus = 403;
          errorDetail = 'Không có quyền truy cập prediction này';
        }
      }
      
      return res.status(errorStatus).json({
        success: false,
        error: predictionError.message,
        detail: errorDetail,
        statusCode: errorStatus
      });
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái prediction:', error);
    
    // Xác định loại lỗi để trả về thông báo phù hợp
    let errorDetail = 'Đã xảy ra lỗi khi truy vấn Replicate API';
    let errorStatus = 500;
    
    if (error.name === 'AbortError') {
      errorDetail = 'Yêu cầu đã quá thời gian chờ';
      errorStatus = 408; // Request Timeout
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      errorDetail = 'Lỗi kết nối mạng khi gọi Replicate API';
      errorStatus = 503; // Service Unavailable
    } else if (error.message.includes('invalid_auth') || error.message.includes('unauthorized')) {
      errorDetail = 'API key không hợp lệ hoặc đã hết hạn';
      errorStatus = 401; // Unauthorized
    }
    
    res.status(errorStatus).json({ 
      success: false, 
      error: error.message,
      detail: errorDetail,
      statusCode: errorStatus
    });
  }
});

// Load các biến cần thiết
// let faceDetectionModel;
// let faceTransformationModel;

// Route xử lý biến đổi khuôn mặt bằng mô hình học sâu
app.post('/api/deep-transform', async (req, res) => {
  try {
    const { image, effect, intensity, apiKey } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu dữ liệu hình ảnh đầu vào' 
      });
    }
    
    console.log(`Đang xử lý biến đổi khuôn mặt với hiệu ứng: ${effect}, cường độ: ${intensity}`);
    
    // Chuyển đổi ảnh base64 thành buffer
    let base64Data;
    try {
      base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Kiểm tra buffer có hợp lệ không
      if (!imageBuffer || imageBuffer.length < 100) {
        throw new Error('Dữ liệu hình ảnh không hợp lệ hoặc quá nhỏ');
      }
      
      console.log(`Đã chuyển đổi ảnh thành buffer thành công, kích thước: ${imageBuffer.length} bytes`);
    } catch (imageError) {
      console.error('Lỗi khi xử lý dữ liệu hình ảnh:', imageError);
      return res.status(400).json({ 
        success: false, 
        error: 'Dữ liệu hình ảnh không hợp lệ: ' + imageError.message 
      });
    }
    
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Tạo file tạm để xử lý
    const tempDir = './temp';
    const tempImagePath = `${tempDir}/input_${Date.now()}.jpg`;
    const tempOutputPath = `${tempDir}/output_${Date.now()}.jpg`;
    
    // Đảm bảo thư mục temp tồn tại
    const fs = require('fs');
    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log(`Đã tạo thư mục ${tempDir}`);
      }
    } catch (dirError) {
      console.error('Lỗi khi tạo thư mục temp:', dirError);
      return res.status(500).json({
        success: false,
        error: 'Không thể tạo thư mục tạm thời: ' + dirError.message
      });
    }
    
    // Lưu ảnh vào file tạm
    try {
      fs.writeFileSync(tempImagePath, imageBuffer);
      console.log(`Đã lưu ảnh vào ${tempImagePath}`);
    } catch (writeError) {
      console.error('Lỗi khi lưu ảnh vào file tạm:', writeError);
      return res.status(500).json({
        success: false,
        error: 'Không thể lưu ảnh vào file tạm: ' + writeError.message
      });
    }
    
    // Kiểm tra thư viện sharp
    let sharp;
    try {
      sharp = require('sharp');
      // Kiểm tra xem sharp có hoạt động không
      const testImage = sharp(tempImagePath);
      const metadata = await testImage.metadata();
      console.log(`Ảnh đầu vào: ${metadata.width}x${metadata.height} pixels, định dạng: ${metadata.format}`);
    } catch (sharpError) {
      console.error('Lỗi khi khởi tạo thư viện Sharp:', sharpError);
      return res.status(500).json({
        success: false,
        error: 'Không thể khởi tạo thư viện xử lý ảnh: ' + sharpError.message
      });
    }
    
    // Xử lý biến đổi khuôn mặt theo hiệu ứng và mức độ
    let transformedImageUrl;
    
    try {
      switch (effect) {
        case 'age':
          // Xử lý hiệu ứng lão hóa
          transformedImageUrl = await processAgingEffect(tempImagePath, tempOutputPath, intensity);
          break;
        case 'rejuvenate':
          // Xử lý hiệu ứng trẻ hóa
          transformedImageUrl = await processRejuvenationEffect(tempImagePath, tempOutputPath, intensity);
          break;
        case 'expression':
          // Xử lý thay đổi biểu cảm
          transformedImageUrl = await processExpressionChange(tempImagePath, tempOutputPath, intensity);
          break;
        default:
          // Nếu không khớp với các hiệu ứng trên, sử dụng xử lý mặc định
          transformedImageUrl = await processDefaultEffect(tempImagePath, tempOutputPath, effect, intensity);
      }
      
      console.log(`Đã xử lý biến đổi ảnh thành công, hiệu ứng: ${effect}`);
    } catch (processError) {
      console.error(`Lỗi khi xử lý hiệu ứng ${effect}:`, processError);
      return res.status(500).json({
        success: false,
        error: `Lỗi khi áp dụng hiệu ứng ${effect}: ` + processError.message
      });
    }
    
    // Nếu không thể xử lý, trả về lỗi
    if (!transformedImageUrl) {
      console.error('Không nhận được URL ảnh kết quả');
      return res.status(500).json({
        success: false,
        error: 'Không thể xử lý biến đổi khuôn mặt: Không nhận được kết quả'
      });
    }
    
    // Trả về kết quả
    res.json({
      success: true,
      output: transformedImageUrl
    });
    
    // Dọn dẹp tệp tạm
    try {
      fs.unlinkSync(tempImagePath);
      // Nếu transformedImageUrl không phải là base64, chúng ta giữ lại tệp đầu ra
      // để có thể phục vụ nó thông qua API khác
    } catch (cleanupError) {
      console.warn('Lỗi khi xóa file tạm:', cleanupError);
    }
    
  } catch (error) {
    console.error('Lỗi khi xử lý biến đổi khuôn mặt:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi không xác định khi xử lý biến đổi khuôn mặt'
    });
  }
});

// Route phục vụ ảnh đã xử lý
app.get('/api/transformed-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = `./temp/${filename}`;
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, { root: process.cwd() });
  } else {
    res.status(404).json({
      success: false,
      error: 'Không tìm thấy tệp ảnh'
    });
  }
});

// Hàm xử lý hiệu ứng lão hóa
async function processAgingEffect(inputPath, outputPath, intensity) {
  // Trong triển khai thực tế, đây là nơi bạn sẽ sử dụng mô hình học sâu
  // Hiện tại chúng ta sẽ sử dụng xử lý ảnh cơ bản để mô phỏng
  
  console.log(`Bắt đầu xử lý hiệu ứng lão hóa với cường độ ${intensity}`);
  try {
    // Sử dụng sharp để xử lý ảnh
    const sharp = require('sharp');
    
    // Đọc ảnh đầu vào
    const image = sharp(inputPath);
    console.log('Đã đọc ảnh đầu vào cho hiệu ứng lão hóa');
    
    // Áp dụng các biến đổi để mô phỏng quá trình lão hóa
    // Chuyển đổi cường độ thành số nếu cần
    const intensityValue = parseFloat(intensity) || 0.5;
    console.log(`Áp dụng biến đổi với cường độ: ${intensityValue}`);
    
    await image
      .grayscale(intensityValue * 0.5)  // Giảm màu sắc dựa trên cường độ
      .modulate({
        brightness: 1 - intensityValue * 0.2,  // Giảm độ sáng
        saturation: 1 - intensityValue * 0.3   // Giảm độ bão hòa
      })
      .sharpen(intensityValue * 5)  // Tăng độ sắc nét để tạo nếp nhăn
      .toFile(outputPath);
    
    console.log(`Đã lưu ảnh đã xử lý vào ${outputPath}`);
    
    // Đọc tệp đầu ra và chuyển đổi thành base64
    const fs = require('fs');
    const outputData = fs.readFileSync(outputPath);
    console.log(`Đã đọc dữ liệu ảnh đầu ra, kích thước: ${outputData.length} bytes`);
    
    const base64Output = `data:image/jpeg;base64,${outputData.toString('base64')}`;
    console.log('Đã chuyển đổi ảnh thành base64 thành công');
    
    return base64Output;
  } catch (error) {
    console.error('Lỗi khi xử lý hiệu ứng lão hóa:', error);
    throw new Error(`Không thể xử lý hiệu ứng lão hóa: ${error.message}`);
  }
}

// Hàm xử lý hiệu ứng trẻ hóa
async function processRejuvenationEffect(inputPath, outputPath, intensity) {
  console.log(`Bắt đầu xử lý hiệu ứng trẻ hóa với cường độ ${intensity}`);
  try {
    // Sử dụng sharp để xử lý ảnh
    const sharp = require('sharp');
    
    // Đọc ảnh đầu vào
    const image = sharp(inputPath);
    console.log('Đã đọc ảnh đầu vào cho hiệu ứng trẻ hóa');
    
    // Chuyển đổi cường độ thành số nếu cần
    const intensityValue = parseFloat(intensity) || 0.5;
    console.log(`Áp dụng biến đổi với cường độ: ${intensityValue}`);
    
    // Áp dụng các biến đổi để mô phỏng quá trình trẻ hóa
    await image
      .modulate({
        brightness: 1 + intensityValue * 0.1,  // Tăng độ sáng
        saturation: 1 + intensityValue * 0.2   // Tăng độ bão hòa
      })
      .blur(intensityValue * 0.5)  // Làm mờ nhẹ để giảm nếp nhăn
      .toFile(outputPath);
    
    console.log(`Đã lưu ảnh đã xử lý vào ${outputPath}`);
    
    // Đọc tệp đầu ra và chuyển đổi thành base64
    const fs = require('fs');
    const outputData = fs.readFileSync(outputPath);
    console.log(`Đã đọc dữ liệu ảnh đầu ra, kích thước: ${outputData.length} bytes`);
    
    const base64Output = `data:image/jpeg;base64,${outputData.toString('base64')}`;
    console.log('Đã chuyển đổi ảnh thành base64 thành công');
    
    return base64Output;
  } catch (error) {
    console.error('Lỗi khi xử lý hiệu ứng trẻ hóa:', error);
    throw new Error(`Không thể xử lý hiệu ứng trẻ hóa: ${error.message}`);
  }
}

// Hàm xử lý thay đổi biểu cảm
async function processExpressionChange(inputPath, outputPath, expressionType) {
  // Trong triển khai thực tế, bạn sẽ sử dụng mô hình học sâu để thay đổi biểu cảm
  // Hiện tại, chúng ta sẽ tạo một mô phỏng đơn giản
  
  console.log(`Bắt đầu xử lý thay đổi biểu cảm sang "${expressionType}"`);
  try {
    // Sử dụng sharp để xử lý ảnh
    const sharp = require('sharp');
    
    // Đọc ảnh đầu vào
    const image = sharp(inputPath);
    console.log('Đã đọc ảnh đầu vào cho thay đổi biểu cảm');
    
    // Áp dụng các biến đổi khác nhau dựa trên loại biểu cảm
    switch (expressionType) {
      case 'happy':
        // Tăng độ sáng và độ bão hòa để mô phỏng nụ cười
        console.log('Áp dụng biến đổi cho biểu cảm vui vẻ');
        await image
          .modulate({
            brightness: 1.1,
            saturation: 1.2
          })
          .toFile(outputPath);
        break;
      case 'sad':
        // Giảm độ sáng và độ bão hòa để mô phỏng buồn
        console.log('Áp dụng biến đổi cho biểu cảm buồn');
        await image
          .modulate({
            brightness: 0.9,
            saturation: 0.8
          })
          .toFile(outputPath);
        break;
      case 'angry':
        // Thêm màu đỏ và tăng độ tương phản để mô phỏng giận dữ
        console.log('Áp dụng biến đổi cho biểu cảm giận dữ');
        await image
          .modulate({
            brightness: 0.95,
            saturation: 1.2,
            hue: 330
          })
          .toFile(outputPath);
        break;
      default:
        // Mặc định không thay đổi
        console.log(`Biểu cảm "${expressionType}" không được hỗ trợ, giữ nguyên ảnh`);
        await image.toFile(outputPath);
    }
    
    console.log(`Đã lưu ảnh đã xử lý vào ${outputPath}`);
    
    // Đọc tệp đầu ra và chuyển đổi thành base64
    const fs = require('fs');
    const outputData = fs.readFileSync(outputPath);
    console.log(`Đã đọc dữ liệu ảnh đầu ra, kích thước: ${outputData.length} bytes`);
    
    const base64Output = `data:image/jpeg;base64,${outputData.toString('base64')}`;
    console.log('Đã chuyển đổi ảnh thành base64 thành công');
    
    return base64Output;
  } catch (error) {
    console.error('Lỗi khi xử lý thay đổi biểu cảm:', error);
    throw new Error(`Không thể xử lý thay đổi biểu cảm: ${error.message}`);
  }
}

// Hàm xử lý hiệu ứng mặc định
async function processDefaultEffect(inputPath, outputPath, effect, intensity) {
  console.log(`Bắt đầu xử lý hiệu ứng mặc định "${effect}" với cường độ ${intensity}`);
  try {
    // Sử dụng sharp để xử lý ảnh
    const sharp = require('sharp');
    
    // Đọc ảnh đầu vào
    const image = sharp(inputPath);
    console.log('Đã đọc ảnh đầu vào cho hiệu ứng mặc định');
    
    // Chuyển đổi cường độ thành số nếu cần
    const intensityValue = parseFloat(intensity) || 0.5;
    console.log(`Áp dụng biến đổi với cường độ: ${intensityValue}`);
    
    // Áp dụng các biến đổi cơ bản dựa trên hiệu ứng và cường độ
    await image
      .modulate({
        brightness: 1 + (Math.random() - 0.5) * intensityValue * 0.2,
        saturation: 1 + (Math.random() - 0.5) * intensityValue * 0.3,
        hue: Math.floor(Math.random() * 360)  // Thay đổi màu sắc ngẫu nhiên
      })
      .toFile(outputPath);
    
    console.log(`Đã lưu ảnh đã xử lý vào ${outputPath}`);
    
    // Đọc tệp đầu ra và chuyển đổi thành base64
    const fs = require('fs');
    const outputData = fs.readFileSync(outputPath);
    console.log(`Đã đọc dữ liệu ảnh đầu ra, kích thước: ${outputData.length} bytes`);
    
    const base64Output = `data:image/jpeg;base64,${outputData.toString('base64')}`;
    console.log('Đã chuyển đổi ảnh thành base64 thành công');
    
    return base64Output;
  } catch (error) {
    console.error('Lỗi khi xử lý hiệu ứng mặc định:', error);
    throw new Error(`Không thể xử lý hiệu ứng "${effect}": ${error.message}`);
  }
}

// Route để cải thiện ảnh bằng Gemini API
app.post('/api/gemini/enhance-image', async (req, res) => {
  try {
    const { image, apiKey, prompt } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu dữ liệu hình ảnh đầu vào' 
      });
    }
    
    console.log('Nhận được yêu cầu cải thiện ảnh bằng Gemini API');
    
    // Sử dụng API key từ request hoặc biến môi trường
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY || 'AIzaSyCv69A6TORLnYRhqhtGcT4vmSVkhItGjEo';
    
    // Khởi tạo Gemini API
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Sử dụng model gemini-1.5-flash thay vì gemini-pro-vision (đã bị deprecated)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // Các cài đặt tăng cường cho model mới
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    // Chuẩn bị dữ liệu ảnh
    let imageData;
    try {
      if (typeof image === 'string') {
        if (image.startsWith('data:image')) {
          // Nếu là data URL, giữ nguyên
          imageData = image;
        } else if (image.startsWith('http')) {
          // Nếu là URL, tải ảnh
          console.log('Tải ảnh từ URL:', image.substring(0, 100) + '...');
          const response = await fetch(image);
          const buffer = await response.buffer();
          const base64 = buffer.toString('base64');
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          imageData = `data:${contentType};base64,${base64}`;
        } else {
          throw new Error('Định dạng ảnh không được hỗ trợ');
        }
      } else {
        throw new Error('Dữ liệu ảnh phải là string');
      }
    } catch (imgError) {
      console.error('Lỗi khi xử lý ảnh đầu vào:', imgError);
      return res.status(400).json({
        success: false,
        error: 'Không thể xử lý ảnh đầu vào: ' + imgError.message
      });
    }
    
    console.log('Đã chuẩn bị xong dữ liệu ảnh, gửi đến Gemini API');
    
    // Chuẩn bị phần text prompt, sử dụng prompt từ client hoặc mặc định
    const textPrompt = prompt || "Đây là một bức ảnh đã được tạo bởi AI. Hãy chỉnh sửa và cải thiện bức ảnh này để làm cho nó đẹp hơn, tự nhiên hơn và có tính thẩm mỹ cao hơn. Hãy tập trung vào việc làm mịn các chi tiết, cải thiện màu sắc, độ tương phản và tổng thể bố cục.";
    
    console.log('Sử dụng prompt:', textPrompt.substring(0, 100) + (textPrompt.length > 100 ? '...' : ''));
    
    // Tách phần base64 từ data URL
    const base64Image = imageData.split(',')[1];
    
    // Tạo một đối tượng Part cho ảnh
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageData.split(';')[0].split(':')[1]
      }
    };
    
    try {
      console.log('Gọi Gemini API với model gemini-1.5-flash...');
      
      // Gọi Gemini API với cấu hình mới
      const result = await model.generateContent([textPrompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      console.log('Nhận được phản hồi từ Gemini API:', text.substring(0, 100) + '...');
      
      // Trả về kết quả
      res.json({ 
        success: true, 
        output: imageData, // Trả về ảnh gốc vì Gemini 1.5 không tạo hình ảnh mới
        analysis: text,
        model: "gemini-1.5-flash"
      });
    } catch (geminiError) {
      console.error('Lỗi chi tiết khi gọi Gemini API:', geminiError);
      
      // Xử lý lỗi với thông tin chi tiết hơn
      let errorMessage = geminiError.message || 'Lỗi không xác định từ Gemini API';
      
      // Kiểm tra lỗi cụ thể và đưa ra thông báo rõ ràng hơn
      if (errorMessage.includes('API key not valid') || errorMessage.includes('invalid key')) {
        errorMessage = 'API key không hợp lệ hoặc bị từ chối. Vui lòng kiểm tra lại API key.';
      } else if (errorMessage.includes('quota exceeded')) {
        errorMessage = 'Đã vượt quá quota cho phép của Gemini API.';
      } else if (errorMessage.includes('permission denied')) {
        errorMessage = 'Không có quyền truy cập Gemini API với key đã cung cấp.';
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage,
        output: imageData // Trả về ảnh gốc trong trường hợp lỗi
      });
    }
  } catch (error) {
    console.error('Lỗi tổng thể khi xử lý yêu cầu cải thiện ảnh:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi không xác định khi xử lý yêu cầu'
    });
  }
});

// Route tích hợp Replicate và Gemini
app.post('/api/replicate-to-gemini', async (req, res) => {
  try {
    const { version, input, replicateApiKey, geminiApiKey } = req.body;
    
    if (!version || !input) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu tham số version hoặc input cho Replicate' 
      });
    }
    
    console.log('Bắt đầu quy trình tích hợp Replicate và Gemini');
    
    // 1. Tạo ảnh với Replicate
    // Khởi tạo client với API key từ request
    const client = new Replicate({
      auth: replicateApiKey || process.env.REPLICATE_API_TOKEN,
    });
    
    console.log(`Đang tạo prediction trên Replicate với model: ${version}`);
    
    // Tạo prediction trên Replicate
    const prediction = await client.predictions.create({
      version: version,
      input: input,
    });
    
    // Chờ cho đến khi prediction hoàn thành
    let completedPrediction;
    
    if (prediction.status === 'succeeded') {
      completedPrediction = prediction;
    } else {
      // Polling để chờ kết quả
      console.log('Đang chờ Replicate hoàn thành xử lý...');
      completedPrediction = await waitForReplicateCompletion(client, prediction.id);
    }
    
    if (!completedPrediction || completedPrediction.status !== 'succeeded') {
      throw new Error('Replicate không thể tạo ảnh thành công');
    }
    
    // Lấy URL ảnh từ kết quả của Replicate
    const imageUrl = completedPrediction.output[0];
    console.log(`Replicate đã tạo ảnh thành công: ${imageUrl}`);
    
    // 2. Gửi ảnh đến Gemini để phân tích
    console.log('Gửi ảnh từ Replicate đến Gemini API để phân tích...');
    
    // Tải ảnh từ Replicate
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.buffer();
    const base64Image = imageBuffer.toString('base64');
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64Image}`;
    
    // Khởi tạo Gemini API client trực tiếp thay vì gọi nội bộ API
    const geminiApiKeyToUse = geminiApiKey || process.env.GEMINI_API_KEY || 'AIzaSyCv69A6TORLnYRhqhtGcT4vmSVkhItGjEo';
    const genAI = new GoogleGenerativeAI(geminiApiKeyToUse);
    
    // Sử dụng model gemini-1.5-flash thay vì model cũ
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    // Chuẩn bị prompt cho phân tích hình ảnh
    const analysisPrompt = "Đây là một bức ảnh đã được tạo bởi AI. Hãy phân tích và mô tả chi tiết bức ảnh này, tập trung vào các đặc điểm nổi bật, biểu cảm, và tổng thể bố cục. Đánh giá chất lượng hình ảnh và đề xuất cách cải thiện (nếu cần).";
    
    console.log('Gọi Gemini API để phân tích hình ảnh...');
    
    try {
      // Tạo part cho ảnh
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: contentType
        }
      };
      
      // Gọi Gemini API
      const result = await model.generateContent([analysisPrompt, imagePart]);
      const response = await result.response;
      const analysisText = response.text();
      
      console.log('Nhận được phân tích từ Gemini:', analysisText.substring(0, 100) + '...');
      
      // 3. Trả về kết quả cuối cùng
      res.json({
        success: true,
        replicate: {
          output: imageUrl,
          model: version
        },
        gemini: {
          analysis: analysisText,
          model: "gemini-1.5-flash"
        },
        output: dataUrl // Kết quả cuối cùng
      });
    } catch (geminiError) {
      console.error('Lỗi khi gọi Gemini API:', geminiError);
      
      // Vẫn trả về ảnh từ Replicate nếu Gemini gặp lỗi
      res.json({
        success: true,
        replicate: {
          output: imageUrl,
          model: version
        },
        gemini: {
          error: geminiError.message,
          model: "gemini-1.5-flash"
        },
        output: dataUrl // Vẫn trả về ảnh từ Replicate
      });
    }
  } catch (error) {
    console.error('Lỗi trong quy trình tích hợp Replicate-Gemini:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi không xác định trong quy trình tích hợp',
      detail: 'Đã xảy ra lỗi khi xử lý pipeline Replicate-Gemini'
    });
  }
});

// Hàm hỗ trợ để chờ Replicate hoàn thành
async function waitForReplicateCompletion(client, predictionId, maxAttempts = 30, interval = 2000) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const prediction = await client.predictions.get(predictionId);
    
    if (prediction.status === 'succeeded') {
      return prediction;
    }
    
    if (prediction.status === 'failed') {
      throw new Error(`Replicate prediction thất bại: ${prediction.error || 'Lỗi không xác định'}`);
    }
    
    // Chờ một khoảng thời gian trước khi kiểm tra lại
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }
  
  throw new Error('Quá thời gian chờ Replicate hoàn thành');
}

// Route mặc định
app.get('/', (req, res) => {
  res.send('Server API cho Face AI đang hoạt động');
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
  console.log(`Để kiểm tra server, truy cập http://localhost:${port} trong trình duyệt`);
}); 