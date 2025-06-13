// --- START OF FILE drug_info.js ---

// JavaScript cho phần Ma túy
// Định nghĩa dữ liệu mẫu ở phạm vi toàn cục để có thể truy cập từ bất kỳ hàm nào
const sampleDrugTypes = [
    {
        type: "Ma túy tổng hợp",
        description: "Những chất ma túy được tổng hợp từ các hóa chất trong phòng thí nghiệm, thường có tác động mạnh lên thần kinh",
        image: "https://suckhoedoisong.qltns.mediacdn.vn/zoom/600_315/324455921873985536/2021/10/28/avar-matuy-16354354296751068862626-0-30-472-785-crop-1635435440924187297801.jpg",
        effects: ["Ảo giác", "Kích thích thần kinh", "Tăng huyết áp", "Mất kiểm soát"],
        examples: ["Methamphetamine (đá)", "Ecstasy (thuốc lắc)", "LSD", "Ketamine", "MDMA"]
    },
    {
        type: "Thuốc phiện và dẫn xuất",
        description: "Ma túy chiết xuất từ cây thuốc phiện hoặc các dẫn xuất tổng hợp từ morphine có tác dụng gây nghiện cao",
        image: "https://www.cainghienmatuythanhda.com.vn/images/chinhtri/2016-10-04/cansa.jpg", // Lưu ý: Hình này có vẻ giống cần sa hơn là thuốc phiện. Cân nhắc đổi.
        effects: ["Gây ngủ", "Giảm đau", "Hôn mê", "Suy hô hấp", "Ngừng tim"],
        examples: ["Heroin", "Morphine", "Codeine", "Fentanyl", "Methadone"]
    },
    {
        type: "Cần sa và các sản phẩm",
        description: "Các chất chiết xuất từ cây cần sa, chứa thành phần THC gây ảo giác",
        image: "https://cdn-images.vtv.vn/thumb_w/640/562122370168008704/2024/4/1/can-sa-17119790057091103054851.jpg",
        effects: ["Hưng phấn tạm thời", "Lo âu", "Mất trí nhớ ngắn hạn", "Rối loạn nhận thức"],
        examples: ["Cần sa", "Marijuana", "Hash", "Dầu cần sa", "Wax"]
    },
    {
        type: "Chất gây nghiện theo toa",
        description: "Các loại thuốc được kê đơn bởi bác sĩ nhưng có khả năng gây nghiện cao khi sử dụng sai",
        image: "https://vnn-imgs-a1.vgcloud.vn/icdn.dantri.com.vn/2021/05/22/thuoc-bao-che-tu-ma-tuy-960-1621654116094.jpeg",
        effects: ["Giảm đau", "Phụ thuộc thuốc", "Ngộ độc gan", "Suy thận", "Trầm cảm"],
        examples: ["Oxycodone", "Hydrocodone", "Benzodiazepine", "Xanax", "Valium"]
    }
];

const sampleDrugs = [
    {
        id: 1,
        name: "Methamphetamine (Ma túy đá)",
        type: "Ma túy tổng hợp",
        description: "Là loại ma túy dạng tinh thể như đá, tác động mạnh vào hệ thống thần kinh trung ương.",
        image: "https://tc.cdnchinhphu.vn/Uploaded/nguyengiangoanh/2018_03_10/top%209.jpg",
        shortTerm: [
            "Tăng huyết áp, nhịp tim nhanh",
            "Tăng năng lượng, hưng phấn",
            "Giảm cảm giác đói",
            "Mất ngủ nghiêm trọng",
            "Hành vi bốc đồng, hung hăng"
        ],
        longTerm: [
            "Tổn thương não vĩnh viễn",
            "Suy nhược cơ thể",
            "Mất răng, tổn thương da",
            "Loạn thần, ảo giác",
            "Rối loạn tâm thần nặng"
        ]
    },
    {
        id: 2,
        name: "Heroin",
        type: "Thuốc phiện và dẫn xuất",
        description: "Ma túy dạng bột được chiết xuất từ nhựa cây thuốc phiện, gây nghiện mạnh.",
        image: "https://tc.cdnchinhphu.vn/Uploaded/nguyenkimlien/2015_07_14/5.jpg",
        shortTerm: [
            "Cảm giác 'phê', hưng phấn nhanh",
            "Buồn nôn, nôn mửa",
            "Ngứa, khô miệng",
            "Mơ màng, lơ mơ",
            "Suy hô hấp"
        ],
        longTerm: [
            "Tắc mạch máu, suy tim",
            "Nhiễm trùng van tim",
            "Viêm gan B, C và HIV (khi dùng chung kim tiêm)",
            "Suy giảm chức năng gan",
            "Cai nghiện đau đớn"
        ]
    },
    {
        id: 3,
        name: "Ecstasy (Thuốc lắc)",
        type: "Ma túy tổng hợp",
        description: "Thường ở dạng viên nén có màu sắc và hình thù đa dạng, chứa MDMA hoặc các chất tương tự, gây ảo giác và kích thích mạnh.",
        image: "https://vaac.gov.vn/upload/anh-bai-viet/cocain.jpg?v=1.0.0",
        shortTerm: [
            "Cảm giác bay bổng, tăng cường giác quan",
            "Tăng nhịp tim, huyết áp, thân nhiệt",
            "Mất nước, nguy cơ sốc nhiệt",
            "Nghiến răng, căng cơ, lo lắng",
            "Buồn nôn, ảo giác nhẹ"
        ],
        longTerm: [
            "Tổn thương não, suy giảm trí nhớ và khả năng tập trung",
            "Trầm cảm, rối loạn lo âu kéo dài",
            "Rối loạn giấc ngủ",
            "Nguy cơ tổn thương gan, thận (nếu có tạp chất)",
            "Nghiện tâm lý và hội chứng cai khi ngưng sử dụng"
        ]
    },
    {
        id: 4,
        name: "LSD (Lysergic Acid Diethylamide)",
        type: "Ma túy tổng hợp",
        description: "Chất gây ảo giác cực mạnh, thường ở dạng giấy thấm (tem), viên nhỏ hoặc dung dịch. Tác động kéo dài nhiều giờ.",
        image: "https://congan.kontum.gov.vn/upload/105000/20220603/description-https-daihocduochanoi-com-wp-contene993.jpeg",
        shortTerm: [
            "Ảo giác mạnh về thị giác, âm thanh, xúc giác",
            "Thay đổi sâu sắc nhận thức về thời gian, không gian và bản thân",
            "Cảm xúc mãnh liệt, có thể vui vẻ hoặc cực kỳ sợ hãi ('bad trip')",
            "Tăng nhịp tim, huyết áp, đồng tử giãn",
            "Mất ngủ, chán ăn, run rẩy"
        ],
        longTerm: [
            "Rối loạn ảo giác kéo dài (HPPD - Hallucinogen Persisting Perception Disorder)",
            "Tái phát các triệu chứng loạn thần (flashbacks)",
            "Có thể kích hoạt các vấn đề tâm thần tiềm ẩn",
            "Thay đổi nhân cách và nhận thức kéo dài ở một số người"
        ]
    },
    {
        id: 5,
        name: "Ketamine (Ke)",
        type: "Ma túy tổng hợp",
        description: "Ban đầu là thuốc gây mê trong y học và thú y, bị lạm dụng vì tác dụng gây ảo giác và cảm giác 'tách rời thực tại' (K-hole).",
        image: "https://i.ytimg.com/vi/MeRArip6Lb8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDWQ03xYnWwJ5kQ1bszYkt4WUDzuQ",
        shortTerm: [
            "Cảm giác tách rời cơ thể và tâm trí (K-hole ở liều cao)",
            "Mất phối hợp vận động, nói lắp, lú lẫn",
            "Ảo giác, méo mó nhận thức về hình ảnh và âm thanh",
            "Buồn nôn, nôn, tăng huyết áp và nhịp tim",
            "Mất khả năng cảm nhận đau đớn"
        ],
        longTerm: [
            "Tổn thương bàng quang nghiêm trọng ('bàng quang co thắt do ketamine')",
            "Vấn đề về gan và đường mật",
            "Suy giảm trí nhớ, khả năng tập trung và học tập",
            "Trầm cảm, lo âu, rối loạn tâm thần",
            "Phụ thuộc thuốc và hội chứng cai"
        ]
    },
    {
        id: 6,
        name: "MDMA (Molly, Ecstasy dạng bột/tinh thể)",
        type: "Ma túy tổng hợp",
        description: "Dạng bột hoặc tinh thể của 3,4-methylenedioxymethamphetamine, thành phần chính trong nhiều viên thuốc lắc, gây hưng phấn, tăng cảm giác đồng cảm và kết nối.",
        image: "https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2021/10/28/heroin-1635434617365409411355.jpg",
        shortTerm: [
            "Cảm giác hưng phấn, hạnh phúc, yêu đời, gần gũi",
            "Tăng năng lượng, giảm mệt mỏi, tăng nhận thức giác quan",
            "Tăng nhịp tim, huyết áp, thân nhiệt (nguy cơ sốc nhiệt)",
            "Nghiến răng, khô miệng, căng cơ",
            "Buồn nôn, lo lắng, hoang tưởng (đặc biệt ở liều cao hoặc có tạp chất)"
        ],
        longTerm: [
            "Tổn thương tế bào thần kinh serotonin, ảnh hưởng đến tâm trạng và giấc ngủ",
            "Suy giảm trí nhớ, khả năng tập trung, ra quyết định",
            "Trầm cảm, rối loạn lo âu kéo dài",
            "Rối loạn giấc ngủ, suy nhược cơ thể",
            "Nguy cơ các vấn đề tim mạch, tổn thương gan (hiếm gặp)"
        ]
    },
    {
        id: 9, // Tiếp tục từ ID lớn nhất đã có +1, hoặc theo một trình tự hợp lý
        name: "Cần sa (Marijuana)",
        type: "Cần sa và các sản phẩm",
        description: "Là hoa và lá khô của cây Cannabis sativa hoặc Cannabis indica, thường được hút hoặc dùng trong thực phẩm. Chứa THC là thành phần chính gây tác động tâm thần.",
        image: "https://thanhnien.mediacdn.vn/Uploaded/ngocthanh/2022_11_01/ma-tuy-4838.jpg",
        shortTerm: [
            "Cảm giác thư giãn, hưng phấn nhẹ, dễ cười",
            "Tăng cảm giác ngon miệng (đói)",
            "Méo mó nhận thức về thời gian và không gian",
            "Mắt đỏ, khô miệng, tăng nhịp tim nhẹ",
            "Lo lắng, hoang tưởng, mất phương hướng (ở một số người hoặc liều cao)"
        ],
        longTerm: [
            "Vấn đề về hô hấp (viêm phế quản, ho mãn tính nếu hút thường xuyên)",
            "Ảnh hưởng đến sự phát triển não ở thanh thiếu niên (dưới 25 tuổi)",
            "Giảm trí nhớ ngắn hạn, khả năng học tập và tập trung",
            "Nguy cơ phát triển hoặc làm trầm trọng thêm các rối loạn tâm thần (ở người nhạy cảm)",
            "Phụ thuộc tâm lý, hội chứng cai (nhẹ hơn các chất khác)"
        ]
    },
    {
        id: 10,
        name: "Hash (Hashish, Nhựa cần sa)",
        type: "Cần sa và các sản phẩm",
        description: "Là nhựa (resin) được chiết xuất từ cây cần sa, sau đó được nén thành bánh, viên hoặc khối. Có nồng độ THC cao hơn đáng kể so với Marijuana dạng lá/hoa.",
        image: "https://conganthanhhoa.gov.vn/upload/81582/fck/pc04thang/20200421_can-sa-2.jpg",
        shortTerm: [
            "Tác dụng tương tự Marijuana nhưng thường mạnh và kéo dài hơn",
            "Thư giãn sâu, thay đổi nhận thức rõ rệt hơn",
            "Có thể gây buồn ngủ, suy giảm khả năng vận động",
            "Tăng nhịp tim, mắt đỏ, khô miệng",
            "Nguy cơ lo lắng, hoang tưởng cao hơn do nồng độ THC cao"
        ],
        longTerm: [
            "Tương tự Marijuana, nhưng các nguy cơ có thể gia tăng do nồng độ THC cao hơn",
            "Nguy cơ phụ thuộc cao hơn",
            "Ảnh hưởng mạnh hơn đến trí nhớ và chức năng nhận thức",
            "Vấn đề hô hấp nếu hút"
        ]
    },
    {
        id: 11,
        name: "Dầu cần sa (Cannabis Oil)",
        type: "Cần sa và các sản phẩm",
        description: "Là dầu được chiết xuất cô đặc từ cây cần sa, chứa hàm lượng THC và/hoặc CBD rất cao. Có thể dùng để hút qua vape, uống hoặc trộn vào thực phẩm.",
        image: "https://tc.cdnchinhphu.vn/Uploaded/nguyengiangoanh/2017_09_21/can%20sa.jpg",
        shortTerm: [
            "Tác động tâm thần rất mạnh và nhanh nếu chứa nhiều THC",
            "Nếu chứa nhiều CBD và ít THC, tác dụng an thần, giảm đau, ít gây 'phê'",
            "Buồn ngủ, chóng mặt, mất phương hướng",
            "Khô miệng, tăng nhịp tim",
            "Nguy cơ cao bị 'sốc' cần sa (quá liều THC) gây hoảng loạn, buồn nôn"
        ],
        longTerm: [
            "Phụ thuộc nhanh chóng do nồng độ cao",
            "Tác động tiêu cực đến não bộ mạnh hơn, đặc biệt ở người trẻ",
            "Nguy cơ cao về các vấn đề sức khỏe tâm thần",
            "Tác hại của dung môi và phụ gia trong dầu vape (nếu có) chưa được hiểu rõ hoàn toàn"
        ]
    },
    {
        id: 12,
        name: "Wax (Cannabis Concentrate, Sáp cần sa)",
        type: "Cần sa và các sản phẩm",
        description: "Một dạng chiết xuất cần sa siêu cô đặc, có kết cấu như sáp ong (wax), shatter (mảnh vỡ), budder (bơ). Hàm lượng THC có thể lên đến 70-90% hoặc hơn. Thường được sử dụng bằng phương pháp 'dabbing'.",
        image: "https://tc.cdnchinhphu.vn/Uploaded/nguyengiangoanh/2017_09_21/can%20sa.jpg",
        shortTerm: [
            "Tác động tâm thần cực kỳ mạnh, gần như ngay lập tức",
            "Cảm giác 'phê' mãnh liệt, có thể gây choáng ngợp",
            "Hoang tưởng, ảo giác, lo âu cấp tính, cơn hoảng loạn",
            "Mất phối hợp nghiêm trọng, chóng mặt, buồn nôn",
            "Tăng nhịp tim và huyết áp đột ngột"
        ],
        longTerm: [
            "Nguy cơ phụ thuộc và dung nạp (tolerance) tăng rất nhanh",
            "Ảnh hưởng nghiêm trọng và lâu dài đến trí nhớ, khả năng học tập và sức khỏe tâm thần",
            "Hội chứng nôn ói do cannabinoid (CHS) - nôn mửa không kiểm soát",
            "Nguy cơ bỏng khi sử dụng dụng cụ 'dabbing' không đúng cách"
        ]
    },
    {
        id: 13,
        name: "Oxycodone (Ví dụ: OxyContin, Percocet)",
        type: "Chất gây nghiện theo toa",
        description: "Thuốc giảm đau opioid mạnh, được kê đơn cho các cơn đau từ trung bình đến nặng. Có nguy cơ gây nghiện và lạm dụng rất cao nếu sử dụng sai cách hoặc không theo chỉ định.",
        image: "https://cdn.thuvienphapluat.vn//phap-luat/2022-2/CTNN/cong-tac-ve-quan-ly-thuoc-gay-nghien.jpg",
        shortTerm: [
            "Giảm đau hiệu quả, cảm giác thư giãn, lâng lâng",
            "Buồn ngủ, chóng mặt, lú lẫn",
            "Táo bón, buồn nôn, nôn",
            "Ức chế hô hấp (chậm nhịp thở - nguy hiểm khi quá liều)",
            "Ngứa, khô miệng"
        ],
        longTerm: [
            "Nghiện nặng và hội chứng cai nghiện rất khó chịu (đau cơ, tiêu chảy, mất ngủ)",
            "Tăng khả năng chịu đựng (cần liều cao hơn để đạt hiệu quả, tăng nguy cơ quá liều)",
            "Táo bón mãn tính, các vấn đề tiêu hóa khác",
            "Rối loạn nội tiết, giảm ham muốn tình dục, vô sinh",
            "Nguy cơ quá liều dẫn đến tử vong do suy hô hấp"
        ]
    },
    {
        id: 14,
        name: "Xanax (Alprazolam)",
        type: "Chất gây nghiện theo toa",
        description: "Thuốc thuộc nhóm benzodiazepine, được kê đơn để điều trị rối loạn lo âu, cơn hoảng sợ và mất ngủ. Có khả năng gây nghiện cao, đặc biệt khi sử dụng kéo dài hoặc liều cao.",
        image: "https://cdn.thuvienphapluat.vn//phap-luat/2022-2/CTNN/cong-tac-ve-quan-ly-thuoc-gay-nghien.jpg",
        shortTerm: [
            "Giảm lo âu, an thần, gây ngủ",
            "Thư giãn cơ bắp, chóng mặt, buồn ngủ",
            "Suy giảm trí nhớ tạm thời, khó tập trung",
            "Mất phối hợp vận động, nói lắp",
            "Mệt mỏi, cảm giác 'nặng đầu'"
        ],
        longTerm: [
            "Nghiện và hội chứng cai có thể rất nghiêm trọng và nguy hiểm (co giật, ảo giác)",
            "Suy giảm nhận thức, trí nhớ kéo dài, khó khăn trong học tập",
            "Trầm cảm, thờ ơ cảm xúc",
            "Phản ứng nghịch lý (tăng lo âu, kích động, mất ngủ - hiếm gặp)",
            "Khó khăn khi ngừng thuốc, phải giảm liều từ từ dưới sự giám sát y tế"
        ]
    }
    // Bạn có thể thêm các loại ma túy khác vào đây theo cấu trúc tương tự
];


// Dữ liệu mẫu cho hình ảnh minh họa
const sampleDrugImages = {
    1: [ // Methamphetamine
        { id: 1, image_url: "https://tc.cdnchinhphu.vn/Uploaded/nguyengiangoanh/2018_03_10/top%209.jpg", caption: "Ma túy đá (Methamphetamine) dạng tinh thể" },
        { id: 2, image_url: "https://image.baophapluat.vn/w840/Uploaded/2025/zsgkqzztgymu/2016_09_19/1_YBDY.jpg", caption: "Dụng cụ sử dụng ma túy đá" },
        { id: 3, image_url: "https://tc.cdnchinhphu.vn/Uploaded/nguyengiangoanh/2017_10_14/nhan%20biet%20ma%20tuy%20da.jpg", caption: "Tổn thương da do sử dụng ma túy đá lâu dài" }
    ],
    2: [ // Heroin
        { id: 4, image_url: "https://conganthanhhoa.gov.vn/upload/81582/fck/pc04thang/2022_09_27_10_55_3915.jpg", caption: "Heroin dạng bột" },
        { id: 5, image_url: "https://syt.binhdinh.gov.vn/uploads/news/2021_04/bom-tiem-tu-khoa-01.png", caption: "Dụng cụ tiêm chích heroin" }
    ],
    3: [ // Ecstasy (Thuốc lắc)
        { id: 6, image_url: "https://prod-cdn.pharmacity.io/blog/qEzgspEK-image-7.png?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUYXZVMJMURHIYJSN%2F20250113%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20250113T094658Z&X-Amz-SignedHeaders=host&X-Amz-Expires=600&X-Amz-Signature=f50957cf036ed7facc4c463108ccb2e7b67deb76cf4cf12e8d781b6d9a4522b6", caption: "Các loại viên thuốc lắc với màu sắc và hình dạng đa dạng" },
        { id: 7, image_url: "https://file3.qdnd.vn/data/images/0/2019/08/30/nguyenthao/thuoc%20giam%20dau.jpg", caption: "Minh họa tác động của Ecstasy (Hình ảnh mang tính chất minh họa)" }
    ],
    4: [ // LSD
        { id: 8, image_url: "https://retroreport.org/wp-content/uploads/2016/05/httpscdn.sanity.ioimagesepfbj25gproduction5dfa947be7c23b55c45eb410d6414d73525160ca-1920x1080-1.jpg", caption: "Giấy thấm LSD (tem LSD)" },
        { id: 9, image_url: "https://retroreport.org/wp-content/uploads/2016/05/httpscdn.sanity.ioimagesepfbj25gproduction5dfa947be7c23b55c45eb410d6414d73525160ca-1920x1080-1.jpg", caption: "Minh họa ảo giác do LSD (Hình ảnh mang tính chất minh họa)" }
    ],
    5: [ // Ketamine
        { id: 10, image_url: "https://d3s279ah1qv4h7.cloudfront.net/wp-content/uploads/2024/11/26094449/Aegis-Clinical-Update-Image-v12.2024.jpg", caption: "Ketamine dạng tinh thể" },
        { id: 11, image_url: "https://microlife.com.vn/wp-content/uploads/2023/12/dau-dau.png", caption: "Minh họa cảm giác K-hole (Hình ảnh mang tính chất minh họa)" }
    ],
    6: [ // MDMA (Molly)
        { id: 12, image_url: "https://cdn.britannica.com/48/124248-004-D7C1E144/Assortment-pills-Ecstasy.jpg", caption: "MDMA dạng tinh thể (Molly)" },
        { id: 13, image_url: "https://post.healthline.com/wp-content/uploads/2023/08/MDMA--1296x833.jpg", caption: "MDMA dạng bột" }
    ],
    9: [ // Cần sa (Marijuana)
        { id: 14, image_url: "https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/176DE/production/_86266959_86266958.jpg.webp", caption: "Hoa cần sa khô (búp cần sa - Marijuana bud)" },
        { id: 15, image_url: "https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/176DE/production/_86266959_86266958.jpg.webp", caption: "Điếu cần sa (Joint)" },
        { id: 16, image_url: "https://medlatec.vn/media/26680/content/image001-151.jpg", caption: "Cây cần sa đang phát triển" }
    ],
    10: [ // Hash (Hashish)
        { id: 17, image_url: "https://www.marijuana-seeds.nl/wordpress/wp-content/uploads/2017/03/Hash-Block-and-cannabis-leaf.jpg", caption: "Bánh Hashish (nhựa cần sa ép)" },
        { id: 18, image_url: "https://sensiseeds.com/blog/wp-content/uploads/2022/08/How-to-make-hash-from-kief-1024x683.jpg", caption: "Minh họa việc sử dụng Hashish (Hình ảnh mang tính chất minh họa)" }
    ],
    11: [ // Dầu cần sa (Cannabis Oil)
        { id: 19, image_url: "https://www.vinmec.com/static/uploads/20221215_090549_403172_lam_dung_can_sa_max_1800x1800_jpg_17bdaa0e4e.jpg", caption: "Bút vape với đầu chứa dầu cần sa" },
        { id: 20, image_url: "https://baothainguyen.vn/file/oldimage/baothainguyen/UserFiles/image/hiv(41).jpg", caption: "Lọ dầu CBD (một dạng dầu cần sa không gây 'phê' chính)" }
    ],
    12: [ // Wax (Cannabis Concentrate)
        { id: 21, image_url: "https://wholesale.candelacandles.com.au/cdn/shop/files/FullSizeRender_116f8e76-ee4f-48e2-b01f-8326a4096c20_300x300.jpg?v=1721523282", caption: "Sáp cần sa (Cannabis Wax - một dạng BHO)" },
        { id: 22, image_url: "https://wholesale.candelacandles.com.au/cdn/shop/files/FullSizeRender_116f8e76-ee4f-48e2-b01f-8326a4096c20_300x300.jpg?v=1721523282", caption: "Dụng cụ 'dab' (Dab Rig) để sử dụng Wax" }
    ],
    13: [ // Oxycodone
        { id: 23, image_url: "https://www.vinmec.com/static/uploads/20200118_025408_193198_Oxycontin_max_1800x1800_jpg_a5b41fbe4c.jpg", caption: "Viên thuốc OxyContin (chứa Oxycodone)" },
        { id: 24, image_url: "https://www.vinmec.com/static/uploads/20200118_025408_193198_Oxycontin_max_1800x1800_jpg_a5b41fbe4c.jpg", caption: "Lọ thuốc Oxycodone theo toa (Hình ảnh mang tính chất minh họa)" }
    ],
    14: [ // Xanax (Alprazolam)
        { id: 25, image_url: "https://storage4.pca-tech.online/Sites_3/Post/KT/uong-thuoc-xanax-qua-lieu-co-the-gay-tu-vong.webp", caption: "Viên Xanax (Alprazolam) dạng thanh 2mg" },
        { id: 26, image_url: "https://storage4.pca-tech.online/Sites_3/Post/KT/uong-thuoc-xanax-qua-lieu-co-the-gay-tu-vong.webp", caption: "Bao bì thuốc Xanax theo toa (Hình ảnh mang tính chất minh họa)" }
    ]
    // Thêm ảnh cho các loại ma túy khác nếu có
};


document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo modal cho ma túy
    initializeDrugInterface();

    // Thêm sự kiện click cho nút Ma túy trong circular menu
    document.addEventListener('click', function(e) {
        if (e.target.closest('.social-issue-circle.drugs')) {
            e.preventDefault();
            openDrugMenu();
        }
    });
});

// Hàm khởi tạo giao diện ma túy
function initializeDrugInterface() {
    // Tạo container cho modal ma túy
    const drugMenuContainer = document.createElement('div');
    drugMenuContainer.classList.add('drug-menu-container');
    
    // Tạo nội dung modal
    drugMenuContainer.innerHTML = `
        <div class="drug-menu-content">
            <button class="drug-menu-close">
                <i class="fas fa-times"></i>
            </button>
            
            <h2 style="color: #fff; text-align: center; margin-bottom: 20px;">
                <i class="fas fa-pills" style="margin-right: 10px; color: #ff4d4d;"></i>
                Ma Túy - Hiểm Họa Tiềm Ẩn
            </h2>
            
            <div class="drug-warning">
                <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
                Những thông tin dưới đây chỉ để giáo dục và phòng chống, tuyệt đối không thử nghiệm!
            </div>
            
            <div class="drug-types-grid" id="drug-types-grid">
                <!-- Các loại ma túy sẽ được thêm vào đây bằng JavaScript -->
            </div>
            
            <div class="drug-menu-wave"></div>
            <div class="drug-menu-wave"></div>
        </div>
    `;
    
    // Thêm modal vào body
    document.body.appendChild(drugMenuContainer);
    
    // Tạo modal chi tiết cho từng loại ma túy
    const drugDetailModal = document.createElement('div');
    drugDetailModal.classList.add('drug-detail-modal');
    drugDetailModal.innerHTML = `
        <button class="drug-menu-close">
            <i class="fas fa-times"></i>
        </button>
        <div id="drug-detail-content">
            <!-- Nội dung chi tiết sẽ được thêm vào đây -->
        </div>
    `;
    
    document.body.appendChild(drugDetailModal);
    
    // Thêm sự kiện đóng modal
    document.querySelectorAll('.drug-menu-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Ngăn chặn hành vi mặc định và ngăn sự kiện lan truyền
            e.preventDefault();
            e.stopPropagation();
            
            // Chỉ đóng modal cụ thể mà không quay về trang chủ
            if (this.closest('.drug-detail-modal')) {
                // Nếu đang ở trong modal chi tiết, chỉ đóng modal chi tiết
                document.querySelector('.drug-detail-modal').classList.remove('active');
            } else {
                // Nếu đang ở menu chính, đóng cả hai
                closeDrugMenus();
            }
        });
    });
    
    // Ngăn chặn sự kiện click trên nội dung của modal làm đóng modal
    drugMenuContainer.querySelector('.drug-menu-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Sửa: Cần đợi #drug-detail-content được tạo và có nội dung trước khi thêm listener
    // Listener này sẽ được thêm hoặc hoạt động đúng hơn khi #drug-detail-content có con bên trong
    // Tuy nhiên, để an toàn, có thể thêm cho #drug-detail-modal và kiểm tra target.
    // Hoặc thêm khi showDrugDetail
    drugDetailModal.addEventListener('click', function(e) {
      if (e.target.closest('#drug-detail-content')) { // Nếu click vào bên trong content
          e.stopPropagation(); // Ngăn không cho drugDetailModal listener (dưới) bắt
      }
    });
    
    // Cho phép click vào khoảng trống của modal detail để đóng
    drugDetailModal.addEventListener('click', function(e) {
        if (e.target === drugDetailModal) { // Chỉ khi click trực tiếp vào backdrop
            e.preventDefault();
            drugDetailModal.classList.remove('active');
        }
    });
    
    // Hiển thị dữ liệu ban đầu
    loadDrugTypes();
    
    // Thêm dấu hiệu cảnh báo cho nút ma túy trong circular menu
    const drugsButton = document.querySelector('.social-issue-circle.drugs');
    if (drugsButton) {
        const highlight = document.createElement('span');
        highlight.classList.add('drugs-highlight');
        highlight.textContent = '!';
        drugsButton.appendChild(highlight);
        
        // Cập nhật tooltip
        drugsButton.setAttribute('title', 'Thông tin về ma túy - Hiểm họa và tác hại');
    }
}

// Hàm mở modal ma túy
function openDrugMenu() {
    // Đóng circular menu nếu đang mở
    const circularMenu = document.querySelector('.circular-menu');
    const circularMenuBackdrop = document.querySelector('.circular-menu-backdrop');
    
    if (circularMenu && circularMenu.classList.contains('active')) {
        circularMenu.classList.remove('active');
        circularMenuBackdrop.classList.remove('active');
    }
    
    // Mở drug menu
    const drugMenuContainer = document.querySelector('.drug-menu-container');
    drugMenuContainer.classList.add('active');
    
    // Block scroll trên body
    document.body.style.overflow = 'hidden';
}

// Hàm đóng tất cả các modal ma túy
function closeDrugMenus() {
    const drugMenuContainer = document.querySelector('.drug-menu-container');
    const drugDetailModal = document.querySelector('.drug-detail-modal');
    
    if (drugMenuContainer) {
        drugMenuContainer.classList.remove('active');
    }
    
    if (drugDetailModal) {
        drugDetailModal.classList.remove('active');
    }
    
    // Cho phép scroll lại
    document.body.style.overflow = '';
}

// Hàm tải dữ liệu các loại ma túy
function loadDrugTypes() {
    console.log('Sử dụng dữ liệu mẫu cho các loại ma túy');
    renderDrugTypes(sampleDrugTypes);
}

// Hàm hiển thị các loại ma túy
function renderDrugTypes(drugTypes) {
    const drugTypesGrid = document.getElementById('drug-types-grid');
    drugTypesGrid.innerHTML = '';
    
    drugTypes.forEach(type => {
        const card = document.createElement('div');
        card.classList.add('drug-type-card');
        
        card.innerHTML = `
            <div class="drug-type-header" style="background-image: url('${type.image}')">
                <h3 class="drug-type-name">${type.type}</h3>
            </div>
            <div class="drug-type-content">
                <p class="drug-type-desc">${type.description}</p>
                <h4 style="font-size: 1rem; margin: 15px 0 10px;">Tác hại chính:</h4>
                <ul class="drug-effects-list">
                    ${type.effects.map(effect => `<li>${effect}</li>`).join('')}
                </ul>
                <h4 style="font-size: 1rem; margin: 15px 0 10px;">Các dạng phổ biến:</h4>
                <div class="drug-examples">
                    ${type.examples.map(example => 
                        `<span class="drug-example" data-drug="${example}">${example}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        drugTypesGrid.appendChild(card);
    });
    
    // Thêm sự kiện cho các ví dụ ma túy
    document.querySelectorAll('.drug-example').forEach(example => {
        example.addEventListener('click', function() {
            const drugName = this.getAttribute('data-drug');
            openDrugDetail(drugName);
        });
    });
}

// Hàm mở chi tiết về một loại ma túy
function openDrugDetail(drugName) {
    // Tìm kiếm chính xác hơn bằng cách chuẩn hóa tên
    const normalizedDrugName = drugName.toLowerCase().trim();
    const drug = sampleDrugs.find(d => 
        d.name.toLowerCase().includes(normalizedDrugName) || 
        (d.name.toLowerCase().includes(normalizedDrugName.split(" (")[0])) // Xử lý trường hợp (Ma túy đá)
    );
    
    const fallbackDrugInfo = {
        id: 0, // ID cho trường hợp không tìm thấy, để loadDrugImages có thể xử lý (ví dụ không hiển thị gì)
        name: drugName,
        type: "Chưa có thông tin chi tiết",
        description: `Hiện chúng tôi đang cập nhật thông tin chi tiết về "${drugName}". Vui lòng kiểm tra lại sau.`,
        image: "https://via.placeholder.com/400x300?text=Đang+cập+nhật",
        shortTerm: ["Thông tin tác hại ngắn hạn đang được cập nhật."],
        longTerm: ["Thông tin tác hại dài hạn đang được cập nhật."]
    };

    showDrugDetail(drug || fallbackDrugInfo);
}

// Hàm lấy ảnh minh họa cho một loại ma túy
function getDrugImages(drugId) {
    return sampleDrugImages[drugId] || [];
}

// Hàm hiển thị chi tiết một loại ma túy
function showDrugDetail(drug) {
    const detailContent = document.getElementById('drug-detail-content');
    
    const drugId = drug.id || 0; // Nếu drug.id không có (fallback), drugId sẽ là 0
    
    let htmlContent = `
        <div class="drug-detail-header">
            <img src="${drug.image}" alt="${drug.name}" class="drug-detail-img">
            <div>
                <h3 class="drug-detail-name">${drug.name}</h3>
                <span class="drug-detail-type">${drug.type}</span>
            </div>
        </div>
        
        <div class="drug-detail-content-inner"> <!-- Bọc nội dung bên trong để scroll -->
            <div class="drug-detail-section">
                <h4>Mô tả</h4>
                <p>${drug.description}</p>
            </div>
            
            <div class="drug-detail-section">
                <h4>Tác hại của ${drug.name}</h4>
                <div class="drug-effects-container">
                    <div class="effect-column">
                        <div class="effect-title short-term">
                            <i class="fas fa-bolt"></i> Tác hại ngắn hạn
                        </div>
                        <ul class="effect-list">
                            ${drug.shortTerm.map(effect => `<li>${effect}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="effect-column">
                        <div class="effect-title long-term">
                            <i class="fas fa-skull-crossbones"></i> Tác hại dài hạn
                        </div>
                        <ul class="effect-list">
                            ${drug.longTerm.map(effect => `<li>${effect}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="drug-detail-section">
                <h4>Cách phòng tránh</h4>
                <ul class="effect-list">
                    <li>Nắm rõ thông tin và tác hại của ma túy để tránh tò mò</li>
                    <li>Tránh xa những nơi, những đối tượng có thể tiếp xúc với ma túy</li>
                    <li>Không bao giờ thử "chỉ một lần" vì nguy cơ nghiện rất cao</li>
                    <li>Xây dựng lối sống lành mạnh, các mối quan hệ tích cực và kỹ năng từ chối</li>
                    <li>Tìm kiếm sự giúp đỡ nếu gặp khó khăn hoặc bị lôi kéo</li>
                </ul>
            </div>

            <div class="drug-detail-section drug-images-section">
                <div class="drug-images-header">
                    <h4>Ảnh minh họa</h4>
                    ${drug.id !== 0 ? `<button class="btn btn-sm btn-add-image" onclick="openAddImageForm(${drugId})">
                        <i class="fas fa-plus"></i> Thêm ảnh
                    </button>` : ''}
                </div>
                <div id="drug-images-gallery" class="drug-images-gallery">
                    <!-- Ảnh minh họa sẽ được thêm vào đây -->
                </div>
            </div>
            
            ${drug.id !== 0 ? `<!-- Form thêm ảnh mới -->
            <div id="add-image-form" class="add-image-form" style="display: none;">
                <h4>Thêm ảnh minh họa mới cho ${drug.name}</h4>
                <div class="form-group">
                    <label for="image-upload">Chọn ảnh:</label>
                    <input type="file" id="image-upload" accept="image/*" class="form-control">
                </div>
                <div class="form-group">
                    <label for="image-caption">Mô tả:</label>
                    <input type="text" id="image-caption" placeholder="Nhập mô tả cho ảnh" class="form-control">
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="uploadImage(${drugId})">Tải lên</button>
                    <button class="btn btn-secondary" onclick="closeAddImageForm()">Hủy</button>
                </div>
            </div>` : ''}
        </div>
    `;
    
    detailContent.innerHTML = htmlContent;
    
    const drugDetailModal = document.querySelector('.drug-detail-modal');
    drugDetailModal.classList.add('active');
    
    // Tải và hiển thị ảnh minh họa (chỉ khi drugId hợp lệ)
    if (drugId !== 0) {
      document.getElementById('drug-images-gallery').innerHTML = '<div class="drug-images-loading">Đang tải ảnh...</div>';
      loadDrugImages(drugId);
    } else {
      document.getElementById('drug-images-gallery').innerHTML = '<p class="no-images">Không có ảnh minh họa cho mục này.</p>';
    }
}


// Hàm tải và hiển thị ảnh minh họa
function loadDrugImages(drugId) {
    const imagesGallery = document.getElementById('drug-images-gallery');
    if (!imagesGallery) return; // Guard clause

    const images = getDrugImages(drugId);
    
    imagesGallery.innerHTML = ''; // Xóa thông báo đang tải hoặc ảnh cũ
    
    if (images.length > 0) {
        images.forEach(image => {
            const imageElement = document.createElement('div');
            imageElement.classList.add('drug-image-item');
            imageElement.innerHTML = `
                <div class="drug-image-container">
                    <img src="${image.image_url}" alt="${image.caption || 'Ảnh minh họa'}" class="drug-image">
                    <div class="drug-image-actions">
                        <button class="btn-image-action btn-view" onclick="viewFullImage('${image.image_url}', '${image.caption || ''}')">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="btn-image-action btn-delete" onclick="deleteImage(${image.id}, ${drugId})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <p class="drug-image-caption">${image.caption || 'Ảnh minh họa'}</p>
            `;
            imagesGallery.appendChild(imageElement);
        });
    } else {
        imagesGallery.innerHTML = '<p class="no-images">Chưa có ảnh minh họa nào cho loại ma túy này.</p>';
    }
}

// Hàm mở form thêm ảnh mới
function openAddImageForm(drugId) {
    const addImageForm = document.getElementById('add-image-form');
    if (!addImageForm) return;
    addImageForm.style.display = 'block';
    addImageForm.scrollIntoView({ behavior: 'smooth' });
}

// Hàm đóng form thêm ảnh
function closeAddImageForm() {
    const addImageForm = document.getElementById('add-image-form');
    if (!addImageForm) return;
    addImageForm.style.display = 'none';
    
    const imageUpload = document.getElementById('image-upload');
    const imageCaption = document.getElementById('image-caption');
    if(imageUpload) imageUpload.value = '';
    if(imageCaption) imageCaption.value = '';
}

// Hàm tải lên ảnh mới
function uploadImage(drugId) {
    const fileInput = document.getElementById('image-upload');
    const captionInput = document.getElementById('image-caption');
    
    if (!fileInput || !captionInput) {
        alert('Lỗi: Không tìm thấy form tải ảnh.');
        return;
    }
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Vui lòng chọn một ảnh để tải lên');
        return;
    }
    
    const file = fileInput.files[0];
    const caption = captionInput.value;
    
    if (!file.type.match('image.*')) {
        alert('Vui lòng chọn một file ảnh hợp lệ (jpg, png, gif, webp)');
        return;
    }
    
    showToast('Đang tải ảnh lên...', 'info');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        if (!sampleDrugImages[drugId]) {
            sampleDrugImages[drugId] = [];
        }
        
        // Tìm ID lớn nhất hiện có trong tất cả các ảnh để tạo ID mới không trùng lặp
        const allImageIds = Object.values(sampleDrugImages).flat().map(img => img.id);
        const newImageId = allImageIds.length > 0 ? Math.max(...allImageIds) + 1 : 1;
        
        sampleDrugImages[drugId].push({
            id: newImageId,
            image_url: e.target.result, // Đây là base64 data URL
            caption: caption
        });
        
        closeAddImageForm();
        loadDrugImages(drugId); // Tải lại ảnh cho drugId này
        showToast('Đã tải ảnh lên thành công (dữ liệu mẫu)', 'success');
    };
    
    reader.readAsDataURL(file);
}


// Hàm xem ảnh kích thước đầy đủ
function viewFullImage(imageUrl, caption) {
    const fullImageModal = document.createElement('div');
    fullImageModal.classList.add('full-image-modal');
    
    fullImageModal.innerHTML = `
        <div class="full-image-container">
            <button class="close-full-image">
                <i class="fas fa-times"></i>
            </button>
            <img src="${imageUrl}" alt="${caption}" class="full-image">
            ${caption ? `<p class="full-image-caption">${caption}</p>` : ''}
        </div>
    `;
    
    document.body.appendChild(fullImageModal);
    
    setTimeout(() => {
        fullImageModal.classList.add('active');
    }, 10); // Đợi một chút để CSS transition có hiệu lực
    
    const closeButton = fullImageModal.querySelector('.close-full-image');
    
    const closeHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        fullImageModal.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(fullImageModal)) {
                document.body.removeChild(fullImageModal);
            }
        }, 300); // Đợi animation hoàn thành
    };

    closeButton.addEventListener('click', closeHandler);
    
    fullImageModal.addEventListener('click', function(e) {
        if (e.target === fullImageModal) { // Chỉ đóng khi click vào backdrop
           closeHandler(e);
        }
    });
}

// Hàm xóa ảnh
function deleteImage(imageId, drugId) {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này không? (Thao tác này chỉ ảnh hưởng dữ liệu mẫu)')) {
        return;
    }
    
    if (sampleDrugImages[drugId]) {
        sampleDrugImages[drugId] = sampleDrugImages[drugId].filter(img => img.id !== imageId);
    }
    
    loadDrugImages(drugId);
    showToast('Đã xóa ảnh thành công (dữ liệu mẫu)', 'success');
}

// Hàm hiển thị thông báo toast (ví dụ đơn giản)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.classList.add('toast-message', `toast-${type}`);
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 500);
    }, 3000);
}

// Bạn cần thêm CSS cho .toast-message
/* Ví dụ CSS cho Toast:
.toast-message {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 5px;
    background-color: #333;
    color: white;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.5s ease;
}
.toast-message.show {
    opacity: 1;
}
.toast-message.toast-success { background-color: #4CAF50; }
.toast-message.toast-error { background-color: #f44336; }
.toast-message.toast-info { background-color: #2196F3; }
*/

// --- END OF FILE drug_info.js ---