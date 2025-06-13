// Dữ liệu cho Modal Mại Dâm
const prostitutionData = {
    // Các hình thức mại dâm
    forms: [
        {
            title: "Mại dâm truyền thống",
            description: "Hoạt động mại dâm diễn ra tại các cơ sở được ngụy trang như quán bar, nhà nghỉ, karaoke, massage, hoặc tại đường phố.",
            risks: "Dễ bị bắt giữ, phạt tiền, nhiễm bệnh, bị bạo lực.",
            icon: "fa-hotel",
            examples: "Đường phố, quán karaoke, nhà nghỉ, massage, quán bar",
            statistics: "Chiếm khoảng 60% hoạt động mại dâm tại Việt Nam",
            locations: "Phổ biến tại các thành phố lớn, khu du lịch, khu công nghiệp",
            identifiers: [
                "Trang phục gợi cảm, thường đứng một chỗ hoặc đi lại ở những khu vực nhất định",
                "Tiếp cận khách du lịch hoặc người lạ để mời gọi",
                "Các cơ sở dịch vụ hoạt động đến khuya với biển hiệu mờ ám",
                "Nhân viên massage hoặc tiếp viên chủ động gợi ý dịch vụ 'đặc biệt'"
            ]
        },
        {
            title: "Mại dâm online",
            description: "Sử dụng internet, ứng dụng hẹn hò, mạng xã hội để kết nối với khách hàng tiềm năng.",
            risks: "Khó kiểm soát, nguy cơ bị đánh cắp dữ liệu cá nhân, tống tiền, lừa đảo.",
            icon: "fa-laptop",
            examples: "Trang web, ứng dụng hẹn hò, nhóm kín trên mạng xã hội, dịch vụ 'sugar dating'",
            statistics: "Tăng nhanh trong những năm gần đây, chiếm khoảng 25% hoạt động mại dâm",
            locations: "Không giới hạn địa lý, phổ biến trong giới trẻ và người sử dụng internet thường xuyên",
            identifiers: [
                "Hồ sơ trực tuyến với hình ảnh gợi cảm và mô tả mập mờ",
                "Sử dụng các mã từ ngữ đặc biệt (SP, 'gặp gỡ thân thiết', 'hỗ trợ tài chính')",
                "Quảng cáo dịch vụ 'người mẫu', 'hoa khôi', 'người đồng hành'",
                "Yêu cầu thanh toán trước qua ví điện tử hoặc tiền ảo"
            ]
        },
        {
            title: "Mại dâm trá hình",
            description: "Được ngụy trang dưới dạng dịch vụ massage, karaoke, nhà hàng, bar, hoặc các hình thức giải trí khác.",
            risks: "Nhiều người có thể vô tình tham gia hoặc hỗ trợ hoạt động mại dâm mà không biết.",
            icon: "fa-mask",
            examples: "Tiệm massage 'trọn gói', nhà hàng có 'dịch vụ đặc biệt', quán karaoke kèm 'dịch vụ thêm'",
            statistics: "Chiếm gần 45% hoạt động mại dâm, khó phát hiện và xử lý",
            locations: "Phổ biến tại trung tâm thành phố, khu vực sầm uất, khu du lịch",
            identifiers: [
                "Cơ sở kinh doanh có phòng riêng tư, thường không minh bạch về bảng giá",
                "Nhân viên trang điểm đậm, mặc trang phục gợi cảm không phù hợp với tính chất công việc",
                "Quảng cáo 'nhân viên trẻ đẹp', 'phục vụ tận tình', 'làm hài lòng mọi yêu cầu'",
                "Hoạt động chủ yếu vào buổi tối, có dịch vụ đưa đón khách kín đáo"
            ]
        },
        {
            title: "Buôn bán người",
            description: "Nạn nhân bị lừa gạt, ép buộc, bắt cóc và buôn bán với mục đích bóc lột tình dục.",
            risks: "Vi phạm nhân quyền nghiêm trọng, mất tự do, nguy hiểm tính mạng, khó thoát ra.",
            icon: "fa-people-arrows",
            examples: "Lừa việc làm ở nước ngoài, hứa hẹn lương cao, đưa sang biên giới",
            statistics: "Ước tính có hàng nghìn người Việt Nam bị buôn bán mỗi năm vì mục đích tình dục",
            locations: "Từ nông thôn đến các nước láng giềng như Trung Quốc, Campuchia, Malaysia",
            identifiers: [
                "Lời mời làm việc với mức lương cao bất thường mà không yêu cầu bằng cấp, kinh nghiệm",
                "Đối tượng thu giữ giấy tờ tùy thân (hộ chiếu, CMND) của nạn nhân",
                "Nạn nhân bị cô lập, hạn chế liên lạc với gia đình và bên ngoài",
                "Thường nhắm vào người nghèo, học vấn thấp, người dân tộc thiểu số, phụ nữ trẻ"
            ]
        },
        {
            title: "Du lịch tình dục",
            description: "Khách du lịch đến một địa điểm với mục đích chính là tìm kiếm dịch vụ mại dâm.",
            risks: "Góp phần vào việc phát triển ngành công nghiệp bóc lột tình dục, đặc biệt với trẻ em và phụ nữ.",
            icon: "fa-plane",
            examples: "Tour du lịch kèm 'dịch vụ người lớn', 'club đặc biệt', 'dịch vụ massage cao cấp'",
            statistics: "Đóng góp khoảng 10-15% trong tổng số hoạt động mại dâm tại các khu du lịch lớn",
            locations: "Các thành phố du lịch lớn như Đà Nẵng, Nha Trang, Phú Quốc, Hà Nội, TP.HCM",
            identifiers: [
                "Quảng cáo du lịch với hình ảnh gợi cảm và lời mời 'trải nghiệm đêm'",
                "Hướng dẫn viên địa phương đề xuất dịch vụ 'giải trí người lớn'",
                "Chuyên phục vụ khách nước ngoài, thường có người môi giới nói nhiều thứ tiếng",
                "Hoạt động theo mùa du lịch, tập trung vào các kỳ nghỉ lễ, festival"
            ]
        },
        {
            title: "Mại dâm trẻ vị thành niên",
            description: "Bóc lột tình dục trẻ em dưới 18 tuổi, một trong những hình thức nghiêm trọng nhất của nạn mại dâm.",
            risks: "Vi phạm nghiêm trọng pháp luật, để lại sang chấn tâm lý lâu dài cho nạn nhân, hủy hoại tương lai trẻ em.",
            icon: "fa-child",
            examples: "Trẻ em đường phố, trẻ bị lừa gạt hoặc ép buộc, nạn nhân mua bán người",
            statistics: "Ước tính có hàng nghìn trẻ em là nạn nhân của bóc lột tình dục tại Việt Nam",
            locations: "Các khu vực đô thị lớn, khu du lịch, khu vực biên giới",
            identifiers: [
                "Trẻ em/thanh thiếu niên có biểu hiện sợ hãi, mệt mỏi, có dấu hiệu bị lạm dụng",
                "Có người lớn đi kèm, kiểm soát và nói thay trẻ trong mọi tình huống",
                "Trẻ có tiền, quần áo, đồ điện tử đắt tiền không phù hợp với hoàn cảnh",
                "Thường bị đưa đến các địa điểm biệt lập, khách sạn cao cấp, nhà nghỉ vắng vẻ"
            ]
        }
    ],
    
    // Tác hại của mại dâm
    effects: {
        physical: [
            "Nhiễm các bệnh lây qua đường tình dục: HIV/AIDS, HPV, lậu, giang mai, viêm gan B, C",
            "Chấn thương thể chất do bạo lực, ép buộc quan hệ tình dục",
            "Nghiện ma túy, rượu và các chất kích thích khác để đối phó với thực tế",
            "Suy nhược cơ thể do làm việc quá sức, thiếu nghỉ ngơi, dinh dưỡng kém",
            "Mang thai ngoài ý muốn, phá thai không an toàn"
        ],
        mental: [
            "Trầm cảm, lo âu, căng thẳng và rối loạn tâm lý",
            "Rối loạn căng thẳng sau sang chấn (PTSD)",
            "Tự ti, mặc cảm, tự kỳ thị bản thân",
            "Ý định tự tử, tự làm hại bản thân",
            "Khó khăn trong việc xây dựng các mối quan hệ lành mạnh"
        ],
        social: [
            "Kỳ thị, phân biệt đối xử từ xã hội",
            "Khó hòa nhập cộng đồng sau khi thoát khỏi mại dâm",
            "Mất cơ hội học tập, việc làm chính thức",
            "Bị cô lập khỏi gia đình, bạn bè",
            "Khó khăn khi tìm kiếm sự hỗ trợ pháp lý, y tế do sợ bị kỳ thị"
        ],
        economic: [
            "Thu nhập không ổn định, thường bị bóc lột phần lớn tiền kiếm được",
            "Thiếu bảo hiểm xã hội, bảo hiểm y tế",
            "Không có hợp đồng lao động, quyền lợi người lao động",
            "Khó tích lũy tài sản và đầu tư cho tương lai",
            "Khó tiếp cận các dịch vụ tài chính chính thức như vay vốn ngân hàng"
        ]
    },
    
    // Quan điểm pháp luật Việt Nam
    legalPerspective: {
        laws: [
            {
                title: "Bộ luật Hình sự 2015, sửa đổi 2017",
                content: "Không hình sự hóa người bán dâm, nhưng xử phạt hành chính. Nghiêm cấm và xử lý hình sự đối với các hành vi môi giới mại dâm, tổ chức mại dâm, cưỡng bức mại dâm, mua dâm người dưới 18 tuổi."
            },
            {
                title: "Nghị định 167/2013/NĐ-CP",
                content: "Quy định xử phạt vi phạm hành chính trong lĩnh vực an ninh, trật tự, an toàn xã hội. Người bán dâm có thể bị phạt tiền từ 100.000 đến 300.000 đồng; tái phạm có thể bị phạt từ 300.000 đến 500.000 đồng."
            },
            {
                title: "Luật Phòng, chống mua bán người 2011",
                content: "Quy định các biện pháp phòng ngừa, phát hiện, xử lý hành vi mua bán người, bao gồm cả trường hợp mua bán người vì mục đích tình dục."
            }
        ],
        penalties: {
            buyers: "Người mua dâm bị phạt hành chính từ 500.000 đến 1.000.000 đồng; mua dâm người dưới 18 tuổi bị truy cứu trách nhiệm hình sự với hình phạt lên đến 15 năm tù.",
            organizers: "Người tổ chức mại dâm có thể bị phạt tù từ 5 đến 20 năm, tùy theo mức độ nghiêm trọng và số lượng người bị hại.",
            brokers: "Người môi giới mại dâm có thể bị phạt tù từ 6 tháng đến 15 năm.",
            coercers: "Người cưỡng bức mại dâm có thể bị phạt tù từ 3 đến 20 năm."
        },
        perspective: "Việt Nam theo đuổi chính sách không hình sự hóa người bán dâm mà hướng tới hỗ trợ họ hòa nhập cộng đồng, nhưng nghiêm trị các đối tượng tổ chức, môi giới, cưỡng bức mại dâm. Đây là cách tiếp cận nhân đạo nhằm bảo vệ nạn nhân và trừng phạt những kẻ bóc lột."
    },
    
    // Câu trả lời cho câu hỏi thường gặp
    faqs: [
        {
            question: "Làm thế nào để nhận biết nạn nhân của mại dâm và buôn người?",
            answer: "Nạn nhân thường có biểu hiện sợ hãi, bị hạn chế tự do đi lại, dấu hiệu bị lạm dụng thể chất, không có giấy tờ tùy thân, không biết địa chỉ nơi mình đang ở, hoặc sống trong điều kiện tồi tàn."
        },
        {
            question: "Nên làm gì nếu nghi ngờ có hoạt động mại dâm hoặc buôn người?",
            answer: "Báo ngay cho cơ quan công an, gọi đường dây nóng tố giác tội phạm 113 hoặc đường dây nóng phòng chống mua bán người 111. Không nên tự mình can thiệp để tránh nguy hiểm."
        },
        {
            question: "Làm thế nào để giúp đỡ người muốn thoát khỏi mại dâm?",
            answer: "Kết nối họ với các tổ chức hỗ trợ chuyên nghiệp, cung cấp thông tin về các dịch vụ y tế, tâm lý, pháp lý, đào tạo nghề và tạo điều kiện cho họ hòa nhập cộng đồng mà không bị kỳ thị."
        },
        {
            question: "Tại sao nhiều nạn nhân không thoát khỏi mại dâm dù có cơ hội?",
            answer: "Có nhiều lý do: sợ hãi các mối đe dọa, bị lệ thuộc về kinh tế, nghiện ma túy, cảm thấy tuyệt vọng, xấu hổ, thiếu hệ thống hỗ trợ ổn định hoặc sợ bị kỳ thị khi trở về cộng đồng."
        }
    ],
    
    // Các số liệu thống kê
    statistics: [
        {
            value: "96%",
            label: "Người trong mại dâm muốn thoát ra nhưng không có phương tiện",
            icon: "fa-door-open"
        },
        {
            value: "89%",
            label: "Người trong mại dâm đã từng bị bạo lực thể chất hoặc tình dục",
            icon: "fa-hand-fist"
        },
        {
            value: "78%",
            label: "Người trong mại dâm bị trầm cảm, lo âu hoặc PTSD",
            icon: "fa-brain"
        },
        {
            value: "68%",
            label: "Người trong mại dâm có vấn đề về sức khỏe mạn tính",
            icon: "fa-heart-pulse"
        }
    ],
    
    // Tổ chức hỗ trợ
    supportOrganizations: [
        {
            name: "Blue Dragon Children's Foundation",
            description: "Tổ chức cứu trợ trẻ em và phụ nữ bị buôn bán, cung cấp hỗ trợ pháp lý, tâm lý và tái hòa nhập cộng đồng.",
            phone: "024 3717 0544",
            website: "https://www.bluedragon.org/"
        },
        {
            name: "Trung tâm Phụ nữ và Phát triển (CWD)",
            description: "Cung cấp dịch vụ hỗ trợ tạm lánh, tư vấn tâm lý, đào tạo nghề cho phụ nữ bị bạo lực và buôn bán.",
            phone: "024 3244 8249",
            website: "http://cwpd.org.vn/"
        },
        {
            name: "Pacific Links Foundation",
            description: "Tổ chức chuyên hỗ trợ phòng chống buôn người và tái hòa nhập cộng đồng cho nạn nhân.",
            phone: "090 363 7788",
            website: "https://www.pacificlinks.org/"
        }
    ]
};

// Make sure prostitutionData is globally accessible
window.prostitutionData = prostitutionData;

// Export data for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = prostitutionData;
} 