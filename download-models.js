const fs = require('fs');
const path = require('path');
const https = require('https');

// Thư mục lưu mô hình
const OUTPUT_DIR = path.join(__dirname, 'models', 'face-api-models');

// Danh sách mô hình cần tải
const models = [
  {
    name: 'tiny_face_detector_model-weights_manifest.json',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-weights_manifest.json'
  },
  {
    name: 'tiny_face_detector_model-shard1',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-shard1'
  },
  {
    name: 'face_landmark_68_model-weights_manifest.json',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json'
  },
  {
    name: 'face_landmark_68_model-shard1',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1'
  },
  {
    name: 'face_recognition_model-weights_manifest.json',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-weights_manifest.json'
  },
  {
    name: 'face_recognition_model-shard1',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard1'
  },
  {
    name: 'face_recognition_model-shard2',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard2'
  },
  {
    name: 'ssd_mobilenetv1_model-weights_manifest.json',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-weights_manifest.json'
  },
  {
    name: 'ssd_mobilenetv1_model-shard1',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard1'
  },
  {
    name: 'ssd_mobilenetv1_model-shard2',
    url: 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard2'
  }
];

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Đã tạo thư mục ${OUTPUT_DIR}`);
}

// Hàm tải file từ URL
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`Đang tải ${url}...`);
    
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Không thể tải ${url}, Status Code: ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(outputPath);
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Đã tải thành công: ${outputPath}`);
        resolve();
      });
      
      file.on('error', err => {
        fs.unlink(outputPath, () => {}); // Xóa file nếu có lỗi
        reject(err);
      });
    }).on('error', err => {
      reject(err);
    });
  });
}

// Tải tất cả mô hình
async function downloadAllModels() {
  console.log('Bắt đầu tải mô hình face-api.js...');
  
  try {
    // Tải các mô hình tuần tự để tránh quá tải
    for (const model of models) {
      const outputPath = path.join(OUTPUT_DIR, model.name);
      await downloadFile(model.url, outputPath);
    }
    
    console.log('Đã tải tất cả mô hình thành công!');
  } catch (error) {
    console.error('Lỗi khi tải mô hình:', error);
  }
}

// Bắt đầu tải
downloadAllModels(); 