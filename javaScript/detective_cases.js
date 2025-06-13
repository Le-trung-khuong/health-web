/**
 * Detective Cases - Quản lý dữ liệu các vụ án cho trò chơi
 */

class DetectiveCases {
    constructor() {
        // Danh sách vụ án
        this.cases = [];
        
        // Cache cho chi tiết vụ án
        this.caseDetails = {};
        
        // Đã tải dữ liệu chưa
        this.loaded = false;
        
        console.log('Khởi tạo quản lý vụ án...');
    }

    /**
     * Kiểm tra xem có đang chạy ở chế độ local hay không
     * @returns {boolean} True vì bây giờ luôn chạy ở chế độ local
     */
    isLocalMode() {
        // Luôn trả về true vì bây giờ mọi dữ liệu đều nằm trong code
        return true;
    }
    
    /**
     * Mở khóa tất cả các vụ án
     * @returns {number} Số lượng vụ án đã mở khóa
     */
    unlockAllCases() {
        console.log('Đang mở khóa tất cả các vụ án...');
        
        // Đảm bảo dữ liệu đã được tải
        if (!this.loaded) {
            this.loadCases();
        }
        
        let unlockedCount = 0;
        
        // Duyệt qua tất cả các vụ án và mở khóa
        this.cases.forEach(caseItem => {
            if (caseItem.is_locked) {
                caseItem.is_locked = false;
                unlockedCount++;
                console.log(`Đã mở khóa vụ án: ${caseItem.title}`);
            }
        });
        
        // Cập nhật lại dữ liệu trong cache nếu có
        Object.keys(this.caseDetails).forEach(caseId => {
            if (this.caseDetails[caseId].is_locked || this.caseDetails[caseId].isLocked) {
                this.caseDetails[caseId].is_locked = false;
                this.caseDetails[caseId].isLocked = false;
            }
        });
        
        console.log(`Đã mở khóa tổng cộng ${unlockedCount} vụ án`);
        return unlockedCount;
    }

    /**
     * Tải dữ liệu vụ án
     */
    async loadCases() {
        try {
            console.log('Đang tải dữ liệu vụ án...');
            
            // Kiểm tra xem đã tải dữ liệu chưa
            if (this.loaded) {
                return true;
            }
            
            // Sử dụng dữ liệu trong code thay vì truy vấn database
            this.cases = [
                {
                    id: 'drug-school-1',
                    title: 'Bóng Ma Trong Trường',
                    description: 'Điều tra việc lan truyền chất gây nghiện trong một trường học. Học sinh có dấu hiệu bất thường và bạn cần tìm ra nguồn gốc và ngăn chặn kịp thời.',
                    type: 'Ma túy',
                    difficulty: 1,
                    mode: 'story',
                    is_locked: false,
                    image: 'https://png.pngtree.com/thumb_back/fh260/background/20230704/pngtree-specter-in-the-dark-eerie-imagery-of-an-apocalyptic-hell-3d-image_3760788.jpg',
                    timed: false,
                    time_limit: 0
                },
                {
                    id: 'alcohol-family-1',
                    title: 'Bí Mật Gia Đình',
                    description: 'Điều tra một vụ tai nạn giao thông và khám phá bí mật về vấn đề nghiện rượu giấu kín trong một gia đình tưởng chừng hạnh phúc.',
                    type: 'Rượu bia',
                    difficulty: 2,
                    mode: 'story',
                    is_locked: true,
                    image: 'https://kenh14cdn.com/2017/shutterstock-96492581-1495014692663.jpg',
                    timed: false,
                    time_limit: 0,
                    requiredCases: ['drug-school-1']
                },
                {
                    id: 'drug-network-1',
                    title: 'Đường Dây Ma Túy',
                    description: 'Điều tra và triệt phá một đường dây ma túy lớn đang nhắm vào học sinh nhiều trường trong khu vực.',
                    type: 'Ma túy',
                    difficulty: 3,
                    mode: 'story',
                    is_locked: true,
                    image: 'https://media.vietnamplus.vn/images/dadb342ab8dc2808f476878603a4ae305d27c98ee6162a6223dbd8224526b445bb144e14cdc432f703a07a583090b03158db261190b4d4ffeaa677e558889593/heroin.jpg.webp',
                    timed: false,
                    time_limit: 0,
                    requiredCases: ['alcohol-family-1']
                }
            ];
            
            // Đánh dấu đã tải xong
            this.loaded = true;
            console.log('Đã tải dữ liệu vụ án từ mã nguồn');
            
            // Tải sẵn chi tiết vụ án đầu tiên
            await this.loadLocalCaseDetails('drug-school-1');
            
            return true;
        } catch (error) {
            console.error('Lỗi tải dữ liệu vụ án:', error);
            return false;
        }
    }

    /**
     * Tải chi tiết vụ án từ dữ liệu mẫu
     * @param {string} id - ID của vụ án
     * @returns {object|null} Chi tiết vụ án mẫu
     */
    async loadLocalCaseDetails(id) {
        console.log('Tải chi tiết vụ án local cho ID:', id);
        
        // Kiểm tra id có hợp lệ không
        if (!id) {
            console.error('Lỗi: id không được cung cấp cho loadLocalCaseDetails');
            return null;
        }
        
        // Kiểm tra trong cache
        if (this.caseDetails[id]) {
            console.log('Đã tìm thấy vụ án trong cache:', id);
            return this.caseDetails[id];
        }
        
        // Dữ liệu chi tiết của vụ án "Bóng Ma Trong Trường"
        if (id === 'drug-school-1') {
            const caseDetail = {
                id: 'drug-school-1',
                title: 'Bóng Ma Trong Trường',
                description: 'Điều tra việc lan truyền chất gây nghiện trong một trường học. Học sinh có dấu hiệu bất thường và bạn cần tìm ra nguồn gốc và ngăn chặn kịp thời.',
                type: 'Ma túy',
                difficulty: 1,
                mode: 'story',
                is_locked: false,
                isLocked: false,
                image: 'https://hatinh.edu.vn/upload/32982/20240509/dt5_c1ebf.jpg',
                timed: false,
                time_limit: 0,
                timeLimit: 0,
                steps: [
                    {
                        id: 'drug-school-1-step-1',
                        case_id: 'drug-school-1',
                        narrative: '<h3>Phòng Hiệu Trưởng</h3><p>Hiệu trưởng đã mời bạn đến điều tra về tình trạng một số học sinh có biểu hiệu bất thường trong thời gian gần đây. Có nghi vấn về việc sử dụng chất cấm trong trường.</p><p>"Chúng tôi lo ngại về sự an toàn của học sinh," hiệu trưởng nói. "Một số em có biểu hiện thay đổi đáng kể - khi thì hưng phấn quá mức, khi thì mệt mỏi, học lực giảm sút. Làm ơn giúp chúng tôi tìm ra nguyên nhân."</p><p>Bạn quyết định bắt đầu điều tra từ đâu?</p>',
                        location_id: 'drug-school-1-location-1',
                        is_starting_step: true,
                        isStartingStep: true,
                        next_step_id: null,
                        nextStepId: null,
                        actions: [
                            {
                                action_type: 'examine-location',
                                target_id: 'drug-school-1-location-2',
                                label: 'Khảo sát sân trường',
                                icon: 'fa-search',
                                type: 'examine-location',
                                targetId: 'drug-school-1-location-2'
                            }
                        ]
                    }
                ],
                locations: [
                    {
                        id: 'drug-school-1-location-1',
                        case_id: 'drug-school-1',
                        name: 'Phòng Hiệu Trưởng',
                        description: 'Nơi bạn nhận nhiệm vụ điều tra từ hiệu trưởng về tình trạng bất thường của học sinh.',
                        image: 'https://t4.ftcdn.net/jpg/00/28/46/75/360_F_28467576_wuPsMwtN7hDd90XEmApk0yXuE76wLkI8.jpg',
                        first_location: true,
                        locked: false
                    },
                    {
                        id: 'drug-school-1-location-2',
                        case_id: 'drug-school-1',
                        name: 'Sân trường',
                        description: 'Nơi học sinh tụ tập trong giờ ra chơi. Bạn nhận thấy một nhóm học sinh có hành vi khả nghi ở góc xa của sân.',
                        image: 'https://media.istockphoto.com/id/186859567/vi/anh/s%C3%A2n-tr%C6%B0%E1%BB%9Dng-chicago.jpg?s=612x612&w=0&k=20&c=NZ9HpwzcGiaDp5OKikl1tEI2L6_dQR7cqPaoWV-U5Rg=',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'talk-to-character',
                                target_id: 'drug-school-1-character-1',
                                label: 'Nói chuyện với học sinh',
                                icon: 'fa-comment',
                                type: 'talk-to-character',
                                targetId: 'drug-school-1-character-1'
                            },
                            {
                                action_type: 'examine-location',
                                target_id: 'drug-school-1-location-3',
                                label: 'Kiểm tra nhà vệ sinh',
                                icon: 'fa-search',
                                type: 'examine-location',
                                targetId: 'drug-school-1-location-3'
                            }
                        ]
                    },
                    {
                        id: 'drug-school-1-location-3',
                        case_id: 'drug-school-1',
                        name: 'Nhà vệ sinh học sinh',
                        description: 'Bạn nghe nói có hoạt động đáng ngờ diễn ra trong đây. Khi kiểm tra, bạn thấy vài viên nén lạ rơi trong góc.',
                        image: 'https://media.istockphoto.com/id/2030767476/photo/public-restroom.jpg?s=612x612&w=0&k=20&c=YQv-lLwVLUOAa6341V192b0ddJ1FQHMcUyiZ7GKeKLw=',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'collect-evidence',
                                target_id: 'drug-school-1-evidence-1',
                                label: 'Thu thập viên nén lạ',
                                icon: 'fa-hand-paper',
                                type: 'collect-evidence',
                                targetId: 'drug-school-1-evidence-1'
                            },
                            {
                                action_type: 'collect-evidence',
                                target_id: 'drug-school-1-evidence-4',
                                label: 'Kiểm tra thùng rác',
                                icon: 'fa-trash',
                                type: 'collect-evidence',
                                targetId: 'drug-school-1-evidence-4'
                            },
                            {
                                action_type: 'examine-location',
                                target_id: 'drug-school-1-location-4',
                                label: 'Kiểm tra phòng tủ đồ',
                                icon: 'fa-search',
                                type: 'examine-location',
                                targetId: 'drug-school-1-location-4'
                            }
                        ]
                    },
                    {
                        id: 'drug-school-1-location-4',
                        case_id: 'drug-school-1',
                        name: 'Phòng tủ đồ',
                        description: 'Phòng tủ đồ của học sinh. Có vài tủ bị khóa bất thường và có dấu hiệu bị động chạm gần đây.',
                        image: 'https://lockernlock.vn/wp-content/uploads/2022/08/Hinh-san-pham-school-locker-12.jpg',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'talk-to-character',
                                target_id: 'drug-school-1-character-2',
                                label: 'Nói chuyện với giám thị',
                                icon: 'fa-comment',
                                type: 'talk-to-character',
                                targetId: 'drug-school-1-character-2'
                            },
                            {
                                action_type: 'collect-evidence',
                                target_id: 'drug-school-1-evidence-3',
                                label: 'Kiểm tra danh sách học sinh',
                                icon: 'fa-file-alt',
                                type: 'collect-evidence',
                                targetId: 'drug-school-1-evidence-3'
                            }
                        ]
                    }
                ],
                characters: [
                    {
                        id: 'drug-school-1-character-1',
                        case_id: 'drug-school-1',
                        name: 'Học sinh Minh',
                        role: 'Học sinh lớp 11A',
                        image: 'https://stockdep.net/files/images/15335274.jpg',
                        initial_dialog: 'Em không biết gì đâu... Những đứa khác đang dùng thứ gì đó trong nhà vệ sinh, nhưng em không tham gia. Có vẻ như chúng đang ngày càng phổ biến trong trường.',
                        initialDialog: 'Em không biết gì đâu... Những đứa khác đang dùng thứ gì đó trong nhà vệ sinh, nhưng em không tham gia. Có vẻ như chúng đang ngày càng phổ biến trong trường.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'drug-school-1-dialog-1-1',
                                character_id: 'drug-school-1-character-1',
                                text: 'Thầy/cô không buộc tội em. Thầy/cô chỉ cần thông tin để giúp các bạn.',
                                correct: true,
                                points: 10,
                                response: 'Em... em có thấy Tuấn hay nhận tin nhắn lạ. Cậu ấy cũng hay nói về "hàng mới". Em nghĩ điện thoại cậu ấy có thể có manh mối. Thầy/cô nên kiểm tra nhà vệ sinh, em thấy có gì đó đáng ngờ ở đó.',
                                unlocks: [
                                    { 
                                        unlock_type: 'location', 
                                        unlocked_id: 'drug-school-1-location-3' 
                                    }
                                ]
                            },
                            {
                                id: 'drug-school-1-dialog-1-2',
                                character_id: 'drug-school-1-character-1',
                                text: 'Nói dối sẽ khiến em gặp rắc rối đấy. Tốt nhất em nên nói ra những gì em biết.',
                                correct: false,
                                points: 0,
                                response: 'Em thực sự không biết gì nhiều... Thầy/cô nên tìm Tuấn ấy. Cậu ấy có thể biết nhiều hơn. Nhưng em không muốn dính líu...'
                            }
                        ]
                    },
                    {
                        id: 'drug-school-1-character-2',
                        case_id: 'drug-school-1',
                        name: 'Giám thị Hùng',
                        role: 'Giám thị trường',
                        image: 'https://media.istockphoto.com/id/1484852942/vi/anh/nh%C3%A0-kho-th%C3%B4ng-minh-kh%C3%A1i-ni%E1%BB%87m-h%E1%BB%87-th%E1%BB%91ng-qu%E1%BA%A3n-l%C3%BD-h%C3%A0ng-t%E1%BB%93n-kho.jpg?s=612x612&w=0&k=20&c=Ncq9tQbs2XSawE2AXICyfDUNIWnlKJWYWYr0NIhecDc=',
                        initial_dialog: 'Tôi làm việc ở đây 5 năm rồi và chưa bao giờ thấy tình trạng này. Gần đây một số học sinh có biểu hiện rất lạ - hưng phấn quá mức rồi đột ngột mệt mỏi, thờ ơ.',
                        initialDialog: 'Tôi làm việc ở đây 5 năm rồi và chưa bao giờ thấy tình trạng này. Gần đây một số học sinh có biểu hiện rất lạ - hưng phấn quá mức rồi đột ngột mệt mỏi, thờ ơ.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'drug-school-1-dialog-2-1',
                                character_id: 'drug-school-1-character-2',
                                text: 'Ông có thể cho tôi xem danh sách các học sinh có biểu hiện bất thường không?',
                                correct: true,
                                points: 10,
                                response: 'Được chứ. Tôi đã đánh dấu những em có biểu hiện lạ trong vài tuần qua. Có thể giúp ích cho cuộc điều tra của bạn. Tôi cũng đã báo cáo với y tá trường, cô ấy có thể có thêm thông tin.',
                                unlocks: [
                                    { 
                                        unlock_type: 'evidence', 
                                        unlocked_id: 'drug-school-1-evidence-3' 
                                    },
                                    { 
                                        unlock_type: 'location', 
                                        unlocked_id: 'drug-school-1-location-5' 
                                    }
                                ]
                            },
                            {
                                id: 'drug-school-1-dialog-2-2',
                                character_id: 'drug-school-1-character-2',
                                text: 'Ông có phát hiện ra ai mang những thứ lạ vào trường không?',
                                correct: false,
                                points: 5,
                                response: 'Tôi không để ý nhiều... Nhưng tôi có thấy một vài học sinh hay tụ tập ở góc sân trường, khuất tầm nhìn của camera giám sát. Điều đáng ngờ là chúng thường nhận tin nhắn và sau đó ra gặp ai đó ở cổng trường.'
                            }
                        ]
                    }
                ],
                evidence: [
                    {
                        id: 'drug-school-1-evidence-1',
                        case_id: 'drug-school-1',
                        name: 'Viên nén lạ',
                        description: 'Một viên nén màu hồng với logo hình trái tim, tìm thấy trong nhà vệ sinh.',
                        image: 'https://ovaq1.vn/wp-content/uploads/2023/07/thuoc-khang-viem-mau-hong-hinh-trai-tim-2-min.jpg',
                        analysis: 'Đây là loại ma túy tổng hợp ecstasy, thường được sử dụng tại các buổi tiệc và gây ảo giác, tăng cảm xúc.',
                        points: 10,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'drug-school-1-evidence-3',
                        case_id: 'drug-school-1',
                        name: 'Danh sách học sinh',
                        description: 'Danh sách học sinh với một số tên được đánh dấu bằng ký hiệu đặc biệt.',
                        image: 'https://topteacher.com.au/wp-content/uploads/2023/07/Class-checklist-LB-top-teacher-scaled-1-600x600.jpeg',
                        analysis: 'Đây có thể là danh sách khách hàng hoặc người phân phối trong mạng lưới.',
                        points: 10,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'drug-school-1-evidence-4',
                        case_id: 'drug-school-1',
                        name: 'Túi nilon nhỏ',
                        description: 'Nhiều túi nilon nhỏ trong thùng rác, thường được dùng để đựng ma túy.',
                        image: 'https://img.lovepik.com/photo/60169/4226.jpg_wh860.jpg',
                        analysis: 'Dụng cụ đóng gói chất cấm điển hình, cho thấy có hoạt động phân phối tại trường.',
                        points: 5,
                        collected_by_default: false,
                        collectedByDefault: false
                    }
                ],
                finalSteps: [{
                    id: 'drug-school-1-final',
                    case_id: 'drug-school-1',
                    require_character_id: 'drug-school-1-character-2',
                    narrative: '<h3>Giải Quyết Vụ Án</h3><p>Sau khi thu thập đủ bằng chứng từ trường học, bạn đã xác định được người phân phối chất cấm trong trường.</p><p>Giờ đây bạn cần quyết định cách xử lý tình huống này.</p>',
                    required_evidence: ['drug-school-1-evidence-1', 'drug-school-1-evidence-3'],
                    requireEvidence: ['drug-school-1-evidence-1', 'drug-school-1-evidence-3'],
                    choices: [
                        {
                            id: 'drug-school-1-choice-1',
                            final_step_id: 'drug-school-1-final',
                            text: 'Phối hợp với cảnh sát để bắt giữ người cung cấp và điều tra mạng lưới phân phối ma túy rộng lớn hơn',
                            correct: true,
                            finalSolution: true,
                            points: 30,
                            outcome: 'Cảnh sát đã bắt giữ được kẻ cung cấp ma túy và từ thông tin của hắn, triệt phá được một đường dây cung cấp ma túy cho học sinh nhiều trường trong khu vực. Các học sinh liên quan được giáo dục và tư vấn tâm lý.',
                            next_case_id: 'alcohol-family-1',
                            nextCase: 'alcohol-family-1'
                        },
                        {
                            id: 'drug-school-1-choice-2',
                            final_step_id: 'drug-school-1-final',
                            text: 'Xử lý nội bộ trong trường, kỷ luật các học sinh liên quan và cảnh cáo người cung cấp',
                            correct: false,
                            finalSolution: false,
                            points: 10,
                            outcome: 'Việc xử lý nội bộ không đủ mạnh để ngăn chặn vấn đề. Người cung cấp vẫn tiếp tục hoạt động ở các trường khác, và một số học sinh vẫn bí mật sử dụng chất cấm.',
                            next_case_id: null,
                            nextCase: null
                        }
                    ]
                }],
                finalStep: {
                    id: 'drug-school-1-final',
                    case_id: 'drug-school-1',
                    require_character_id: 'drug-school-1-character-2',
                    narrative: '<h3>Giải Quyết Vụ Án</h3><p>Sau khi thu thập đủ bằng chứng từ trường học, bạn đã xác định được người phân phối chất cấm trong trường.</p><p>Giờ đây bạn cần quyết định cách xử lý tình huống này.</p>',
                    required_evidence: ['drug-school-1-evidence-1', 'drug-school-1-evidence-3'],
                    requireEvidence: ['drug-school-1-evidence-1', 'drug-school-1-evidence-3'],
                    choices: [
                        {
                            id: 'drug-school-1-choice-1',
                            final_step_id: 'drug-school-1-final',
                            text: 'Phối hợp với cảnh sát để bắt giữ người cung cấp và điều tra mạng lưới phân phối ma túy rộng lớn hơn',
                            correct: true,
                            finalSolution: true,
                            points: 30,
                            outcome: 'Cảnh sát đã bắt giữ được kẻ cung cấp ma túy và từ thông tin của hắn, triệt phá được một đường dây cung cấp ma túy cho học sinh nhiều trường trong khu vực. Các học sinh liên quan được giáo dục và tư vấn tâm lý.',
                            next_case_id: 'alcohol-family-1',
                            nextCase: 'alcohol-family-1'
                        },
                        {
                            id: 'drug-school-1-choice-2',
                            final_step_id: 'drug-school-1-final',
                            text: 'Xử lý nội bộ trong trường, kỷ luật các học sinh liên quan và cảnh cáo người cung cấp',
                            correct: false,
                            finalSolution: false,
                            points: 10,
                            outcome: 'Việc xử lý nội bộ không đủ mạnh để ngăn chặn vấn đề. Người cung cấp vẫn tiếp tục hoạt động ở các trường khác, và một số học sinh vẫn bí mật sử dụng chất cấm.',
                            next_case_id: null,
                            nextCase: null
                        }
                    ]
                },
                successContent: '<p>Chúc mừng! Bạn đã giải quyết thành công vụ án. Với thông tin từ Tuấn và bằng chứng thu thập được, cảnh sát đã bắt giữ được người cung cấp ma túy và ngăn chặn nguồn cung cấp chất cấm vào trường học.</p><p>Nhà trường đã tổ chức các buổi tuyên truyền về tác hại của ma túy và các chất gây nghiện. Các học sinh liên quan được tư vấn tâm lý và hỗ trợ cai nghiện.</p><p>Nhờ sự điều tra kịp thời của bạn, môi trường học đường đã trở nên an toàn hơn, và các trường học khác trong khu vực cũng được cảnh báo về phương thức hoạt động của bọn buôn bán ma túy.</p>',
                failureContent: '<p>Rất tiếc, bạn chưa giải quyết triệt để vấn đề. Người cung cấp chất cấm vẫn tiếp tục hoạt động, và tình trạng sử dụng chất gây nghiện trong trường vẫn diễn ra.</p><p>Điều này cho thấy tầm quan trọng của việc xử lý các vụ việc liên quan đến ma túy một cách chuyên nghiệp và phối hợp với các cơ quan chức năng, đặc biệt khi nó liên quan đến môi trường học đường.</p>',
                educationalTips: [
                    'Ma túy tổng hợp như ecstasy có thể gây ra những tác hại nghiêm trọng đến sức khỏe thể chất và tinh thần, đặc biệt ở người trẻ tuổi.',
                    'Dấu hiệu nhận biết người sử dụng chất kích thích: thay đổi tâm trạng đột ngột, mắt đỏ, đồng tử giãn, mất ngủ, ăn ít, sút cân không rõ nguyên nhân.',
                    'Khi phát hiện người thân có dấu hiệu sử dụng chất cấm, hãy bình tĩnh tiếp cận và tìm sự hỗ trợ từ chuyên gia tâm lý, y tế.',
                    'Phòng ngừa sử dụng ma túy học đường cần kết hợp giáo dục, truyền thông và sự phối hợp giữa nhà trường, gia đình và cộng đồng.'
                ]
            };
            
            // Lưu vào cache
            this.caseDetails[id] = caseDetail;
            return caseDetail;
        }
        
        // Dữ liệu chi tiết của vụ án khác (Bí Mật Gia Đình)
        if (id === 'alcohol-family-1') {
            // Tạo dữ liệu mẫu cho vụ án thứ hai
            const caseDetail = {
                id: 'alcohol-family-1',
                title: 'Bí Mật Gia Đình',
                description: 'Điều tra một vụ tai nạn giao thông và khám phá bí mật về vấn đề nghiện rượu giấu kín trong một gia đình tưởng chừng hạnh phúc.',
                type: 'Rượu bia',
                difficulty: 2,
                mode: 'story',
                is_locked: true,
                isLocked: true,
                image: 'https://i.pinimg.com/736x/51/00/b8/5100b8bcfaec556bfc896eb7715f4d6d.jpg',
                timed: false,
                time_limit: 0,
                timeLimit: 0,
                requiredCases: ['drug-school-1'],
                steps: [
                    {
                        id: 'alcohol-family-1-step-1',
                        case_id: 'alcohol-family-1',
                        narrative: '<h3>Hiện Trường Tai Nạn</h3><p>Bạn được gọi đến hiện trường một vụ tai nạn giao thông nghiêm trọng. Một chiếc xe đã đâm vào cột đèn đường vào đêm khuya.</p><p>"Tài xế có dấu hiệu say rượu," cảnh sát giao thông nói. "Nhưng có nhiều điểm đáng ngờ trong vụ này. Gia đình nạn nhân rất có tiếng trong cộng đồng và họ muốn giữ kín mọi thông tin."</p><p>Bạn bắt đầu điều tra hiện trường để tìm hiểu thêm.</p><p><span style="color: #3498db; font-style: italic;">Hướng dẫn: Thu thập đủ bằng chứng và nói chuyện với các nhân vật (đặc biệt là bà Trần Thanh Mai) để hiểu rõ vấn đề.</span></p>',
                        location_id: 'alcohol-family-1-location-1',
                        is_starting_step: true,
                        isStartingStep: true,
                        next_step_id: null,
                        actions: [
                            {
                                action_type: 'examine-location',
                                target_id: 'alcohol-family-1-location-2',
                                label: 'Khám xét hiện trường',
                                icon: 'fa-search',
                                type: 'examine-location',
                                targetId: 'alcohol-family-1-location-2'
                            }
                        ]
                    }
                ],
                locations: [
                    {
                        id: 'alcohol-family-1-location-1',
                        case_id: 'alcohol-family-1',
                        name: 'Hiện trường tai nạn',
                        description: 'Một chiếc xe sang đã đâm vào cột đèn đường. Hiện trường vẫn còn vệt phanh dài và mảnh vỡ kính xe.',
                        image: 'https://thumbs.dreamstime.com/b/man-crying-accident-scene-elegant-vertical-44179380.jpg',
                        first_location: true,
                        locked: false
                    },
                    {
                        id: 'alcohol-family-1-location-2',
                        case_id: 'alcohol-family-1',
                        name: 'Bên trong xe',
                        description: 'Nội thất xe bị hư hại nặng. Có mùi rượu rõ rệt và nhiều chai rượu rỗng dưới ghế phụ.',
                        image: 'https://t4.ftcdn.net/jpg/07/14/71/91/360_F_714719169_bLDdJBVCkabUDP7Y2WGwbm7CxkFJIGPl.jpg',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'collect-evidence',
                                target_id: 'alcohol-family-1-evidence-1',
                                label: 'Thu thập chai rượu',
                                icon: 'fa-wine-bottle',
                                type: 'collect-evidence',
                                targetId: 'alcohol-family-1-evidence-1'
                            },
                            {
                                action_type: 'collect-evidence',
                                target_id: 'alcohol-family-1-evidence-2',
                                label: 'Kiểm tra điện thoại',
                                icon: 'fa-mobile-alt',
                                type: 'collect-evidence',
                                targetId: 'alcohol-family-1-evidence-2'
                            },
                            {
                                action_type: 'examine-location',
                                target_id: 'alcohol-family-1-location-3',
                                label: 'Đến bệnh viện',
                                icon: 'fa-hospital',
                                type: 'examine-location',
                                targetId: 'alcohol-family-1-location-3'
                            }
                        ]
                    },
                    {
                        id: 'alcohol-family-1-location-3',
                        case_id: 'alcohol-family-1',
                        name: 'Bệnh viện',
                        description: 'Bệnh viện nơi nạn nhân đang được điều trị. Các bác sĩ cho biết tình trạng của ông ta đã ổn định.',
                        image: 'https://www.fvhospital.com/wp-content/uploads/2024/02/fv-hospital-view-5.jpg',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'talk-to-character',
                                target_id: 'alcohol-family-1-character-1',
                                label: 'Nói chuyện với bác sĩ',
                                icon: 'fa-user-md',
                                type: 'talk-to-character',
                                targetId: 'alcohol-family-1-character-1'
                            },
                            {
                                action_type: 'talk-to-character',
                                target_id: 'alcohol-family-1-character-2',
                                label: 'Nói chuyện với nạn nhân',
                                icon: 'fa-comment',
                                type: 'talk-to-character',
                                targetId: 'alcohol-family-1-character-2'
                            },
                            {
                                action_type: 'examine-location',
                                target_id: 'alcohol-family-1-location-4',
                                label: 'Đến nhà nạn nhân',
                                icon: 'fa-home',
                                type: 'examine-location',
                                targetId: 'alcohol-family-1-location-4'
                            }
                        ]
                    },
                    {
                        id: 'alcohol-family-1-location-4',
                        case_id: 'alcohol-family-1',
                        name: 'Nhà gia đình Trần',
                        description: 'Một căn biệt thự sang trọng trong khu dân cư cao cấp. Bề ngoài hoàn hảo nhưng dường như ẩn chứa nhiều bí mật.',
                        image: 'https://i.pinimg.com/originals/95/29/91/952991594aa478fa2232553e4eb8757d.jpg',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'talk-to-character',
                                target_id: 'alcohol-family-1-character-3',
                                label: 'Nói chuyện với vợ nạn nhân',
                                icon: 'fa-comment',
                                type: 'talk-to-character',
                                targetId: 'alcohol-family-1-character-3'
                            },
                            {
                                action_type: 'talk-to-character',
                                target_id: 'alcohol-family-1-character-4',
                                label: 'Nói chuyện với con trai',
                                icon: 'fa-comment',
                                type: 'talk-to-character',
                                targetId: 'alcohol-family-1-character-4'
                            },
                            {
                                action_type: 'examine-location',
                                target_id: 'alcohol-family-1-location-5',
                                label: 'Khám xét phòng làm việc',
                                icon: 'fa-search',
                                type: 'examine-location',
                                targetId: 'alcohol-family-1-location-5'
                            }
                        ]
                    },
                    {
                        id: 'alcohol-family-1-location-5',
                        case_id: 'alcohol-family-1',
                        name: 'Phòng làm việc',
                        description: 'Phòng làm việc riêng của ông Trần. Nhiều tài liệu công việc và một két rượu được giấu sau giá sách.',
                        image: 'https://thehallmark.vn/wp-content/uploads/2023/10/1-home-office-la-mot-trong-nhung-hinh-thuc-lam-viec-pho-bien.jpg',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'collect-evidence',
                                target_id: 'alcohol-family-1-evidence-3',
                                label: 'Kiểm tra két rượu',
                                icon: 'fa-wine-glass',
                                type: 'collect-evidence',
                                targetId: 'alcohol-family-1-evidence-3'
                            },
                            {
                                action_type: 'collect-evidence',
                                target_id: 'alcohol-family-1-evidence-4',
                                label: 'Xem hóa đơn',
                                icon: 'fa-receipt',
                                type: 'collect-evidence',
                                targetId: 'alcohol-family-1-evidence-4'
                            },
                            {
                                action_type: 'collect-evidence',
                                target_id: 'alcohol-family-1-evidence-5',
                                label: 'Kiểm tra máy tính',
                                icon: 'fa-laptop',
                                type: 'collect-evidence',
                                targetId: 'alcohol-family-1-evidence-5'
                            }
                        ]
                    }
                ],
                characters: [
                    {
                        id: 'alcohol-family-1-character-1',
                        case_id: 'alcohol-family-1',
                        name: 'Bác sĩ Hương',
                        role: 'Bác sĩ điều trị',
                        image: 'https://img.lovepik.com/free-png/20211118/lovepik-professional-doctor-image-png-image_400996875_wh1200.png',
                        initial_dialog: 'Ông Trần đã ổn định, nhưng đây không phải lần đầu ông ấy vào viện vì các vấn đề liên quan đến rượu. Chúng tôi đã điều trị cho ông ấy nhiều lần, nhưng gia đình luôn giữ kín thông tin.',
                        initialDialog: 'Ông Trần đã ổn định, nhưng đây không phải lần đầu ông ấy vào viện vì các vấn đề liên quan đến rượu. Chúng tôi đã điều trị cho ông ấy nhiều lần, nhưng gia đình luôn giữ kín thông tin.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'alcohol-family-1-dialog-1-1',
                                character_id: 'alcohol-family-1-character-1',
                                text: 'Bác sĩ có thể cho tôi biết chi tiết về tình trạng sức khỏe của ông Trần không?',
                                correct: true,
                                points: 10,
                                response: 'Ông ấy bị tổn thương gan nghiêm trọng do uống rượu lâu dài. Lần này, nồng độ cồn trong máu của ông ấy rất cao, gần như gấp 3 lần mức cho phép khi lái xe. Tôi đã khuyên ông ấy tham gia chương trình cai nghiện nhiều lần, nhưng ông ấy luôn từ chối.'
                            },
                            {
                                id: 'alcohol-family-1-dialog-1-2',
                                character_id: 'alcohol-family-1-character-1',
                                text: 'Gia đình ông Trần có biết về vấn đề này không?',
                                correct: false,
                                points: 5,
                                response: 'Tôi đã nói chuyện với vợ ông ấy nhiều lần, nhưng bà ấy dường như muốn che giấu vấn đề này. Họ là gia đình có tiếng trong giới kinh doanh và chính trị, nên việc giữ thể diện rất quan trọng với họ.'
                            }
                        ]
                    },
                    {
                        id: 'alcohol-family-1-character-2',
                        case_id: 'alcohol-family-1',
                        name: 'Ông Trần Hùng',
                        role: 'Nạn nhân - Doanh nhân thành đạt',
                        image: 'https://thumb.photo-ac.com/f2/f2830cfb216eaf3ca40bbd5979dfbfea_t.jpeg',
                        initial_dialog: 'Tôi không nhớ rõ chuyện gì đã xảy ra. Chỉ nhớ rằng tôi đang lái xe về nhà sau buổi gặp đối tác. Tôi chỉ uống vài ly nhỏ thôi, không đủ để gây tai nạn.',
                        initialDialog: 'Tôi không nhớ rõ chuyện gì đã xảy ra. Chỉ nhớ rằng tôi đang lái xe về nhà sau buổi gặp đối tác. Tôi chỉ uống vài ly nhỏ thôi, không đủ để gây tai nạn.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'alcohol-family-1-dialog-2-1',
                                character_id: 'alcohol-family-1-character-2',
                                text: 'Ông có thường xuyên uống rượu không?',
                                correct: true,
                                points: 15,
                                response: 'Tôi chỉ uống trong các cuộc gặp công việc thôi... Được rồi, có lẽ tôi uống nhiều hơn bình thường một chút. Công việc căng thẳng, và đôi khi tôi cần thứ gì đó để thư giãn. Nhưng tôi kiểm soát được mà, không có vấn đề gì.'
                            },
                            {
                                id: 'alcohol-family-1-dialog-2-2',
                                character_id: 'alcohol-family-1-character-2',
                                text: 'Bác sĩ nói ông đã từng vào viện vì rượu nhiều lần trước đây.',
                                correct: false,
                                points: 5,
                                response: 'Bác sĩ không có quyền tiết lộ thông tin y tế của tôi! Đó chỉ là những lần kiểm tra sức khỏe thông thường. Mọi người đều thích phóng đại mọi thứ. Tôi là người trưởng thành, tôi biết giới hạn của mình.'
                            }
                        ]
                    },
                    {
                        id: 'alcohol-family-1-character-3',
                        case_id: 'alcohol-family-1',
                        name: 'Bà Trần Thanh Mai',
                        role: 'Vợ nạn nhân',
                        image: 'https://media.vov.vn/sites/default/files/styles/large/public/2023-05/cang-thang-lo-lang-den-_371658660765.jpg',
                        initial_dialog: 'Chồng tôi chỉ là tai nạn nhỏ thôi. Anh ấy làm việc quá sức và mệt mỏi. Không có vấn đề gì về rượu cả. Chúng tôi là gia đình hạnh phúc, hoàn hảo.',
                        initialDialog: 'Chồng tôi chỉ là tai nạn nhỏ thôi. Anh ấy làm việc quá sức và mệt mỏi. Không có vấn đề gì về rượu cả. Chúng tôi là gia đình hạnh phúc, hoàn hảo.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'alcohol-family-1-dialog-3-1',
                                character_id: 'alcohol-family-1-character-3',
                                text: 'Tôi hiểu bà muốn bảo vệ gia đình, nhưng giấu giếm vấn đề sẽ không giúp ích được gì.',
                                correct: true,
                                points: 20,
                                response: '[Bà Mai bắt đầu khóc] Tôi đã cố gắng rất nhiều... Đã nhiều năm nay anh ấy uống rượu ngày càng nhiều. Ban đầu chỉ là những bữa tiệc, sau đó là mỗi tối, và giờ đây anh ấy giấu rượu khắp nơi trong nhà. Tôi sợ các con biết điều này, sợ ảnh hưởng đến danh tiếng gia đình...'
                            },
                            {
                                id: 'alcohol-family-1-dialog-3-2',
                                character_id: 'alcohol-family-1-character-3',
                                text: 'Bà đang nói dối. Chúng tôi có bằng chứng về vấn đề nghiện rượu của chồng bà.',
                                correct: false,
                                points: 0,
                                response: 'Làm sao ông dám! Chúng tôi là gia đình đáng kính. Tôi sẽ gọi luật sư của chúng tôi ngay lập tức. Cuộc nói chuyện này kết thúc ở đây.'
                            }
                        ]
                    },
                    {
                        id: 'alcohol-family-1-character-4',
                        case_id: 'alcohol-family-1',
                        name: 'Trần Minh',
                        role: 'Con trai - Sinh viên đại học',
                        image: 'https://danviet.ex-cdn.com/files/f1/296231569849192448/2022/3/11/long-8-4366-1646955800367-16469558020141690767992.jpg',
                        initial_dialog: 'Bố tôi không sao cả. Ông ấy chỉ mệt vì làm việc quá sức thôi. Mọi người đều nói xấu gia đình chúng tôi vì họ ghen tị.',
                        initialDialog: 'Bố tôi không sao cả. Ông ấy chỉ mệt vì làm việc quá sức thôi. Mọi người đều nói xấu gia đình chúng tôi vì họ ghen tị.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'alcohol-family-1-dialog-4-1',
                                character_id: 'alcohol-family-1-character-4',
                                text: 'Cậu có thể giúp bố cậu bằng cách nói ra sự thật.',
                                correct: true,
                                points: 20,
                                response: '[Trầm ngâm một lúc] Bố tôi thay đổi rất nhiều trong vài năm qua. Ông ấy thường xuyên say, dễ nổi giận và đôi khi... bạo lực. Mẹ tôi cố gắng che giấu, nhưng tất cả chúng tôi đều biết. Em gái tôi thậm chí còn sợ ở nhà một mình với bố. Tôi đã tìm hiểu về nghiện rượu, đây là căn bệnh cần được điều trị...'
                            },
                            {
                                id: 'alcohol-family-1-dialog-4-2',
                                character_id: 'alcohol-family-1-character-4',
                                text: 'Cậu có thường xuyên thấy bố cậu uống rượu không?',
                                correct: false,
                                points: 5,
                                response: 'Đôi khi ông ấy uống một chút sau giờ làm. Có gì sai đâu? Mọi người đều làm vậy mà. Tại sao mọi người cứ tìm cách phá hỏng gia đình tôi?'
                            }
                        ]
                    }
                ],
                evidence: [
                    {
                        id: 'alcohol-family-1-evidence-1',
                        case_id: 'alcohol-family-1',
                        name: 'Chai rượu',
                        description: 'Nhiều chai rượu mạnh rỗng được tìm thấy trong xe, một số được giấu dưới ghế.',
                        image: 'https://i.pinimg.com/564x/a8/ab/43/a8ab43975eef2427f80ab890da7bbfb0.jpg',
                        analysis: 'Số lượng chai cho thấy mức tiêu thụ vượt xa "vài ly nhỏ" như lời ông Trần nói. Đây là bằng chứng quan trọng về vấn đề nghiện rượu.',
                        points: 10,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'alcohol-family-1-evidence-2',
                        case_id: 'alcohol-family-1',
                        name: 'Tin nhắn điện thoại',
                        description: 'Tin nhắn từ vợ: "Anh đã hứa sẽ không uống nữa. Các con đang đợi. Làm ơn về nhà an toàn."',
                        image: 'https://images2.thanhnien.vn/zoom/686_429/528068263637045248/2023/5/20/messages-16845536942401612600439-0-0-625-1000-crop-16845537050331236109805.jpg',
                        analysis: 'Tin nhắn cho thấy đây là vấn đề thường xuyên và gia đình đã biết.',
                        points: 15,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'alcohol-family-1-evidence-3',
                        case_id: 'alcohol-family-1',
                        name: 'Két rượu bí mật',
                        description: 'Một két rượu được giấu sau giá sách, chứa nhiều loại rượu mạnh đắt tiền.',
                        image: 'https://www.dcapsule.co/cdn/shop/products/fb216ad4b78f0952f2ce434ebd0ccbb0.jpg?v=1612687045',
                        analysis: 'Vị trí giấu kín cho thấy ý định che giấu thói quen uống rượu. Đây là bằng chứng quan trọng về việc cố tình che giấu vấn đề.',
                        points: 15,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'alcohol-family-1-evidence-4',
                        case_id: 'alcohol-family-1',
                        name: 'Hóa đơn rượu',
                        description: 'Nhiều hóa đơn mua rượu trong vài tháng gần đây, tổng giá trị rất lớn.',
                        image: 'https://www.shutterstock.com/image-illustration/shopping-receipt-retail-store-purchase-260nw-1430553851.jpg',
                        analysis: 'Số lượng và tần suất mua rượu cho thấy dấu hiệu của nghiện rượu.',
                        points: 10,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'alcohol-family-1-evidence-5',
                        case_id: 'alcohol-family-1',
                        name: 'Tìm kiếm trên máy tính',
                        description: 'Lịch sử tìm kiếm: "cách giấu hơi rượu", "thuốc giảm cơn thèm rượu", "cai nghiện tại nhà"',
                        image: 'https://static1.makeuseofimages.com/wordpress/wp-content/uploads/2018/02/Chrome-History-View.jpg',
                        analysis: 'Ông Trần đã nhận thức được vấn đề và có ý định tìm cách khắc phục, nhưng chưa tìm kiếm sự giúp đỡ chuyên nghiệp. Đây là bằng chứng quan trọng cho thấy sự nhận thức của ông về vấn đề.',
                        points: 20,
                        collected_by_default: false,
                        collectedByDefault: false
                    }
                ],
                finalSteps: [{
                    id: 'alcohol-family-1-final',
                    case_id: 'alcohol-family-1',
                    require_character_id: ['alcohol-family-1-character-3', 'alcohol-family-1-character-4'],
                    require_characters: ['alcohol-family-1-character-3', 'alcohol-family-1-character-4'],
                    narrative: '<h3>Giải Quyết Vụ Án</h3><p>Sau khi thu thập đủ bằng chứng, bạn đã xác định rõ ông Trần có vấn đề nghiện rượu nghiêm trọng. Việc này không chỉ gây ra tai nạn mà còn ảnh hưởng tiêu cực đến gia đình ông.</p><p>Giờ đây bạn cần quyết định cách xử lý tình huống này.</p><p><span style="color: #e74c3c; font-weight: bold;">Đảm bảo bạn đã nói chuyện với gia đình nạn nhân (bà Trần Thanh Mai và con trai Trần Minh)</span></p>',
                    required_evidence: ['alcohol-family-1-evidence-1', 'alcohol-family-1-evidence-3', 'alcohol-family-1-evidence-5'],
                    requireEvidence: ['alcohol-family-1-evidence-1', 'alcohol-family-1-evidence-3', 'alcohol-family-1-evidence-5'],
                    choices: [
                        {
                            id: 'alcohol-family-1-choice-1',
                            final_step_id: 'alcohol-family-1-final',
                            text: 'Tổ chức buổi nói chuyện với toàn gia đình, giúp họ đối mặt với vấn đề và tìm kiếm sự hỗ trợ chuyên nghiệp',
                            correct: true,
                            finalSolution: true,
                            points: 30,
                            outcome: 'Gia đình ông Trần cuối cùng đã chấp nhận vấn đề và đồng ý tìm kiếm sự trợ giúp. Ông Trần tham gia chương trình cai nghiện, và cả gia đình tham gia liệu pháp tâm lý. Mặc dù đây là quá trình dài và khó khăn, nhưng họ đã bắt đầu hành trình hồi phục.',
                            next_case_id: 'drug-network-1',
                            nextCase: 'drug-network-1'
                        },
                        {
                            id: 'alcohol-family-1-choice-2',
                            final_step_id: 'alcohol-family-1-final',
                            text: 'Xử phạt hành chính và tước giấy phép lái xe của ông Trần do lái xe trong tình trạng say rượu',
                            correct: false,
                            finalSolution: false,
                            points: 10,
                            outcome: 'Ông Trần bị phạt và tước giấy phép lái xe, nhưng vấn đề cốt lõi không được giải quyết. Gia đình tiếp tục che giấu vấn đề, và ông Trần quay lại thói quen uống rượu ngay sau khi ra viện. Tình trạng gia đình ngày càng xấu đi.',
                            next_case_id: null,
                            nextCase: null
                        }
                    ]
                }],
                finalStep: {
                    id: 'alcohol-family-1-final',
                    case_id: 'alcohol-family-1',
                    require_character_id: ['alcohol-family-1-character-3', 'alcohol-family-1-character-4'],
                    require_characters: ['alcohol-family-1-character-3', 'alcohol-family-1-character-4'],
                    narrative: '<h3>Giải Quyết Vụ Án</h3><p>Sau khi thu thập đủ bằng chứng, bạn đã xác định rõ ông Trần có vấn đề nghiện rượu nghiêm trọng. Việc này không chỉ gây ra tai nạn mà còn ảnh hưởng tiêu cực đến gia đình ông.</p><p>Giờ đây bạn cần quyết định cách xử lý tình huống này.</p><p><span style="color: #e74c3c; font-weight: bold;">Đảm bảo bạn đã nói chuyện với gia đình nạn nhân (bà Trần Thanh Mai và con trai Trần Minh)</span></p>',
                    required_evidence: ['alcohol-family-1-evidence-1', 'alcohol-family-1-evidence-3', 'alcohol-family-1-evidence-5'],
                    requireEvidence: ['alcohol-family-1-evidence-1', 'alcohol-family-1-evidence-3', 'alcohol-family-1-evidence-5'],
                    choices: [
                        {
                            id: 'alcohol-family-1-choice-1',
                            final_step_id: 'alcohol-family-1-final',
                            text: 'Tổ chức buổi nói chuyện với toàn gia đình, giúp họ đối mặt với vấn đề và tìm kiếm sự hỗ trợ chuyên nghiệp',
                            correct: true,
                            finalSolution: true,
                            points: 30,
                            outcome: 'Gia đình ông Trần cuối cùng đã chấp nhận vấn đề và đồng ý tìm kiếm sự trợ giúp. Ông Trần tham gia chương trình cai nghiện, và cả gia đình tham gia liệu pháp tâm lý. Mặc dù đây là quá trình dài và khó khăn, nhưng họ đã bắt đầu hành trình hồi phục.',
                            next_case_id: 'drug-network-1',
                            nextCase: 'drug-network-1'
                        },
                        {
                            id: 'alcohol-family-1-choice-2',
                            final_step_id: 'alcohol-family-1-final',
                            text: 'Xử phạt hành chính và tước giấy phép lái xe của ông Trần do lái xe trong tình trạng say rượu',
                            correct: false,
                            finalSolution: false,
                            points: 10,
                            outcome: 'Ông Trần bị phạt và tước giấy phép lái xe, nhưng vấn đề cốt lõi không được giải quyết. Gia đình tiếp tục che giấu vấn đề, và ông Trần quay lại thói quen uống rượu ngay sau khi ra viện. Tình trạng gia đình ngày càng xấu đi.',
                            next_case_id: null,
                            nextCase: null
                        }
                    ]
                },
                successContent: '<p>Chúc mừng! Bạn đã giải quyết thành công vụ án. Thay vì chỉ xử lý hậu quả, bạn đã giúp giải quyết vấn đề gốc rễ.</p><p>Đối mặt với vấn đề nghiện rượu là bước đầu tiên và khó khăn nhất. Bằng cách giúp gia đình ông Trần công nhận và đối mặt với vấn đề, bạn đã tạo cơ hội cho họ được hỗ trợ và chữa lành.</p><p>Sau 6 tháng, ông Trần đã hoàn thành chương trình cai nghiện và tiếp tục tham gia các nhóm hỗ trợ. Mối quan hệ gia đình đã được cải thiện đáng kể, và các con ông cũng học được bài học quý giá về tầm quan trọng của việc đối mặt với khó khăn thay vì chạy trốn.</p>',
                failureContent: '<p>Rất tiếc, bạn chưa giải quyết được vấn đề cốt lõi. Mặc dù ông Trần đã bị xử phạt vì hành vi lái xe sau khi uống rượu, nhưng vấn đề nghiện rượu vẫn tiếp diễn.</p><p>Chỉ vài tháng sau, ông Trần lại gặp tai nạn khác, lần này nghiêm trọng hơn. Tình trạng sức khỏe của ông ngày càng xấu đi, và mối quan hệ gia đình cũng bị ảnh hưởng nặng nề.</p><p>Đây là ví dụ điển hình cho thấy các biện pháp trừng phạt đơn thuần không hiệu quả trong việc giải quyết các vấn đề nghiện ngập. Cần có cách tiếp cận toàn diện, kết hợp y tế, tâm lý và sự hỗ trợ từ gia đình.</p>',
                educationalTips: [
                    'Nghiện rượu là một bệnh, không phải lựa chọn hay thiếu ý chí. Nó cần được điều trị chuyên nghiệp như các bệnh khác.',
                    'Gia đình thường có xu hướng che giấu vấn đề nghiện rượu vì xấu hổ, nhưng điều này chỉ làm tình trạng trở nên tồi tệ hơn.',
                    'Trẻ em trong gia đình có người nghiện rượu thường bị ảnh hưởng tâm lý nghiêm trọng và có nguy cơ phát triển vấn đề tương tự khi trưởng thành.',
                    'Lái xe sau khi uống rượu là một trong những nguyên nhân hàng đầu gây tai nạn giao thông nghiêm trọng.',
                    'Cai nghiện rượu đòi hỏi sự hỗ trợ y tế, không nên tự ý cai vì có thể gây ra các triệu chứng cai nghiện nguy hiểm đến tính mạng.'
                ]
            };
            
            // Lưu vào cache
            this.caseDetails[id] = caseDetail;
            return caseDetail;
        }
        
        // Dữ liệu chi tiết cho vụ án thứ ba (Đường Dây Ma Túy)
        if (id === 'drug-network-1') {
            // Tạo dữ liệu chi tiết cho vụ án thứ ba
            const caseDetail = {
                id: 'drug-network-1',
                title: 'Đường Dây Ma Túy',
                description: 'Điều tra và triệt phá một đường dây ma túy lớn đang nhắm vào học sinh nhiều trường trong khu vực.',
                type: 'Ma túy',
                difficulty: 3,
                mode: 'story',
                is_locked: true,
                isLocked: true,
                image: 'https://png.pngtree.com/background/20231016/original/pngtree-global-network-internet-worldmap-computer-photo-picture-image_5564261.jpg',
                timed: false,
                time_limit: 0,
                timeLimit: 0,
                requiredCases: ['alcohol-family-1'],
                steps: [
                    {
                        id: 'drug-network-1-step-1',
                        case_id: 'drug-network-1',
                        narrative: '<h3>Trụ sở cảnh sát</h3><p>Sau thành công trong việc triệt phá vụ ma túy ở trường học, bạn được giao nhiệm vụ lớn hơn - phối hợp với đội chống ma túy để điều tra một đường dây ma túy đang nhắm vào nhiều trường học trong thành phố.</p><p>"Chúng tôi tin rằng có một tổ chức quy mô đang cung cấp ma túy cho học sinh. Chúng hoạt động rất tinh vi và có người bảo kê," Trưởng phòng cảnh sát nói. "Cần phải tìm ra và triệt phá tận gốc."</p>',
                        location_id: 'drug-network-1-location-1',
                        is_starting_step: true,
                        isStartingStep: true,
                        next_step_id: null,
                        actions: [
                            {
                                action_type: 'talk-to-character',
                                target_id: 'drug-network-1-character-1',
                                label: 'Nói chuyện với Trưởng phòng',
                                icon: 'fa-comment',
                                type: 'talk-to-character',
                                targetId: 'drug-network-1-character-1'
                            },
                            {
                                action_type: 'examine-location',
                                target_id: 'drug-network-1-location-2',
                                label: 'Đến phòng chứng cứ',
                                icon: 'fa-search',
                                type: 'examine-location',
                                targetId: 'drug-network-1-location-2'
                            }
                        ]
                    }
                ],
                locations: [
                    {
                        id: 'drug-network-1-location-1',
                        case_id: 'drug-network-1',
                        name: 'Trụ sở cảnh sát',
                        description: 'Phòng làm việc của đội điều tra ma túy, nơi bạn nhận nhiệm vụ mới.',
                        image: 'https://thumb.photo-ac.com/b1/b1ea7ffd5803b7b2bfbcb06b7e30f64a_t.jpeg',
                        first_location: true,
                        locked: false
                    },
                    {
                        id: 'drug-network-1-location-2',
                        case_id: 'drug-network-1',
                        name: 'Phòng chứng cứ',
                        description: 'Nơi lưu trữ các chứng cứ thu được từ vụ án trước đó và các vụ án ma túy khác.',
                        image: 'https://c8.alamy.com/comp/2WRP4PP/interracial-police-partners-work-as-private-detectives-reviewing-evidence-in-archive-room-for-clues-to-a-crime-serious-caucasian-female-inspector-works-with-focused-male-investigator-on-case-files-2WRP4PP.jpg',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'collect-evidence',
                                target_id: 'drug-network-1-evidence-1',
                                label: 'Xem báo cáo vụ án trước',
                                icon: 'fa-file-alt',
                                type: 'collect-evidence',
                                targetId: 'drug-network-1-evidence-1'
                            },
                            {
                                action_type: 'collect-evidence',
                                target_id: 'drug-network-1-evidence-2',
                                label: 'Kiểm tra mẫu ma túy',
                                icon: 'fa-vial',
                                type: 'collect-evidence',
                                targetId: 'drug-network-1-evidence-2'
                            },
                            {
                                action_type: 'examine-location',
                                target_id: 'drug-network-1-location-3',
                                label: 'Đến trung tâm thông tin',
                                icon: 'fa-database',
                                type: 'examine-location',
                                targetId: 'drug-network-1-location-3'
                            }
                        ]
                    },
                    {
                        id: 'drug-network-1-location-3',
                        case_id: 'drug-network-1',
                        name: 'Trung tâm thông tin',
                        description: 'Nơi phân tích dữ liệu và theo dõi các hoạt động liên quan đến ma túy trong khu vực.',
                        image: 'https://bcp.cdnchinhphu.vn/334894974524682240/2022/12/16/31981755759521536181778868415327838899624536n-1671172158942918530234.jpg',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'collect-evidence',
                                target_id: 'drug-network-1-evidence-3',
                                label: 'Phân tích dữ liệu cuộc gọi',
                                icon: 'fa-phone',
                                type: 'collect-evidence',
                                targetId: 'drug-network-1-evidence-3'
                            },
                            {
                                action_type: 'talk-to-character',
                                target_id: 'drug-network-1-character-2',
                                label: 'Nói chuyện với chuyên gia IT',
                                icon: 'fa-laptop-code',
                                type: 'talk-to-character',
                                targetId: 'drug-network-1-character-2'
                            },
                            {
                                action_type: 'examine-location',
                                target_id: 'drug-network-1-location-4',
                                label: 'Đến điểm nghi vấn',
                                icon: 'fa-map-marker',
                                type: 'examine-location',
                                targetId: 'drug-network-1-location-4'
                            }
                        ]
                    },
                    {
                        id: 'drug-network-1-location-4',
                        case_id: 'drug-network-1',
                        name: 'Khu vực giải trí',
                        description: 'Một khu phức hợp giải trí với quán bar, câu lạc bộ đêm, nơi nghi ngờ là điểm phân phối ma túy.',
                        image: 'https://thietkethicong.org/images/Product/LIGHT-NIGHTCLUB-hinhanhbar-club-noitieng-5.jpg',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'talk-to-character',
                                target_id: 'drug-network-1-character-3',
                                label: 'Nói chuyện với nhân viên bảo vệ',
                                icon: 'fa-user-shield',
                                type: 'talk-to-character',
                                targetId: 'drug-network-1-character-3'
                            },
                            {
                                action_type: 'collect-evidence',
                                target_id: 'drug-network-1-evidence-4',
                                label: 'Kiểm tra camera an ninh',
                                icon: 'fa-video',
                                type: 'collect-evidence',
                                targetId: 'drug-network-1-evidence-4'
                            },
                            {
                                action_type: 'examine-location',
                                target_id: 'drug-network-1-location-5',
                                label: 'Điều tra phòng VIP',
                                icon: 'fa-star',
                                type: 'examine-location',
                                targetId: 'drug-network-1-location-5'
                            }
                        ]
                    },
                    {
                        id: 'drug-network-1-location-5',
                        case_id: 'drug-network-1',
                        name: 'Phòng VIP',
                        description: 'Khu vực dành riêng cho khách VIP trong câu lạc bộ đêm, nơi diễn ra các giao dịch bí mật.',
                        image: 'https://thumbs.dreamstime.com/b/vip-private-exclusive-room-night-club-elite-luxury-red-neon-theme-photo-310219062.jpg',
                        first_location: false,
                        locked: false,
                        actions: [
                            {
                                action_type: 'talk-to-character',
                                target_id: 'drug-network-1-character-4',
                                label: 'Đối mặt với quản lý',
                                icon: 'fa-user-tie',
                                type: 'talk-to-character',
                                targetId: 'drug-network-1-character-4'
                            },
                            {
                                action_type: 'collect-evidence',
                                target_id: 'drug-network-1-evidence-5',
                                label: 'Tìm kiếm bằng chứng',
                                icon: 'fa-search',
                                type: 'collect-evidence',
                                targetId: 'drug-network-1-evidence-5'
                            }
                        ]
                    }
                ],
                characters: [
                    {
                        id: 'drug-network-1-character-1',
                        case_id: 'drug-network-1',
                        name: 'Đại tá Nguyễn Minh',
                        role: 'Trưởng phòng chống ma túy',
                        image: 'https://media.istockphoto.com/id/1475091981/vi/anh/m%E1%BB%99t-nh%C3%B3m-c%E1%BA%A3nh-s%C3%A1t-metropolitan-%E1%BB%9F-trung-t%C3%A2m-london.jpg?s=612x612&w=0&k=20&c=v-oEO4NR8MkUFAmKSL37jqSVNRzC1GMpsyURVhVlNNM=',
                        initial_dialog: 'Chúng tôi đã theo dõi đường dây này nhiều tháng nay. Chúng rất tinh vi, sử dụng mạng lưới học sinh làm người bán hàng và câu lạc bộ đêm làm nơi phân phối. Chúng tôi cần bạn điều tra kín đáo để tìm ra kẻ cầm đầu.',
                        initialDialog: 'Chúng tôi đã theo dõi đường dây này nhiều tháng nay. Chúng rất tinh vi, sử dụng mạng lưới học sinh làm người bán hàng và câu lạc bộ đêm làm nơi phân phối. Chúng tôi cần bạn điều tra kín đáo để tìm ra kẻ cầm đầu.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'drug-network-1-dialog-1-1',
                                character_id: 'drug-network-1-character-1',
                                text: 'Các điểm chung giữa những vụ việc là gì?',
                                correct: true,
                                points: 15,
                                response: 'Tất cả các mẫu ma túy đều có cùng thành phần hóa học, chứng tỏ cùng một nguồn gốc. Chúng tôi cũng phát hiện học sinh từ các trường khác nhau đều khai nhận mua từ "Câu lạc bộ Phượng Hoàng". Đây là một câu lạc bộ đêm cao cấp, có mối quan hệ với nhiều người có thế lực.'
                            },
                            {
                                id: 'drug-network-1-dialog-1-2',
                                character_id: 'drug-network-1-character-1',
                                text: 'Có nghi phạm cụ thể nào không?',
                                correct: false,
                                points: 5,
                                response: 'Chúng tôi nghi ngờ Lê Hùng, quản lý câu lạc bộ, nhưng chưa có bằng chứng trực tiếp. Hắn rất cẩn trọng và có vẻ được bao che. Bạn cần thu thập bằng chứng vững chắc trước khi chúng ta có thể hành động.'
                            }
                        ]
                    },
                    {
                        id: 'drug-network-1-character-2',
                        case_id: 'drug-network-1',
                        name: 'Chuyên gia Trần Hải',
                        role: 'Chuyên gia phân tích dữ liệu',
                        image: 'https://qtuupload.s3.ap-southeast-1.amazonaws.com/2024/11/ky-thuat-phan-mem-lam-nghe-gi.png',
                        initial_dialog: 'Tôi đã phân tích dữ liệu cuộc gọi và tin nhắn từ các điện thoại bị tịch thu. Có một mô hình liên lạc rõ ràng giữa học sinh và một số điện thoại cố định tại câu lạc bộ đêm.',
                        initialDialog: 'Tôi đã phân tích dữ liệu cuộc gọi và tin nhắn từ các điện thoại bị tịch thu. Có một mô hình liên lạc rõ ràng giữa học sinh và một số điện thoại cố định tại câu lạc bộ đêm.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'drug-network-1-dialog-2-1',
                                character_id: 'drug-network-1-character-2',
                                text: 'Có dấu hiệu nào về người cầm đầu không?',
                                correct: true,
                                points: 20,
                                response: 'Có một số khá thú vị. Tất cả các cuộc gọi từ câu lạc bộ đều diễn ra sau khi có cuộc gọi từ một số điện thoại riêng. Số này được đăng ký dưới tên công ty "Phoenix Investment" - một công ty do Trần Đại, một doanh nhân có tiếng, làm chủ. Câu lạc bộ Phượng Hoàng cũng là một trong những tài sản của ông ta.'
                            },
                            {
                                id: 'drug-network-1-dialog-2-2',
                                character_id: 'drug-network-1-character-2',
                                text: 'Chúng ta có thể nghe lén các cuộc gọi không?',
                                correct: false,
                                points: 0,
                                response: 'Không có lệnh của tòa án thì việc đó là bất hợp pháp. Chúng ta cần có bằng chứng cụ thể hơn để xin lệnh. Tôi chỉ có thể phân tích metadata - ai gọi cho ai và khi nào, nhưng không thể nghe nội dung cuộc gọi.'
                            }
                        ]
                    },
                    {
                        id: 'drug-network-1-character-3',
                        case_id: 'drug-network-1',
                        name: 'Dương Quốc',
                        role: 'Nhân viên bảo vệ câu lạc bộ',
                        image: 'https://www.shutterstock.com/image-photo/security-guard-uniform-gun-outdoors-260nw-2530326225.jpg',
                        initial_dialog: 'Tôi chỉ làm việc của mình thôi. Kiểm soát người ra vào, đảm bảo không có đánh nhau trong câu lạc bộ. Tôi không biết gì về ma túy cả.',
                        initialDialog: 'Tôi chỉ làm việc của mình thôi. Kiểm soát người ra vào, đảm bảo không có đánh nhau trong câu lạc bộ. Tôi không biết gì về ma túy cả.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'drug-network-1-dialog-3-1',
                                character_id: 'drug-network-1-character-3',
                                text: 'Tôi không điều tra anh, tôi cần thông tin để bắt những kẻ thực sự phạm tội.',
                                correct: true,
                                points: 15,
                                response: '[Nhìn xung quanh lo lắng] Được rồi... Có những học sinh đến câu lạc bộ vào cuối tuần. Họ không uống nhiều, chỉ gặp quản lý Lê Hùng trong phòng VIP. Tôi thấy họ mang theo ba lô khi vào và khi ra... ba lô có vẻ nặng hơn. Và mỗi lần ông chủ - ông Trần Đại ghé qua, quản lý luôn có cuộc họp riêng với ông ta trong phòng VIP.'
                            },
                            {
                                id: 'drug-network-1-dialog-3-2',
                                character_id: 'drug-network-1-character-3',
                                text: 'Hợp tác đi, nếu không tôi sẽ bắt anh với tội danh đồng phạm.',
                                correct: false,
                                points: 5,
                                response: 'Tôi không biết gì cả! Tôi chỉ là bảo vệ thôi. Anh không thể bắt tôi nếu không có bằng chứng. Tôi sẽ gọi cho luật sư ngay bây giờ.'
                            }
                        ]
                    },
                    {
                        id: 'drug-network-1-character-4',
                        case_id: 'drug-network-1',
                        name: 'Lê Hùng',
                        role: 'Quản lý câu lạc bộ đêm',
                        image: 'https://www.eiim.in/wp-content/uploads/2019/02/2.jpeg',
                        initial_dialog: 'Chào mừng đến Câu lạc bộ Phượng Hoàng. Tôi có thể giúp gì cho bạn? Phòng VIP chỉ dành cho khách hàng thân thiết hoặc người có lời mời đặc biệt.',
                        initialDialog: 'Chào mừng đến Câu lạc bộ Phượng Hoàng. Tôi có thể giúp gì cho bạn? Phòng VIP chỉ dành cho khách hàng thân thiết hoặc người có lời mời đặc biệt.',
                        locked: false,
                        dialogOptions: [
                            {
                                id: 'drug-network-1-dialog-4-1',
                                character_id: 'drug-network-1-character-4',
                                text: 'Tôi đang điều tra về hoạt động phân phối ma túy liên quan đến câu lạc bộ này.',
                                correct: true,
                                points: 10,
                                response: '[Vẻ mặt căng thẳng] Tôi không biết anh đang nói về cái gì. Câu lạc bộ chúng tôi hoạt động hoàn toàn hợp pháp. Nếu anh muốn điều tra, hãy liên hệ với luật sư của chúng tôi. [Anh ta lấy điện thoại ra và nhắn tin cho ai đó]'
                            },
                            {
                                id: 'drug-network-1-dialog-4-2',
                                character_id: 'drug-network-1-character-4',
                                text: 'Tôi biết bạn làm việc cho Trần Đại. Hợp tác sẽ giúp bạn giảm nhẹ tội.',
                                correct: false,
                                points: 5,
                                response: 'Ông Trần là chủ sở hữu hợp pháp của câu lạc bộ này. Đó không phải là bí mật. Tôi nghĩ anh nên đi khỏi đây ngay lập tức hoặc tôi sẽ gọi bảo vệ. [Anh ta từ chối nói chuyện thêm]'
                            }
                        ]
                    },
                    {
                        id: 'drug-network-1-character-5',
                        case_id: 'drug-network-1',
                        name: 'Trần Đại',
                        role: 'Doanh nhân - Chủ câu lạc bộ',
                        image: 'https://media.istockphoto.com/id/165997753/photo/male-executives-with-pleasing-personality.jpg?s=612x612&w=0&k=20&c=irmfDclZWeoF9gxzCSfPYVy3GmvZS8vUCBW-iIK484I=',
                        initial_dialog: 'Tôi là một doanh nhân hợp pháp với nhiều dự án kinh doanh thành công. Câu lạc bộ Phượng Hoàng chỉ là một trong số đó. Tôi không hiểu tại sao cảnh sát lại quan tâm đến tôi.',
                        initialDialog: 'Tôi là một doanh nhân hợp pháp với nhiều dự án kinh doanh thành công. Câu lạc bộ Phượng Hoàng chỉ là một trong số đó. Tôi không hiểu tại sao cảnh sát lại quan tâm đến tôi.',
                        locked: true,
                        dialogOptions: [
                            {
                                id: 'drug-network-1-dialog-5-1',
                                character_id: 'drug-network-1-character-5',
                                text: 'Chúng tôi có bằng chứng về hoạt động phân phối ma túy trong câu lạc bộ của ông.',
                                correct: true,
                                points: 25,
                                response: '[Vẫn giữ vẻ bình tĩnh] Nếu có bất cứ hoạt động bất hợp pháp nào xảy ra trong cơ sở của tôi, tôi hoàn toàn không biết gì. Có lẽ là do nhân viên của tôi. Tôi sẵn sàng hợp tác đầy đủ với cuộc điều tra. [Ông ta nói một cách quá bình tĩnh và có vẻ đã chuẩn bị trước câu trả lời]'
                            },
                            {
                                id: 'drug-network-1-dialog-5-2',
                                character_id: 'drug-network-1-character-5',
                                text: 'Chúng tôi sẽ lục soát tất cả các cơ sở kinh doanh của ông.',
                                correct: false,
                                points: 0,
                                response: 'Anh không thể làm vậy nếu không có lệnh hợp lệ. Và nếu có lệnh, luật sư của tôi sẽ có mặt trong mọi cuộc lục soát. Tôi biết quyền của mình. Nếu không còn gì khác, tôi còn có cuộc họp quan trọng. [Ông ta rõ ràng không hề lo lắng và có vẻ tự tin]'
                            }
                        ]
                    }
                ],
                evidence: [
                    {
                        id: 'drug-network-1-evidence-1',
                        case_id: 'drug-network-1',
                        name: 'Báo cáo vụ án trước',
                        description: 'Báo cáo chi tiết về vụ ma túy trong trường học, có thông tin về nguồn gốc ma túy.',
                        image: 'https://media.vietnamplus.vn/images/7255a701687d11cb8c6bbc58a6c80785d7c821b2c830f0b21a7a4d22ee16b4abe2aa2c1ab04f1bd414fc1483815907af962390365a35a1c19be4a4d448d7a4a3aae1877ca4825bef651bf9975b4d74475b4a2b42c93102a86720a452b12d507e/403762700-3679536655662887-1350533230688316859-n-6414.jpg',
                        analysis: 'Học sinh khai nhận mua ma túy từ "anh Hùng" tại Câu lạc bộ Phượng Hoàng. Mô tả khớp với Lê Hùng, quản lý câu lạc bộ.',
                        points: 10,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'drug-network-1-evidence-2',
                        case_id: 'drug-network-1',
                        name: 'Mẫu ma túy',
                        description: 'Các mẫu ma túy tổng hợp thu giữ từ nhiều vụ án khác nhau trong khu vực.',
                        image: 'https://cdn.britannica.com/05/213705-050-4331A79A/drug-concept-drug-abuse-addition-heroin-injection-doping-opium-epidemic.jpg',
                        analysis: 'Phân tích hóa học cho thấy tất cả các mẫu đều có cùng thành phần, chứng tỏ chúng đến từ cùng một nguồn.',
                        points: 15,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'drug-network-1-evidence-3',
                        case_id: 'drug-network-1',
                        name: 'Dữ liệu cuộc gọi',
                        description: 'Phân tích dữ liệu cuộc gọi từ điện thoại của học sinh bị bắt và số điện thoại câu lạc bộ.',
                        image: 'https://media.vneconomy.vn/w800/images/upload/2022/09/24/anh-chup-man-hinh-2022-09-24-luc-19-56-55.png',
                        analysis: 'Mẫu hình cuộc gọi cho thấy mối liên hệ giữa Lê Hùng, học sinh, và một số điện thoại đăng ký cho công ty Phoenix Investment của Trần Đại.',
                        points: 20,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'drug-network-1-evidence-4',
                        case_id: 'drug-network-1',
                        name: 'Đoạn video an ninh',
                        description: 'Đoạn video từ camera an ninh gần câu lạc bộ, quay lại hoạt động đáng ngờ.',
                        image: 'https://media.istockphoto.com/id/1094946174/video/cctv-monitors-display-with-city-scenes.jpg?s=640x640&k=20&c=7N80-NpTD_fQF8tak4gxNT6iLgWn1dYeDjZ2_HGUf_Q=',
                        analysis: 'Video cho thấy học sinh định kỳ đến câu lạc bộ vào cuối tuần và rời đi với ba lô. Một số người mặc đồng phục của trường học khác nhau.',
                        points: 15,
                        collected_by_default: false,
                        collectedByDefault: false
                    },
                    {
                        id: 'drug-network-1-evidence-5',
                        case_id: 'drug-network-1',
                        name: 'Sổ kế toán bí mật',
                        description: 'Một quyển sổ được tìm thấy trong phòng VIP, ghi chép các giao dịch với mã hóa.',
                        image: 'https://media.istockphoto.com/id/1431694821/photo/investors-working-on-desk-office-and-check-data-cost-balance-profit-and-currency-on-monitor.jpg?s=612x612&w=0&k=20&c=JDWZLzE3plhA8wKQcRAWnnZTU7Xk6wqqYFicSyII0hc=',
                        analysis: 'Sau khi giải mã, sổ tiết lộ chi tiết về số lượng ma túy được phân phối, các khoản thanh toán, và danh sách khách hàng bao gồm các trường học.',
                        points: 30,
                        collected_by_default: false,
                        collectedByDefault: false
                    }
                ],
                finalSteps: [{
                    id: 'drug-network-1-final',
                    case_id: 'drug-network-1',
                    require_character_id: 'drug-network-1-character-5',
                    narrative: '<h3>Giải Quyết Vụ Án</h3><p>Sau khi thu thập đủ bằng chứng, bạn đã xác định rõ Trần Đại là người đứng đầu đường dây ma túy, sử dụng câu lạc bộ Phượng Hoàng làm nơi phân phối ma túy cho học sinh từ nhiều trường học.</p><p>Giờ đây bạn cần quyết định cách xử lý tình huống này.</p>',
                    required_evidence: ['drug-network-1-evidence-3', 'drug-network-1-evidence-4', 'drug-network-1-evidence-5'],
                    requireEvidence: ['drug-network-1-evidence-3', 'drug-network-1-evidence-4', 'drug-network-1-evidence-5'],
                    choices: [
                        {
                            id: 'drug-network-1-choice-1',
                            final_step_id: 'drug-network-1-final',
                            text: 'Phối hợp với các đơn vị chức năng để bắt giữ toàn bộ đường dây, từ Trần Đại đến những người phân phối ma túy trực tiếp cho học sinh',
                            correct: true,
                            finalSolution: true,
                            points: 30,
                            outcome: 'Chiến dịch phối hợp của các lực lượng chức năng đã thành công trong việc triệt phá toàn bộ đường dây ma túy. Trần Đại, Lê Hùng và nhiều đối tượng liên quan bị bắt giữ. Nhiều trường học đã thoát khỏi nguy cơ ma túy lan rộng.',
                            next_case_id: null,
                            nextCase: null
                        },
                        {
                            id: 'drug-network-1-choice-2',
                            final_step_id: 'drug-network-1-final',
                            text: 'Chỉ tập trung bắt giữ các đối tượng phân phối trực tiếp cho học sinh tại câu lạc bộ',
                            correct: false,
                            finalSolution: false,
                            points: 10,
                            outcome: 'Các đối tượng phân phối trực tiếp bị bắt giữ, nhưng Trần Đại vẫn tiếp tục hoạt động. Chỉ sau vài tháng, đường dây ma túy được tái lập với các đối tượng mới. Vấn đề ma túy trong trường học vẫn tiếp diễn.',
                            next_case_id: null,
                            nextCase: null
                        }
                    ]
                }],
                finalStep: {
                    id: 'drug-network-1-final',
                    case_id: 'drug-network-1',
                    require_character_id: 'drug-network-1-character-5',
                    narrative: '<h3>Giải Quyết Vụ Án</h3><p>Sau khi thu thập đủ bằng chứng, bạn đã xác định rõ Trần Đại là người đứng đầu đường dây ma túy, sử dụng câu lạc bộ Phượng Hoàng làm nơi phân phối ma túy cho học sinh từ nhiều trường học.</p><p>Giờ đây bạn cần quyết định cách xử lý tình huống này.</p>',
                    required_evidence: ['drug-network-1-evidence-3', 'drug-network-1-evidence-4', 'drug-network-1-evidence-5'],
                    requireEvidence: ['drug-network-1-evidence-3', 'drug-network-1-evidence-4', 'drug-network-1-evidence-5'],
                    choices: [
                        {
                            id: 'drug-network-1-choice-1',
                            final_step_id: 'drug-network-1-final',
                            text: 'Phối hợp với các đơn vị chức năng để bắt giữ toàn bộ đường dây, từ Trần Đại đến những người phân phối ma túy trực tiếp cho học sinh',
                            correct: true,
                            finalSolution: true,
                            points: 30,
                            outcome: 'Chiến dịch phối hợp của các lực lượng chức năng đã thành công trong việc triệt phá toàn bộ đường dây ma túy. Trần Đại, Lê Hùng và nhiều đối tượng liên quan bị bắt giữ. Nhiều trường học đã thoát khỏi nguy cơ ma túy lan rộng.',
                            next_case_id: null,
                            nextCase: null
                        },
                        {
                            id: 'drug-network-1-choice-2',
                            final_step_id: 'drug-network-1-final',
                            text: 'Chỉ tập trung bắt giữ các đối tượng phân phối trực tiếp cho học sinh tại câu lạc bộ',
                            correct: false,
                            finalSolution: false,
                            points: 10,
                            outcome: 'Các đối tượng phân phối trực tiếp bị bắt giữ, nhưng Trần Đại vẫn tiếp tục hoạt động. Chỉ sau vài tháng, đường dây ma túy được tái lập với các đối tượng mới. Vấn đề ma túy trong trường học vẫn tiếp diễn.',
                            next_case_id: null,
                            nextCase: null
                        }
                    ]
                },
                successContent: '<p>Chúc mừng! Chiến dịch triệt phá đường dây ma túy đã thành công rực rỡ.</p><p>Việc phối hợp đồng bộ giữa các lực lượng đã giúp bắt giữ được toàn bộ đường dây, từ Trần Đại - người cầm đầu, đến các đối tượng phân phối trực tiếp cho học sinh. Câu lạc bộ Phượng Hoàng đã bị đóng cửa và tất cả tài sản liên quan đến hoạt động phạm pháp đã bị tịch thu.</p><p>Nhiều học sinh đã tránh được nguy cơ nghiện ma túy, và các trường học đã nhận được sự hỗ trợ để tăng cường giáo dục phòng chống ma túy. Đặc biệt, thông qua việc bắt giữ Trần Đại, nhiều đường dây ma túy khác cũng bị phát hiện và triệt phá.</p>',
                failureContent: '<p>Rất tiếc, chiến dịch chỉ đạt được thành công một phần. Mặc dù một số đối tượng phân phối trực tiếp đã bị bắt giữ, nhưng đường dây ma túy vẫn chưa bị triệt phá hoàn toàn.</p><p>Trần Đại - người cầm đầu đường dây - vẫn tiếp tục hoạt động và nhanh chóng thay thế những mắt xích đã bị bắt. Chỉ sau vài tháng, các báo cáo về việc học sinh sử dụng ma túy lại xuất hiện, thậm chí còn lan rộng sang nhiều trường học khác.</p><p>Vụ việc này cho thấy tầm quan trọng của việc điều tra tận gốc và xử lý triệt để các đường dây ma túy, đặc biệt khi chúng nhắm vào đối tượng học sinh.</p>',
                educationalTips: [
                    'Ma túy tổng hợp ngày càng phổ biến trong giới trẻ với nhiều hình dạng, màu sắc bắt mắt, thường được ngụy trang dưới dạng kẹo hoặc thực phẩm thông thường.',
                    'Các đường dây ma túy thường sử dụng học sinh làm "tay trong" để tiếp cận và mở rộng khách hàng trong trường học.',
                    'Cha mẹ và nhà trường cần phối hợp để theo dõi những thay đổi bất thường về hành vi, học tập và các mối quan hệ của học sinh.',
                    'Giáo dục phòng chống ma túy cần được thực hiện thường xuyên, liên tục và bằng nhiều hình thức khác nhau, không chỉ là các buổi nói chuyện một chiều.',
                    'Khi phát hiện dấu hiệu sử dụng ma túy, cần báo ngay cho các cơ quan chức năng, không nên tự xử lý hoặc giấu giếm vì lý do thể diện.'
                ]
            };
            
            // Lưu vào cache
            this.caseDetails[id] = caseDetail;
            return caseDetail;
        }
        
        // Không tìm thấy vụ án
        console.warn(`Không tìm thấy dữ liệu chi tiết cho vụ án: ${id}`);
        
        // Tạo dữ liệu cơ bản nếu có trong danh sách vụ án
        const basicCase = this.cases.find(c => c.id === id);
        if (basicCase) {
            console.log('Tạo dữ liệu cơ bản cho vụ án:', basicCase.title);
            
            // Tạo dữ liệu mẫu tối thiểu dựa trên thông tin cơ bản
            const caseDetail = {
                ...basicCase,
                steps: [{
                    id: `${id}-step-1`,
                    case_id: id,
                    narrative: `<h3>${basicCase.title}</h3><p>${basicCase.description}</p><p>Chi tiết vụ án này đang được phát triển.</p>`,
                    is_starting_step: true,
                    isStartingStep: true
                }],
                locations: [],
                characters: [],
                evidence: [],
                finalSteps: [{
                    id: `${id}-final`,
                    case_id: id,
                    narrative: `<h3>Kết thúc vụ án</h3><p>Bạn đã hoàn thành điều tra vụ án ${basicCase.title}.</p>`,
                    choices: [
                        {
                            id: `${id}-choice-1`,
                            text: 'Hoàn thành vụ án',
                            correct: true,
                            finalSolution: true,
                            points: 20,
                            outcome: 'Vụ án đã được giải quyết thành công.'
                        }
                    ]
                }],
                finalStep: {
                    id: `${id}-final`,
                    case_id: id,
                    narrative: `<h3>Kết thúc vụ án</h3><p>Bạn đã hoàn thành điều tra vụ án ${basicCase.title}.</p>`,
                    choices: [
                        {
                            id: `${id}-choice-1`,
                            text: 'Hoàn thành vụ án',
                            correct: true,
                            finalSolution: true,
                            points: 20,
                            outcome: 'Vụ án đã được giải quyết thành công.'
                        }
                    ]
                },
                successContent: `<p>Chúc mừng! Bạn đã giải quyết thành công vụ án ${basicCase.title}.</p>`,
                failureContent: `<p>Rất tiếc, bạn chưa giải quyết thành công vụ án ${basicCase.title}.</p>`,
                educationalTips: [
                    'Các vấn đề xã hội cần được nhìn nhận đa chiều và giải quyết kịp thời.',
                    'Phòng ngừa luôn hiệu quả hơn khắc phục hậu quả.'
                ]
            };
            
            // Lưu vào cache
            this.caseDetails[id] = caseDetail;
            return caseDetail;
        }
        
        return null;
    }

    /**
     * Lấy danh sách vụ án theo chế độ
     * @param {string} mode - Chế độ chơi ('story', 'quick', 'challenge')
     * @returns {Array} Danh sách vụ án
     */
    async getCasesByMode(mode) {
        try {
            // Đảm bảo dữ liệu đã được tải
            if (!this.loaded) {
                await this.loadCases();
            }
            
            // Lọc các vụ án theo chế độ từ dữ liệu đã tải
            return this.cases.filter(c => c.mode === mode || c.mode === 'all');
        } catch (error) {
            console.error('Lỗi tải danh sách vụ án theo chế độ:', error);
            return [];
        }
    }

    /**
     * Kiểm tra xem một vụ án có bị khóa hay không
     * @param {string} caseId - ID của vụ án
     * @param {Array} completedCases - Danh sách ID các vụ án đã hoàn thành
     * @returns {boolean} True nếu vụ án bị khóa
     */
    async isCaseLocked(caseId, completedCases) {
        try {
            // Đảm bảo completedCases là mảng
            const completedList = Array.isArray(completedCases) ? completedCases : [];
            
            // Tìm vụ án trong danh sách
            const caseData = this.cases.find(c => c.id === caseId);
            
            if (!caseData) {
                console.warn(`Không tìm thấy vụ án với ID: ${caseId}`);
                return true; // Nếu không tìm thấy, coi như bị khóa
            }
            
            // Nếu vụ án không có cờ khóa, luôn mở
            if (!caseData.is_locked) {
                return false;
            }
            
            // Kiểm tra yêu cầu vụ án trước đó
            if (caseData.requiredCases && caseData.requiredCases.length > 0) {
                // Kiểm tra xem người chơi đã hoàn thành tất cả các vụ án yêu cầu chưa
                const allCompleted = caseData.requiredCases.every(requiredCaseId => 
                    completedList.includes(requiredCaseId)
                );
                
                if (!allCompleted) {
                    console.log(`Vụ án ${caseId} bị khóa vì chưa hoàn thành các vụ án yêu cầu:`, caseData.requiredCases);
                    return true; // Vụ án bị khóa
                }
            }
            
            // Vụ án được mở khóa
            return false;
        } catch (error) {
            console.error('Lỗi kiểm tra trạng thái khóa vụ án:', error);
            return true; // Nếu có lỗi, coi như vụ án bị khóa
        }
    }

    /**
     * Kiểm tra xem một nhân vật có bị khóa hay không
     * @param {object} character - Dữ liệu nhân vật
     * @param {Array} collectedEvidence - Danh sách ID bằng chứng đã thu thập
     * @param {Array} interactedCharacters - Danh sách ID nhân vật đã tương tác
     * @returns {boolean} True nếu nhân vật bị khóa
     */
    isCharacterLocked(character, collectedEvidence, interactedCharacters) {
        // Nếu nhân vật không có cờ khóa
        if (!character.locked) return false;
        
        // Kiểm tra yêu cầu bằng chứng
        if (character.requiredEvidence && character.requiredEvidence.length > 0) {
            const hasAllEvidence = character.requiredEvidence.every(evidenceId => 
                collectedEvidence.includes(evidenceId)
            );
            if (!hasAllEvidence) return true;
        }
        
        // Kiểm tra yêu cầu nhân vật
        if (character.requiredCharacter && character.requiredCharacter.length > 0) {
            const hasAllCharacters = character.requiredCharacter.every(charId => 
                interactedCharacters.includes(charId)
            );
            if (!hasAllCharacters) return true;
        }
        
        return false;
    }

    /**
     * Kiểm tra xem một địa điểm có bị khóa hay không
     * @param {object} location - Dữ liệu địa điểm
     * @param {Array} collectedEvidence - Danh sách ID bằng chứng đã thu thập
     * @returns {boolean} True nếu địa điểm bị khóa
     */
    isLocationLocked(location, collectedEvidence) {
        // Nếu địa điểm không có cờ khóa hoặc là địa điểm đầu tiên
        if (!location.locked || location.first_location) return false;
        
        // Kiểm tra yêu cầu bằng chứng
        if (location.requiredEvidence && location.requiredEvidence.length > 0) {
            return !location.requiredEvidence.every(evidenceId => 
                collectedEvidence.includes(evidenceId)
            );
        }
        
        return false;
    }

    /**
     * Lấy bước tiếp theo trong vụ án
     * @param {string} caseId - ID của vụ án
     * @param {string} currentStepId - ID của bước hiện tại
     * @param {Array} collectedEvidence - Danh sách ID bằng chứng đã thu thập
     * @param {Array} interactedCharacters - Danh sách ID nhân vật đã tương tác
     * @returns {object|null} Bước tiếp theo hoặc null nếu là bước cuối
     */
    async getNextStep(caseId, currentStepId, collectedEvidence, interactedCharacters) {
        const caseData = await this.getCaseById(caseId);
        
        if (!caseData || !caseData.steps) return null;
        
        // Tìm bước hiện tại
        const currentStep = caseData.steps.find(step => step.id === currentStepId);
        
        if (!currentStep) return null;
        
        // Kiểm tra xem đã đủ điều kiện để kết thúc vụ án chưa
        if (caseData.finalStep) {
            const finalStep = caseData.finalStep;
            
            // Kiểm tra điều kiện bằng chứng
            const hasAllRequiredEvidence = finalStep.requireEvidence ? 
                finalStep.requireEvidence.every(evidenceId => collectedEvidence.includes(evidenceId)) : 
                true;
                
            // Kiểm tra điều kiện nhân vật
            let hasRequiredCharacter = true;
            
            // Nếu có require_characters (danh sách nhân vật)
            if (finalStep.require_characters && Array.isArray(finalStep.require_characters)) {
                hasRequiredCharacter = finalStep.require_characters.every(charId => 
                    interactedCharacters.includes(charId)
                );
            }
            // Nếu chỉ có require_character_id (một nhân vật hoặc danh sách)
            else if (finalStep.require_character_id) {
                if (Array.isArray(finalStep.require_character_id)) {
                    hasRequiredCharacter = finalStep.require_character_id.every(charId => 
                        interactedCharacters.includes(charId)
                    );
                } else {
                    hasRequiredCharacter = interactedCharacters.includes(finalStep.require_character_id);
                }
            }
                
            if (hasAllRequiredEvidence && hasRequiredCharacter) {
                return {
                    ...finalStep,
                    isFinalStep: true
                };
            }
        }
        
        // Nếu bước hiện tại có next_step_id, trả về bước tiếp theo
        if (currentStep.next_step_id) {
            return caseData.steps.find(step => step.id === currentStep.next_step_id) || null;
        }
        
        return null;
    }

    /**
     * Lấy vụ án theo ID
     * @param {string} id - ID của vụ án
     * @returns {object|null} Dữ liệu vụ án hoặc null nếu không tìm thấy
     */
    async getCaseById(id) {
        try {
            console.log('Gọi getCaseById cho ID:', id);
            
            // Kiểm tra id có hợp lệ không
            if (!id) {
                console.error('Lỗi: id không được cung cấp cho getCaseById');
                return null;
            }
            
            // Kiểm tra trong cache trước
            if (this.caseDetails[id]) {
                console.log('Đã tìm thấy vụ án trong cache:', id);
                return this.caseDetails[id];
            }
            
            // Kiểm tra xem vụ án có trong danh sách cơ bản không
            const basicCase = this.cases.find(c => c.id === id);
            if (!basicCase) {
                console.warn('Không tìm thấy vụ án trong danh sách cơ bản:', id);
                return null;
            }
            
            // Tải chi tiết vụ án từ dữ liệu cục bộ
            const caseDetail = await this.loadLocalCaseDetails(id);
            return caseDetail;
        } catch (error) {
            console.error('Lỗi trong getCaseById:', error);
            
            // Tìm trong dữ liệu cache (trường hợp đã tải local data)
            if (this.caseDetails[id]) {
                console.log('Lấy dữ liệu từ cache local');
                return this.caseDetails[id];
            }
            
            // Tìm trong danh sách vụ án cơ bản
            const basicCase = this.cases.find(c => c.id === id);
            
            if (basicCase) {
                console.warn(`Không thể tải chi tiết vụ án "${basicCase.title}". Trả về thông tin cơ bản.`);
                
                // Trả về thông tin cơ bản với các mảng rỗng để tránh lỗi
                return {
                    ...basicCase,
                    steps: [],
                    locations: [],
                    characters: [],
                    evidence: [],
                    successContent: "Không thể tải nội dung chi tiết vụ án.",
                    failureContent: "Không thể tải nội dung chi tiết vụ án.",
                    educationalTips: []
                };
            } else {
                console.error('Không tìm thấy vụ án');
                return null;
            }
        }
    }
} 