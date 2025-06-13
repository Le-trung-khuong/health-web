const fs = require('fs');
const path = require('path');

// Thư mục chứa template và output
const templatePath = path.join(__dirname, 'html', 'quy.html');
const outputDir = path.join(__dirname, 'html', 'regions');

// Đảm bảo thư mục output tồn tại
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Đọc nội dung template
let template = fs.readFileSync(templatePath, 'utf8');

// Danh sách region
const regionData = {
  VNTS: { name: "Trường Sa", volunteers: 120, funds: 50000000 },
  VNHS: { name: "Hoàng Sa", volunteers: 120, funds: 50000000 },
  VN01: { name: "Lai Châu", volunteers: 120, funds: 50000000 },
  VN02: { name: "Lào Cai", volunteers: 120, funds: 50000000 },
  VN03: { name: "Hà Giang", volunteers: 120, funds: 50000000 },
  VN04: { name: "Cao Bằng", volunteers: 120, funds: 50000000 },
  VN05: { name: "Sơn La", volunteers: 120, funds: 50000000 },
  VN06: { name: "Yên Bái", volunteers: 120, funds: 50000000 },
  VN07: { name: "Tuyên Quang", volunteers: 120, funds: 50000000 },
  VN09: { name: "Lạng Sơn", volunteers: 120, funds: 50000000 },
  VN13: { name: "Quảng Ninh", volunteers: 120, funds: 50000000 },
  VN14: { name: "Hòa Bình", volunteers: 120, funds: 50000000 },
  VN15: { name: "Hà Tây", volunteers: 120, funds: 50000000 },
  VN18: { name: "Ninh Bình", volunteers: 120, funds: 50000000 },
  VN20: { name: "Thái Bình", volunteers: 120, funds: 50000000 },
  VN21: { name: "Thanh Hóa", volunteers: 120, funds: 50000000 },
  VN22: { name: "Nghệ An", volunteers: 120, funds: 50000000 },
  VN23: { name: "Hà Tĩnh", volunteers: 120, funds: 50000000 },
  VN24: { name: "Quảng Bình", volunteers: 120, funds: 50000000 },
  VN25: { name: "Quảng Trị", volunteers: 120, funds: 50000000 },
  VN26: { name: "Thừa Thiên–Huế", volunteers: 120, funds: 50000000 },
  VN27: { name: "Quảng Nam", volunteers: 120, funds: 50000000 },
  VN28: { name: "Kon Tum", volunteers: 120, funds: 50000000 },
  VN29: { name: "Quảng Ngãi", volunteers: 120, funds: 50000000 },
  VN30: { name: "Gia Lai", volunteers: 120, funds: 50000000 },
  VN31: { name: "Bình Định", volunteers: 120, funds: 50000000 },
  VN32: { name: "Phú Yên", volunteers: 120, funds: 50000000 },
  VN33: { name: "Đắk Lắk", volunteers: 120, funds: 50000000 },
  VN34: { name: "Khánh Hòa", volunteers: 120, funds: 50000000 },
  VN35: { name: "Lâm Đồng", volunteers: 120, funds: 50000000 },
  VN36: { name: "Ninh Thuận", volunteers: 120, funds: 50000000 },
  VN37: { name: "Tây Ninh", volunteers: 120, funds: 50000000 },
  VN39: { name: "Đồng Nai", volunteers: 120, funds: 50000000 },
  VN40: { name: "Bình Thuận", volunteers: 120, funds: 50000000 },
  VN41: { name: "Long An", volunteers: 120, funds: 50000000 },
  VN43: { name: "Bà Rịa–Vũng Tàu", volunteers: 120, funds: 50000000 },
  VN44: { name: "An Giang", volunteers: 120, funds: 50000000 },
  VN45: { name: "Đồng Tháp", volunteers: 120, funds: 50000000 },
  VN46: { name: "Tiền Giang", volunteers: 120, funds: 50000000 },
  VN47: { name: "Kiên Giang", volunteers: 120, funds: 50000000 },
  VN49: { name: "Vĩnh Long", volunteers: 120, funds: 50000000 },
  VN50: { name: "Bến Tre", volunteers: 120, funds: 50000000 },
  VN51: { name: "Trà Vinh", volunteers: 120, funds: 50000000 },
  VN52: { name: "Sóc Trăng", volunteers: 120, funds: 50000000 },
  VN53: { name: "Bắc Kạn", volunteers: 120, funds: 50000000 },
  VN54: { name: "Bắc Giang", volunteers: 120, funds: 50000000 },
  VN55: { name: "Bạc Liêu", volunteers: 120, funds: 50000000 },
  VN56: { name: "Bắc Ninh", volunteers: 120, funds: 50000000 },
  VN57: { name: "Bình Dương", volunteers: 120, funds: 50000000 },
  VN58: { name: "Bình Phước", volunteers: 120, funds: 50000000 },
  VN59: { name: "Cà Mau", volunteers: 120, funds: 50000000 },
  VN61: { name: "Hải Dương", volunteers: 120, funds: 50000000 },
  VN63: { name: "Hà Nam", volunteers: 120, funds: 50000000 },
  VN66: { name: "Hưng Yên", volunteers: 120, funds: 50000000 },
  VN67: { name: "Nam Định", volunteers: 120, funds: 50000000 },
  VN68: { name: "Phú Thọ", volunteers: 120, funds: 50000000 },
  VN69: { name: "Thái Nguyên", volunteers: 120, funds: 50000000 },
  VN70: { name: "Vĩnh Phúc", volunteers: 120, funds: 50000000 },
  VN71: { name: "Điện Biên", volunteers: 120, funds: 50000000 },
  VN72: { name: "Đắk Nông", volunteers: 120, funds: 50000000 },
  VN73: { name: "Hậu Giang", volunteers: 120, funds: 50000000 },
  VNCT: { name: "Cần Thơ", volunteers: 120, funds: 50000000 },
  VNDN: { name: "Đà Nẵng", volunteers: 120, funds: 50000000 },
  VNHN: { name: "Hà Nội", volunteers: 120, funds: 50000000 },
  VNHP: { name: "Hải Phòng", volunteers: 120, funds: 50000000 },
  VNSG: { name: "Hồ Chí Minh", volunteers: 120, funds: 50000000 }
};

// Generate files
Object.entries(regionData).forEach(([id, data]) => {
  const outputPath = path.join(outputDir, `${id}.html`);
  // Thay placeholder trong template:
  // - <title>...</title>
  // - <b>NHÃN CỦA TRANG</b>
  // - action="../thank-you.html?region=${id}"
  let content = template
    .replace(/<title>.*<\/title>/, `<title>${data.name}</title>`)   
    .replace(/<b>NHÃN CỦA TRANG<\/b>/, `<b>${data.name}</b>`)  
    // thay ${id} trong action của form
    .replace(/action="\.\.\/thank-you\.html\?region=\$\{id\}"/g, `action="../thank-you.html?region=${id}"`);

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`Generated ${outputPath}`);
});

console.log('All region pages generated.');
