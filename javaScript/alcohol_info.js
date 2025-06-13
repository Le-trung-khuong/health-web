// Dữ liệu thông tin về rượu bia và tác hại
const alcoholData = {
    // Thông tin chung
    general: {
        title: "Rượu Bia & Tác Hại",
        description: "Thông tin và cảnh báo về lạm dụng rượu bia",
        warning: "Nội dung này chỉ mang tính chất giáo dục và cảnh báo về tác hại của lạm dụng rượu bia",
        image: "https://tudienbenhhoc.com/wp-content/uploads/2019/07/8.jpg"
    },
    
    // Số liệu thống kê
    statistics: [
        {
            value: "38%",
            label: "Người Việt Nam uống rượu bia quá mức",
            description: "Theo Tổng cục Thống kê Việt Nam"
        },
        {
            value: "8.3%",
            label: "Dân số mắc bệnh liên quan đến rượu bia",
            description: "Theo Bộ Y tế Việt Nam năm 2023"
        },
        {
            value: "40%",
            label: "Tai nạn giao thông liên quan đến rượu bia",
            description: "Theo Ủy ban An toàn Giao thông Quốc gia"
        }
    ],
    
    // Các loại rượu bia phổ biến
    types: [
        {
            name: "Bia",
            alcoholContent: "4-6%",
            icon: "fas fa-beer",
            description: "Đồ uống có cồn được sản xuất từ quá trình lên men của các loại ngũ cốc, chủ yếu là lúa mạch.",
            examples: ["Bia hơi", "Bia chai", "Bia lon", "Bia thủ công"]
        },
        {
            name: "Rượu vang",
            alcoholContent: "8-15%",
            icon: "fas fa-wine-glass-alt",
            description: "Được sản xuất từ nho lên men, có nhiều loại khác nhau như vang đỏ, vang trắng, vang hồng.",
            examples: ["Vang đỏ", "Vang trắng", "Vang hồng", "Vang nổ"]
        },
        {
            name: "Rượu mạnh",
            alcoholContent: "15-60%",
            icon: "fas fa-glass-whiskey",
            description: "Đồ uống có hàm lượng cồn cao, thường được chưng cất và ủ trong thời gian dài.",
            examples: ["Vodka", "Whisky", "Cognac", "Rượu đế", "Rượu nếp"]
        },
        {
            name: "Rượu truyền thống",
            alcoholContent: "20-55%",
            icon: "fas fa-wine-bottle",
            description: "Các loại rượu được sản xuất theo phương pháp truyền thống của Việt Nam.",
            examples: ["Rượu cần", "Rượu làng", "Rượu ngâm", "Rượu thuốc"]
        }
    ],
    
    // Tác hại của rượu bia
    effects: [
        {
            category: "Sức khỏe thể chất",
            icon: "fas fa-heartbeat",
            color: "#e74c3c",
            impacts: [
                "Xơ gan, viêm gan, ung thư gan",
                "Tăng huyết áp, đột quỵ, nhồi máu cơ tim",
                "Viêm tụy cấp và mãn tính",
                "Suy giảm hệ miễn dịch",
                "Rối loạn tiêu hóa, loét dạ dày"
            ]
        },
        {
            category: "Sức khỏe tâm thần",
            icon: "fas fa-brain",
            color: "#9b59b6",
            impacts: [
                "Trầm cảm và lo âu",
                "Mất trí nhớ, suy giảm nhận thức",
                "Rối loạn giấc ngủ",
                "Nghiện rượu bia",
                "Ảo giác, hoang tưởng"
            ]
        },
        {
            category: "Xã hội",
            icon: "fas fa-users",
            color: "#3498db",
            impacts: [
                "Bạo lực gia đình",
                "Mất khả năng lao động",
                "Tai nạn giao thông",
                "Xung đột và cãi vã",
                "Gánh nặng kinh tế cho gia đình và xã hội"
            ]
        },
        {
            category: "Kinh tế",
            icon: "fas fa-coins",
            color: "#f39c12",
            impacts: [
                "Chi phí điều trị bệnh tật",
                "Giảm năng suất lao động",
                "Thiệt hại do tai nạn",
                "Tiêu tốn tiền mua rượu bia",
                "Tăng gánh nặng cho hệ thống y tế"
            ]
        }
    ],
    
    // Quy định pháp luật
    laws: [
        {
            title: "Cấm lái xe khi đã uống rượu bia",
            description: "Nghiêm cấm điều khiển phương tiện giao thông khi đã uống rượu bia",
            icon: "fas fa-car-crash",
            details: "Luật Giao thông đường bộ cấm tuyệt đối việc điều khiển phương tiện giao thông khi đã uống rượu bia. Nồng độ cồn trong máu và hơi thở bằng 0."
        },
        {
            title: "Cấm bán rượu bia cho người dưới 18 tuổi",
            description: "Nghiêm cấm bán, cung cấp rượu bia cho người chưa đủ 18 tuổi",
            icon: "fas fa-child",
            details: "Theo Luật Phòng, chống tác hại của rượu, bia 2019, cấm bán hoặc cung cấp rượu bia cho người dưới 18 tuổi."
        },
        {
            title: "Cấm quảng cáo rượu trên 15 độ",
            description: "Cấm quảng cáo rượu có nồng độ cồn từ 15 độ trở lên",
            icon: "fas fa-ad",
            details: "Luật Quảng cáo và Luật Phòng, chống tác hại của rượu, bia nghiêm cấm quảng cáo rượu từ 15 độ trở lên."
        },
        {
            title: "Quy định về sản xuất, kinh doanh",
            description: "Yêu cầu giấy phép và đảm bảo an toàn thực phẩm",
            icon: "fas fa-industry",
            details: "Cơ sở sản xuất và kinh doanh rượu bia phải có giấy phép, đảm bảo các điều kiện về an toàn thực phẩm theo quy định."
        }
    ],
    
    // Biện pháp phòng tránh
    prevention: [
        {
            title: "Sử dụng có trách nhiệm",
            description: "Nếu uống, hãy uống có trách nhiệm và kiểm soát lượng tiêu thụ",
            icon: "fas fa-check-circle",
            tips: [
                "Biết giới hạn của bản thân",
                "Uống chậm và từ từ",
                "Xen kẽ đồ uống không cồn",
                "Không uống khi đói"
            ]
        },
        {
            title: "Tránh lái xe khi uống",
            description: "Không bao giờ lái xe sau khi uống rượu bia",
            icon: "fas fa-ban",
            tips: [
                "Sử dụng dịch vụ xe công nghệ",
                "Nhờ người không uống lái xe",
                "Sử dụng phương tiện công cộng",
                "Ở lại qua đêm nếu cần thiết"
            ]
        },
        {
            title: "Giáo dục thanh thiếu niên",
            description: "Giúp trẻ em và thanh thiếu niên hiểu về tác hại của rượu bia",
            icon: "fas fa-graduation-cap",
            tips: [
                "Nói chuyện cởi mở với con em",
                "Tham gia các chương trình giáo dục",
                "Làm gương tốt cho con cái",
                "Dạy kỹ năng từ chối rượu bia"
            ]
        },
        {
            title: "Tìm kiếm hỗ trợ",
            description: "Nếu bạn hoặc người thân gặp vấn đề với rượu bia, hãy tìm kiếm sự giúp đỡ",
            icon: "fas fa-hands-helping",
            tips: [
                "Tham gia nhóm hỗ trợ",
                "Tìm đến chuyên gia tâm lý",
                "Điều trị tại các trung tâm cai nghiện",
                "Nói chuyện với người thân tin cậy"
            ]
        }
    ],
    
    // Hỗ trợ và điều trị
    support: [
        {
            name: "Đường dây nóng hỗ trợ người nghiện rượu",
            contact: "1800 8888",
            description: "Hỗ trợ tư vấn 24/7 cho người có vấn đề với rượu bia"
        },
        {
            name: "Trung tâm cai nghiện và phục hồi chức năng",
            contact: "Liên hệ Sở Y tế địa phương",
            description: "Cung cấp dịch vụ cai nghiện và phục hồi chức năng"
        },
        {
            name: "Nhóm hỗ trợ người nghiện rượu",
            contact: "Tìm nhóm tại địa phương qua mạng xã hội",
            description: "Chia sẻ kinh nghiệm và hỗ trợ tinh thần"
        }
    ],
    
    // Câu hỏi thường gặp
    faqs: [
        {
            question: "Uống bao nhiêu rượu bia là quá mức?",
            answer: "Đối với nam giới, không quá 2 đơn vị cồn/ngày và không quá 14 đơn vị/tuần. Đối với nữ giới, không quá 1 đơn vị cồn/ngày và không quá 7 đơn vị/tuần. 1 đơn vị cồn tương đương với 330ml bia 5%, 140ml rượu vang 12% hoặc 40ml rượu mạnh 40%."
        },
        {
            question: "Làm thế nào để từ chối uống rượu bia trong các buổi gặp mặt?",
            answer: "Bạn có thể thẳng thắn từ chối vì lý do sức khỏe, lái xe, hoặc đơn giản là không thích. Thay vào đó, có thể chọn đồ uống không cồn hoặc chỉ nhấp một chút để hòa đồng."
        },
        {
            question: "Làm thế nào để nhận biết người nghiện rượu?",
            answer: "Dấu hiệu có thể bao gồm: uống nhiều hơn dự định, cố gắng giảm uống nhưng không thành công, dành nhiều thời gian uống và phục hồi sau khi uống, cảm thấy thèm uống, bỏ bê công việc và trách nhiệm, tiếp tục uống dù gây ra vấn đề, phát triển khả năng chịu đựng cồn cao hơn, hoặc gặp các triệu chứng cai khi ngừng uống."
        },
        {
            question: "Rượu bia ảnh hưởng đến não bộ như thế nào?",
            answer: "Rượu bia ức chế hoạt động của não, làm chậm thời gian phản ứng, giảm khả năng phán đoán, và ảnh hưởng đến điều phối vận động. Lạm dụng lâu dài có thể gây tổn thương não vĩnh viễn, mất trí nhớ, và các rối loạn tâm thần."
        },
        {
            question: "Có mức sử dụng rượu bia an toàn không?",
            answer: "Không có mức sử dụng rượu bia nào được coi là hoàn toàn an toàn. Tuy nhiên, uống có trách nhiệm, trong giới hạn được khuyến cáo và không thường xuyên sẽ giảm thiểu rủi ro. Đối với một số đối tượng như phụ nữ mang thai, người đang dùng thuốc, và người có bệnh nền, nên tránh hoàn toàn."
        }
    ],
    
    // Alcohol myths vs facts
    mythsVsFacts: [
        {
            myth: "Pha rượu với nước ngọt làm giảm tác hại",
            fact: "Pha với nước ngọt chỉ làm rượu dễ uống hơn nhưng không làm giảm lượng cồn đi vào cơ thể. Trên thực tế, đường trong nước ngọt có thể làm tăng hấp thu cồn nhanh hơn.",
            icon: "fas fa-cocktail"
        },
        {
            myth: "Cà phê giúp tỉnh táo sau khi uống rượu",
            fact: "Cà phê không thể đẩy nhanh quá trình phân hủy cồn trong cơ thể. Caffeine chỉ làm bạn tỉnh táo tạm thời nhưng không giảm nồng độ cồn trong máu.",
            icon: "fas fa-coffee"
        },
        {
            myth: "Bia không có hại bằng rượu mạnh",
            fact: "Một lon bia (330ml, 5%) chứa lượng cồn tương đương với một ly rượu mạnh (40ml, 40%). Tác hại đến từ tổng lượng cồn tiêu thụ, không phải loại đồ uống.",
            icon: "fas fa-beer"
        },
        {
            myth: "Uống nhiều nước trước khi uống rượu sẽ không say",
            fact: "Uống nước giúp cơ thể tránh mất nước nhưng không ngăn cản quá trình hấp thu cồn vào máu. Bạn vẫn có thể say nếu uống nhiều rượu bia.",
            icon: "fas fa-tint"
        }
    ],
    
    // Thông tin mức độ rủi ro cho từng loại đồ uống
    riskInfo: {
        "10": {
            description: "Bia có độ cồn tương đối thấp (4-6%), nhưng uống nhiều vẫn gây tác hại đáng kể đến sức khỏe, đặc biệt là gan và tim mạch.",
            recommendation: "Nên giới hạn ở mức không quá 1-2 lon mỗi ngày và không uống hàng ngày."
        },
        "25": {
            description: "Rượu vang có độ cồn cao hơn bia (8-15%), tác động nhanh hơn đến cơ thể và não bộ. Có thể gây mất kiểm soát nếu uống quá nhiều.",
            recommendation: "Nên giới hạn ở mức không quá 1-2 ly mỗi ngày và có những ngày không uống trong tuần."
        },
        "60": {
            description: "Rượu mạnh có nồng độ cồn cao (15-60%), tác động mạnh và nhanh đến cơ thể, dễ gây say và nghiện. Rủi ro sức khỏe cao.",
            recommendation: "Hạn chế sử dụng, nếu có thì chỉ nên uống không quá 1 ly nhỏ và không thường xuyên."
        },
        "80": {
            description: "Rượu ngâm truyền thống thường có nồng độ cồn cao và không kiểm soát được chất lượng, có thể chứa độc tố nguy hiểm ngoài cồn. Rủi ro rất cao.",
            recommendation: "Nên tránh sử dụng, đặc biệt là những loại rượu không rõ nguồn gốc hoặc tự ủ."
        }
    }
};

// Thêm dữ liệu chi tiết cho từng loại rượu bia
const detailedAlcoholData = {
    // Dữ liệu chi tiết về bia
    "Bia hơi": {
        name: "Bia hơi",
        image: "https://cdn.24h.com.vn/upload/1-2024/images/2024-02-06/adt1707198736-thumb-ton-thuong-gan-do-ruou-bia-va-__anh_cat_3_2_schema_article.jpg",
        alcoholContent: "3-4%",
        description: "Bia hơi là một loại bia tươi phổ biến ở Việt Nam, được sản xuất và tiêu thụ trong thời gian ngắn, không qua quá trình thanh trùng. Bia có vị nhẹ, độ cồn thấp và thường được phục vụ trong các quán bia hơi truyền thống.",
        healthImpact: "Do độ cồn thấp nên tác động lên cơ thể nhẹ hơn so với các loại bia khác, tuy nhiên việc uống nhiều vẫn gây ra các vấn đề sức khỏe như gan nhiễm mỡ, rối loạn tiêu hóa.",
        culturalContext: "Bia hơi là một phần của văn hóa ẩm thực Việt Nam, đặc biệt phổ biến ở miền Bắc. Văn hóa nhậu bia hơi gắn liền với tụ tập bạn bè, đồng nghiệp sau giờ làm việc."
    },
    "Bia chai": {
        name: "Bia chai",
        image: "data:image/jpeg;base64,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",
        alcoholContent: "4-5.5%",
        description: "Bia chai là loại bia được đóng trong chai thủy tinh, qua quá trình thanh trùng để kéo dài thời hạn sử dụng. Các thương hiệu phổ biến ở Việt Nam bao gồm Bia Saigon, Bia Hanoi, Tiger, Heineken, ...",
        healthImpact: "Một chai bia 330ml chứa khoảng 140-150 calo. Tiêu thụ thường xuyên có thể dẫn đến tăng cân, rối loạn chuyển hóa và các vấn đề về gan.",
        culturalContext: "Bia chai thường xuất hiện trong các dịp lễ tết, tiệc tùng và được coi là món quà phổ biến khi thăm hỏi, giao lưu."
    },
    "Bia lon": {
        name: "Bia lon",
        image: "data:image/jpeg;base64,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",
        alcoholContent: "4-5.5%",
        description: "Bia lon về cơ bản giống với bia chai về thành phần, nhưng được đóng trong lon nhôm thay vì chai thủy tinh. Ưu điểm của bia lon là dễ bảo quản, vận chuyển và làm lạnh nhanh hơn.",
        healthImpact: "Tác động sức khỏe tương tự như bia chai. Uống quá nhiều có thể gây ra các vấn đề về gan, tim mạch và rối loạn giấc ngủ.",
        culturalContext: "Bia lon thường được ưa chuộng trong các chuyến dã ngoại, cắm trại hoặc các hoạt động ngoài trời vì tính tiện lợi."
    },
    "Bia thủ công": {
        name: "Bia thủ công",
        image: "https://image.giacngo.vn/w950/UserImages/2011/11/10/10/photo%20%2819%29.JPG",
        alcoholContent: "4-10%",
        description: "Bia thủ công là loại bia được sản xuất theo phương pháp truyền thống, thường ở quy mô nhỏ và có sự sáng tạo cao về hương vị. Từng loại bia thủ công có đặc trưng riêng về mùi vị, màu sắc và thành phần.",
        healthImpact: "Độ cồn có thể cao hơn bia thông thường, cần thận trọng khi sử dụng. Tuy nhiên, một số bia thủ công có thể chứa nhiều chất chống oxy hóa và ít phụ gia hơn.",
        culturalContext: "Bia thủ công đang trở thành xu hướng ở các thành phố lớn, thu hút người tiêu dùng trẻ và những người tìm kiếm trải nghiệm ẩm thực mới lạ."
    },
    
    // Dữ liệu chi tiết về rượu vang
    "Vang đỏ": {
        name: "Vang đỏ",
        image: "https://hoithanh.com/wp-content/uploads/2014/01/20140129092008.jpg",
        alcoholContent: "11-15%",
        description: "Vang đỏ được sản xuất từ nho đỏ, trong quá trình lên men có sự tham gia của vỏ và hạt nho, tạo nên màu sắc đặc trưng và hàm lượng tanin cao. Có nhiều loại vang đỏ khác nhau như Cabernet Sauvignon, Merlot, Pinot Noir.",
        healthImpact: "Uống vang đỏ với lượng vừa phải (1-2 ly/ngày) có thể có lợi cho tim mạch nhờ chất resveratrol, nhưng tiêu thụ quá nhiều vẫn gây hại cho gan và não bộ.",
        culturalContext: "Vang đỏ thường được phục vụ kèm thịt đỏ, được ưa chuộng trong các bữa tiệc sang trọng và được xem là biểu tượng của sự tinh tế trong văn hóa ẩm thực."
    },
    "Vang trắng": {
        name: "Vang trắng",
        image: "https://winecellar.vn/wp-content/uploads/2024/05/ruou-vang-trang-khong-con-cantina-zaccagnini-de-alcoholised-wine-white-1.jpg",
        alcoholContent: "10-14%",
        description: "Vang trắng được sản xuất chủ yếu từ nho xanh, không có sự tham gia của vỏ nho trong quá trình lên men. Vang có vị chua nhẹ, hương thơm của hoa quả và thường được uống lạnh.",
        healthImpact: "Chứa ít chất chống oxy hóa hơn vang đỏ, nhưng vẫn có những tác động tích cực khi uống điều độ. Tuy nhiên, vang trắng thường có tính axit cao hơn có thể gây kích ứng dạ dày.",
        culturalContext: "Thường được phục vụ kèm hải sản, thịt trắng hoặc như aperitif. Vang trắng là lựa chọn phổ biến trong các bữa tiệc mùa hè, không gian nhẹ nhàng."
    },
    "Vang hồng": {
        name: "Vang hồng",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Sancerre_rose_Wine.jpg/1200px-Sancerre_rose_Wine.jpg",
        alcoholContent: "11-13%",
        description: "Vang hồng có màu sắc trung gian giữa vang đỏ và vang trắng, được sản xuất từ nho đỏ nhưng chỉ tiếp xúc với vỏ nho trong thời gian ngắn. Vang có vị nhẹ nhàng, hương thơm của trái cây và hoa.",
        healthImpact: "Tác động sức khỏe tương tự như các loại vang khác. Cung cấp một số chất chống oxy hóa nhưng ít hơn vang đỏ.",
        culturalContext: "Vang hồng thường được uống trong mùa hè, các bữa tiệc ngoài trời và đang trở thành xu hướng trong giới trẻ nhờ hương vị dễ uống và màu sắc bắt mắt."
    },
    "Vang nổ": {
        name: "Vang nổ",
        image: "https://www.lottemart.vn/media/catalog/product/cache/0x0/4/8/4820189121282.jpg.webp",
        alcoholContent: "11-14%",
        description: "Vang nổ hay còn gọi là rượu sâm panh, là loại rượu vang có ga tự nhiên từ quá trình lên men thứ cấp trong chai. Đặc trưng bởi bọt ga mịn và hương vị phức tạp.",
        healthImpact: "Tác động sức khỏe tương tự các loại vang khác. Tuy nhiên, ga trong vang nổ có thể làm tăng tốc độ hấp thu cồn vào máu, gây say nhanh hơn.",
        culturalContext: "Vang nổ thường được sử dụng trong các dịp lễ kỷ niệm, đám cưới hoặc đón năm mới. Là biểu tượng của sự sang trọng và ăn mừng."
    },
    
    // Dữ liệu chi tiết về rượu mạnh
    "Vodka": {
        name: "Vodka",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Smirnoff_Red_Label_8213.jpg/250px-Smirnoff_Red_Label_8213.jpg",
        alcoholContent: "35-50%",
        description: "Vodka là rượu mạnh không màu, không mùi, được chưng cất từ ngũ cốc hoặc khoai tây. Là một trong những loại rượu mạnh phổ biến nhất thế giới, thường được pha chế trong cocktail hoặc uống nguyên chất.",
        healthImpact: "Độ cồn cao gây tác động mạnh đến gan, não và tim mạch. Uống nhiều có thể dẫn đến ngộ độc cồn cấp tính, mất kiểm soát và phụ thuộc rượu.",
        culturalContext: "Nguồn gốc từ Nga và Ba Lan, nhưng đã trở thành đồ uống phổ biến toàn cầu. Ở Việt Nam, vodka thường xuất hiện trong các quán bar, club và được giới trẻ ưa chuộng."
    },
    "Whisky": {
        name: "Whisky",
        image: "https://shop.annam-gourmet.com/pub/media/catalog/product/cache/ee0af4cad0f3673c5271df64bd520339/W/1/W100842_5e63.jpg",
        alcoholContent: "40-55%",
        description: "Whisky là rượu mạnh được chưng cất từ ngũ cốc và ủ trong thùng gỗ sồi, tạo nên màu sắc và hương vị đặc trưng. Có nhiều loại whisky khác nhau như Scotch, Bourbon, Irish, Japanese whisky.",
        healthImpact: "Độ cồn cao gây tổn thương gan, não và hệ thần kinh. Tuy nhiên, khi uống điều độ (30-60ml/ngày), một số nghiên cứu cho thấy có thể giảm nguy cơ bệnh tim mạch.",
        culturalContext: "Whisky được xem là đồ uống sang trọng, thường xuất hiện trong các cuộc họp kinh doanh, câu lạc bộ quý ông. Uống whisky được xem như một nghệ thuật thưởng thức."
    },
    "Cognac": {
        name: "Cognac",
        image: "https://bizweb.dktcdn.net/100/346/633/files/ruou-cognac-hennessy-x-o.jpg?v=1594627749067",
        alcoholContent: "40-45%",
        description: "Cognac là loại brandy cao cấp được sản xuất ở vùng Cognac, Pháp. Được chưng cất từ rượu vang trắng và ủ trong thùng gỗ sồi ít nhất 2 năm. Cognac có màu hổ phách, hương thơm phức tạp và vị ngọt sâu lắng.",
        healthImpact: "Độ cồn cao gây tác động mạnh đến cơ thể. Tiêu thụ quá mức sẽ gây ra tổn thương gan, rối loạn tiêu hóa và tăng nguy cơ nghiện rượu.",
        culturalContext: "Cognac được coi là biểu tượng của sự sang trọng và đẳng cấp. Thường được thưởng thức sau bữa ăn hoặc trong các sự kiện quan trọng, là món quà biếu cao cấp."
    },
    "Rượu đế": {
        name: "Rượu đế",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ruou_de.jpg/960px-Ruou_de.jpg",
        alcoholContent: "35-45%",
        description: "Rượu đế là loại rượu truyền thống của Việt Nam, được chưng cất từ gạo hoặc các loại ngũ cốc khác. Rượu có màu trong suốt, vị mạnh và thường được sản xuất theo phương pháp thủ công.",
        healthImpact: "Độ cồn cao và đôi khi có thể chứa methanol nếu không được sản xuất đúng cách, gây nguy cơ ngộ độc. Uống nhiều gây tổn thương gan, não và hệ tiêu hóa.",
        culturalContext: "Rượu đế có vị trí quan trọng trong văn hóa dân gian Việt Nam, thường xuất hiện trong các lễ hội, cúng giỗ, đám cưới và các dịp quan trọng của gia đình, làng xóm."
    },
    "Rượu nếp": {
        name: "Rượu nếp",
        image: "https://www.lottemart.vn/media/catalog/product/cache/0x0/8/9/8934591001233.jpg.webp",
        alcoholContent: "15-20%",
        description: "Rượu nếp là một loại rượu gạo truyền thống của Việt Nam, được làm từ gạo nếp lên men. Khác với rượu đế, rượu nếp không qua chưng cất nên có độ cồn thấp hơn, vị ngọt và thơm mùi nếp.",
        healthImpact: "Độ cồn thấp hơn rượu đế nhưng vẫn gây ảnh hưởng đến gan và hệ tiêu hóa nếu uống nhiều. Uống quá nhiều có thể gây say và các vấn đề sức khỏe khác.",
        culturalContext: "Rượu nếp là đặc sản của nhiều vùng quê Việt Nam, đặc biệt là miền Bắc. Thường được làm vào dịp Tết hoặc các lễ hội truyền thống, dùng để đãi khách và biếu tặng."
    },
    
    // Dữ liệu chi tiết về rượu truyền thống
    "Rượu cần": {
        name: "Rượu cần",
        image: "https://www.vangdanh.com/wp-content/uploads/2024/04/ruou-can-y-mien-avatar-15.jpg",
        alcoholContent: "15-25%",
        description: "Rượu cần là loại rượu đặc trưng của đồng bào dân tộc thiểu số tại Tây Nguyên, được làm từ gạo nếp hoặc ngô lên men trong các ché lớn. Được uống bằng cách dùng ống hút tre (gọi là 'cần') cắm vào ché.",
        healthImpact: "Độ cồn trung bình, nhưng cách uống trực tiếp và tập thể thường dẫn đến việc tiêu thụ nhiều, gây say và các vấn đề sức khỏe liên quan.",
        culturalContext: "Rượu cần có vai trò quan trọng trong đời sống văn hóa, tâm linh của đồng bào các dân tộc Tây Nguyên, thường được sử dụng trong các lễ hội, cúng tế và đón khách quý."
    },
    "Rượu làng": {
        name: "Rượu làng",
        image: "https://gotrangtri.vn/wp-content/uploads/2018/11/ruou-lang-van-5.jpg",
        alcoholContent: "30-45%",
        description: "Rượu làng là tên gọi chung cho các loại rượu được sản xuất thủ công tại các làng nghề truyền thống. Mỗi làng có công thức và phương pháp riêng, tạo nên hương vị đặc trưng cho rượu.",
        healthImpact: "Độ cồn cao và chất lượng không đồng đều, có thể chứa tạp chất hoặc methanol nếu không được sản xuất đúng cách. Tiêu thụ nhiều gây hại gan, não và hệ thần kinh.",
        culturalContext: "Rượu làng là niềm tự hào và bản sắc của nhiều làng quê Việt Nam, gắn liền với lịch sử phát triển của các làng nghề truyền thống như Vân, Phú Lễ, Bàu Đá."
    },
    "Rượu ngâm": {
        name: "Rượu ngâm",
        image: "https://ruoulangchuon.com/wp-content/uploads/2018/03/ruou-lang-chuon-gao-luc-do-300ml-chai-thuy-tinh-1.jpg",
        alcoholContent: "20-40%",
        description: "Rượu ngâm là loại rượu được tạo ra bằng cách ngâm các loại thảo mộc, động vật hoặc trái cây trong rượu trắng (thường là rượu gạo). Có nhiều loại như rượu ngâm hoa quả, rượu thuốc, rượu rắn, rượu ba kích.",
        healthImpact: "Tùy thuộc vào nguyên liệu ngâm, có thể có tác dụng bổ dưỡng (khi dùng đúng cách) hoặc gây nguy hiểm (khi ngâm với các loại có độc). Độ cồn cao vẫn gây hại cho gan và não bộ.",
        culturalContext: "Rượu ngâm vừa là đồ uống, vừa được xem là thuốc dân gian trong văn hóa Việt Nam. Nhiều loại rượu ngâm còn gắn với các quan niệm về tăng cường sức khỏe, sinh lực."
    },
    "Rượu thuốc": {
        name: "Rượu thuốc",
        image: "https://khamphahue.com.vn/Portals/0/Medias/Nam2023/T1/ruoulangchuon4.jpg",
        alcoholContent: "20-35%",
        description: "Rượu thuốc là loại rượu được ngâm với các vị thuốc đông y nhằm mục đích chữa bệnh hoặc bồi bổ cơ thể. Các thành phần phổ biến bao gồm đương quy, nhân sâm, ba kích, hà thủ ô, đinh lăng.",
        healthImpact: "Nếu sử dụng đúng cách và liều lượng, có thể có tác dụng tích cực đối với một số vấn đề sức khỏe. Tuy nhiên, lạm dụng hoặc sử dụng không đúng chỉ định có thể gây hại.",
        culturalContext: "Rượu thuốc có lịch sử lâu đời trong y học cổ truyền Việt Nam và Trung Quốc. Thường được sử dụng trong mùa đông hoặc sau khi ốm dậy, nhưng ngày nay cũng trở thành đồ uống giải trí."
    }
};

// Hàm mở modal thông tin rượu bia
function openAlcoholModal() {
    const modal = document.querySelector('.alcohol-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load dữ liệu vào modal
    loadAlcoholData();
    
    // Thiết lập các tương tác
    setupInteractions();
}

// Hàm đóng modal
function closeAlcoholModal() {
    const modal = document.querySelector('.alcohol-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Hàm load dữ liệu vào modal
function loadAlcoholData() {
    // Thiết lập tiêu đề và mô tả chung
    document.querySelector('.alcohol-modal-title').textContent = alcoholData.general.title;
    document.querySelector('.alcohol-modal-subtitle').textContent = alcoholData.general.description;
    document.querySelector('.alcohol-warning').textContent = alcoholData.general.warning;
    
    // Load background image
    document.querySelector('.alcohol-modal-header').style.backgroundImage = `url(${alcoholData.general.image})`;
    
    // Load số liệu thống kê
    const statsContainer = document.querySelector('.alcohol-statistics');
    statsContainer.innerHTML = '';
    alcoholData.statistics.forEach(stat => {
        statsContainer.innerHTML += `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
                <div class="stat-description">${stat.description}</div>
            </div>
        `;
    });
    
    // Load loại rượu bia
    const typesContainer = document.querySelector('.alcohol-types-grid');
    typesContainer.innerHTML = '';
    alcoholData.types.forEach(type => {
        // Tạo các phần tử ví dụ có khả năng click
        const examplesList = type.examples.map(ex => {
            // Kiểm tra xem có dữ liệu chi tiết cho loại rượu bia này không
            const hasDetailData = detailedAlcoholData[ex] ? true : false;
            // Thêm class và data-name cho các ví dụ có thể click
            return `<span class="type-example${hasDetailData ? ' clickable' : ''}" ${hasDetailData ? `data-name="${ex}"` : ''}>${ex}</span>`;
        }).join('');
        
        typesContainer.innerHTML += `
            <div class="alcohol-type-card">
                <div class="type-icon"><i class="${type.icon}"></i></div>
                <h4 class="type-name">${type.name}</h4>
                <div class="type-content">
                    <p class="type-content">${type.description}</p>
                    <div class="alcohol-content">Nồng độ cồn: ${type.alcoholContent}</div>
                    <div class="type-examples-container">
                        <div class="type-examples-label">Ví dụ:</div>
                        <div class="type-examples">${examplesList}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Load tác hại
    const effectsContainer = document.querySelector('.alcohol-effects-container');
    effectsContainer.innerHTML = '';
    alcoholData.effects.forEach(effect => {
        const impactsList = effect.impacts.map(impact => `<li>${impact}</li>`).join('');
        effectsContainer.innerHTML += `
            <div class="effect-card" style="--effect-color: ${effect.color}">
                <div class="effect-header">
                    <i class="${effect.icon}"></i>
                    <h4>${effect.category}</h4>
                </div>
                <ul class="effect-impacts">
                    ${impactsList}
                </ul>
            </div>
        `;
    });
    
    // Load quy định pháp luật
    const lawsContainer = document.querySelector('.alcohol-laws-container');
    lawsContainer.innerHTML = '';
    alcoholData.laws.forEach(law => {
        lawsContainer.innerHTML += `
            <div class="law-card">
                <div class="law-icon"><i class="${law.icon}"></i></div>
                <div class="law-content">
                    <h4 class="law-title">${law.title}</h4>
                    <p class="law-description">${law.description}</p>
                    <div class="law-details">${law.details}</div>
                </div>
            </div>
        `;
    });
    
    // Load biện pháp phòng tránh
    const preventionContainer = document.querySelector('.alcohol-prevention-container');
    preventionContainer.innerHTML = '';
    alcoholData.prevention.forEach(prevention => {
        const tipsList = prevention.tips.map(tip => `<li>${tip}</li>`).join('');
        preventionContainer.innerHTML += `
            <div class="prevention-card">
                <div class="prevention-icon"><i class="${prevention.icon}"></i></div>
                <h4 class="prevention-title">${prevention.title}</h4>
                <p class="prevention-description">${prevention.description}</p>
                <ul class="prevention-tips">
                    ${tipsList}
                </ul>
            </div>
        `;
    });
    
    // Load thông tin hỗ trợ
    const supportContainer = document.querySelector('.alcohol-support-container');
    supportContainer.innerHTML = '';
    alcoholData.support.forEach(support => {
        supportContainer.innerHTML += `
            <div class="support-card">
                <h4 class="support-name">${support.name}</h4>
                <div class="support-contact">${support.contact}</div>
                <p class="support-description">${support.description}</p>
            </div>
        `;
    });
    
    // Load câu hỏi thường gặp
    const faqContainer = document.querySelector('.alcohol-faq-container');
    faqContainer.innerHTML = '';
    alcoholData.faqs.forEach((faq, index) => {
        faqContainer.innerHTML += `
            <div class="faq-item">
                <div class="faq-question" data-index="${index}">
                    <span>${faq.question}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">${faq.answer}</div>
            </div>
        `;
    });
    
    // Load myths vs facts
    const mythsContainer = document.querySelector('.myths-container');
    mythsContainer.innerHTML = '';
    alcoholData.mythsVsFacts.forEach(item => {
        mythsContainer.innerHTML += `
            <div class="myth-fact-card">
                <div class="myth-fact-icon"><i class="${item.icon}"></i></div>
                <div class="myth-content">
                    <div class="myth-header">Quan niệm sai lầm</div>
                    <p>${item.myth}</p>
                </div>
                <div class="fact-content">
                    <div class="fact-header">Sự thật</div>
                    <p>${item.fact}</p>
                </div>
            </div>
        `;
    });
    
    // Thêm sự kiện click cho các loại rượu bia có thể click
    document.querySelectorAll('.type-example.clickable').forEach(example => {
        example.addEventListener('click', function() {
            const alcoholName = this.getAttribute('data-name');
            if (alcoholName && detailedAlcoholData[alcoholName]) {
                openAlcoholDetailPopup(alcoholName);
            }
        });
    });
}

// Hàm mở popup chi tiết loại rượu bia
function openAlcoholDetailPopup(alcoholName) {
    const alcoholDetail = detailedAlcoholData[alcoholName];
    if (!alcoholDetail) return;
    
    // Cập nhật thông tin trong popup
    const popup = document.getElementById('alcohol-detail-popup');
    
    // Set image
    const image = popup.querySelector('.alcohol-detail-image');
    image.src = alcoholDetail.image;
    image.alt = alcoholDetail.name;
    
    // Set title and content percent
    popup.querySelector('.alcohol-detail-title').textContent = alcoholDetail.name;
    popup.querySelector('.alcohol-detail-content-percent').textContent = `Nồng độ cồn: ${alcoholDetail.alcoholContent}`;
    
    // Set description
    popup.querySelector('.alcohol-detail-description').textContent = alcoholDetail.description;
    
    // Set health impact
    popup.querySelector('.alcohol-detail-health').textContent = alcoholDetail.healthImpact;
    
    // Set cultural context
    popup.querySelector('.alcohol-detail-cultural').textContent = alcoholDetail.culturalContext;
    
    // Hiển thị popup
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hàm đóng popup chi tiết loại rượu bia
function closeAlcoholDetailPopup() {
    const popup = document.getElementById('alcohol-detail-popup');
    popup.classList.remove('active');
    // Chỉ phục hồi scroll khi modal chính cũng đóng
    if (!document.querySelector('.alcohol-modal.active')) {
        document.body.style.overflow = 'auto';
    }
}

// Thiết lập các tương tác trong modal
function setupInteractions() {
    // Thiết lập sự kiện cho tabs
    document.querySelectorAll('.alcohol-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Xóa active trên tất cả tabs
            document.querySelectorAll('.alcohol-tab').forEach(t => t.classList.remove('active'));
            
            // Ẩn tất cả các section
            document.querySelectorAll('.alcohol-section').forEach(section => section.classList.remove('active'));
            
            // Thêm active vào tab hiện tại
            this.classList.add('active');
            
            // Hiển thị section tương ứng
            document.querySelector(`.${targetSection}-section`).classList.add('active');
        });
    });
    
    // Thiết lập sự kiện cho FAQ
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                this.classList.remove('active');
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                this.classList.add('active');
            }
        });
    });
    
    // Thiết lập sự kiện cho drink options
    document.querySelectorAll('.drink-option').forEach(option => {
        option.addEventListener('click', function() {
            // Lấy giá trị rủi ro
            const riskValue = parseInt(this.getAttribute('data-risk'));
            
            // Xóa trạng thái active ở tất cả options
            document.querySelectorAll('.drink-option').forEach(opt => opt.classList.remove('active'));
            
            // Thêm active vào option hiện tại
            this.classList.add('active');
            
            // Cập nhật vị trí của indicator
            const indicator = document.querySelector('.risk-indicator');
            indicator.style.left = `${riskValue}%`;
            
            // Cập nhật thông tin drink
            const drinkInfo = document.querySelector('.drink-info');
            const riskData = alcoholData.riskInfo[riskValue.toString()];
            drinkInfo.innerHTML = `
                <p><strong>Mức độ rủi ro: ${riskValue}%</strong></p>
                <p>${riskData.description}</p>
                <p><strong>Khuyến nghị:</strong> ${riskData.recommendation}</p>
            `;
            
            // Cập nhật độ cao của chất lỏng
            const liquidFill = document.querySelector('.liquid-fill');
            liquidFill.style.height = `${riskValue}%`;
            
            // Cập nhật nhãn của chất lỏng
            const liquidLabel = document.querySelector('.liquid-label');
            liquidLabel.textContent = `${riskValue}%`;
            
            // Thêm màu sắc thay đổi theo mức độ rủi ro
            let liquidColor;
            if (riskValue < 25) {
                liquidColor = '#2ecc71'; // Xanh lá - rủi ro thấp
            } else if (riskValue < 50) {
                liquidColor = '#f39c12'; // Cam - rủi ro trung bình
            } else {
                liquidColor = '#e74c3c'; // Đỏ - rủi ro cao
            }
            
            // Cập nhật màu cho chất lỏng
            liquidFill.style.background = liquidColor;
            
            // Cập nhật SVG wave
            const svgWave = `data:image/svg+xml;utf8,<svg viewBox='0 0 350 20' xmlns='http://www.w3.org/2000/svg'><path d='M0,20 Q50,0 100,20 Q150,40 200,20 Q250,0 300,20 Q350,40 400,20 L400,150 L0,150 Z' fill='${liquidColor.replace('#', '%23')}'/></svg>`;
            liquidFill.style.setProperty('--wave-background', `url("${svgWave}")`);
            
            // Thêm hiệu ứng rung cho container nếu rủi ro cao
            const liquidContainer = document.querySelector('.liquid-container');
            if (riskValue >= 60) {
                liquidContainer.classList.add('heartbeat');
            } else {
                liquidContainer.classList.remove('heartbeat');
            }
        });
    });
    
    // Kích hoạt option đầu tiên
    document.querySelector('.drink-option').click();
}

// Thiết lập sự kiện khi trang đã load
document.addEventListener('DOMContentLoaded', function() {
    // Thêm sự kiện click cho các nút mở modal
    document.querySelectorAll('.open-alcohol-info').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openAlcoholModal();
        });
    });
    
    // Thêm sự kiện click cho nút đóng modal
    const alcoholModalClose = document.querySelector('.alcohol-modal-close');
    if (alcoholModalClose) {
        alcoholModalClose.addEventListener('click', closeAlcoholModal);
    }
    
    // Thêm sự kiện click cho nút đóng popup chi tiết
    const alcoholDetailClose = document.querySelector('.alcohol-detail-close');
    if (alcoholDetailClose) {
        alcoholDetailClose.addEventListener('click', closeAlcoholDetailPopup);
    }
    
    // Đóng modal và popup khi click bên ngoài
    window.addEventListener('click', function(e) {
        const modal = document.querySelector('.alcohol-modal');
        const detailPopup = document.getElementById('alcohol-detail-popup');
        
        if (e.target === modal) {
            closeAlcoholModal();
        }
        
        if (e.target === detailPopup) {
            closeAlcoholDetailPopup();
        }
    });
    
    // Đóng modal và popup khi nhấn phím ESC
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('alcohol-detail-popup').classList.contains('active')) {
                closeAlcoholDetailPopup();
            } else if (document.querySelector('.alcohol-modal').classList.contains('active')) {
                closeAlcoholModal();
            }
        }
    });
    
    // Tạo thêm bong bóng ngẫu nhiên cho hiệu ứng
    function createRandomBubbles() {
        const bubblesContainer = document.querySelector('.bubbles-container');
        if (bubblesContainer) {
            for (let i = 0; i < 10; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                
                // Tạo kích thước ngẫu nhiên
                const size = Math.floor(Math.random() * 20) + 10; // 10-30px
                bubble.style.width = `${size}px`;
                bubble.style.height = `${size}px`;
                
                // Vị trí ngẫu nhiên
                const left = Math.floor(Math.random() * 100);
                bubble.style.left = `${left}%`;
                
                // Thời gian hoạt ảnh ngẫu nhiên
                const duration = Math.floor(Math.random() * 8) + 8; // 8-16s
                bubble.style.animationDuration = `${duration}s`;
                
                // Delay ngẫu nhiên
                const delay = Math.floor(Math.random() * 5);
                bubble.style.animationDelay = `${delay}s`;
                
                bubblesContainer.appendChild(bubble);
            }
        }
    }
    
    // Gọi hàm tạo bong bóng khi modal mở
    document.querySelectorAll('.open-alcohol-info').forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(createRandomBubbles, 100);
        });
    });
}); 