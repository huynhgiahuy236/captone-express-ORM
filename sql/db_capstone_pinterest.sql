-- ======================================================
-- DỰ ÁN CAPSTONE: PINTEREST CLONE - DATABASE SCRIPT
-- Phù hợp mô hình ERD đề bài & Chuẩn quản lý của khóa học
-- ======================================================

-- 1. Tạo Database
CREATE DATABASE IF NOT EXISTS `db_capstone_pinterest` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `db_capstone_pinterest`;

-- ======================================================
-- 2. Tạo Bảng: nguoi_dung (Người dùng)
-- ======================================================
CREATE TABLE IF NOT EXISTS `nguoi_dung` (
	`nguoi_dung_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	`email` VARCHAR(255) NOT NULL UNIQUE,
	`mat_khau` VARCHAR(255) NULL,
	`ho_ten` VARCHAR(255),
	`tuoi` INT,
	`anh_dai_dien` TEXT,
	`mo_ta` TEXT NULL,
	`quyen_rieng_tu` TEXT NULL,
	`google_id` VARCHAR(255) NULL,

	-- Bộ thuộc tính quản trị mặc định
	`deletedBy` INT NOT NULL DEFAULT 0,
	`isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
	`deletedAt` TIMESTAMP NULL DEFAULT NULL,
	`createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================
-- 3. Tạo Bảng: hinh_anh (Hình ảnh do người dùng đăng)
-- ======================================================
CREATE TABLE IF NOT EXISTS `hinh_anh` (
	`hinh_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	`ten_hinh` VARCHAR(255) NOT NULL,
	`duong_dan` TEXT NOT NULL,
	`mo_ta` TEXT,
	`the_loai` VARCHAR(100) NULL,
	`nguoi_dung_id` INT NOT NULL,

	-- Ràng buộc khóa ngoại liên kết tới người dùng tạo ảnh
	FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE,

	-- Bộ thuộc tính quản trị mặc định
	`deletedBy` INT NOT NULL DEFAULT 0,
	`isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
	`deletedAt` TIMESTAMP NULL DEFAULT NULL,
	`createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================
-- 4. Tạo Bảng: binh_luan (Bình luận của người dùng trên ảnh)
-- ======================================================
CREATE TABLE IF NOT EXISTS `binh_luan` (
	`binh_luan_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	`nguoi_dung_id` INT NOT NULL,
	`hinh_id` INT NOT NULL,
	`ngay_binh_luan` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`noi_dung` TEXT NOT NULL,

	-- Ràng buộc khóa ngoại
	FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE,
	FOREIGN KEY (`hinh_id`) REFERENCES `hinh_anh`(`hinh_id`) ON DELETE CASCADE,

	-- Bộ thuộc tính quản trị mặc định
	`deletedBy` INT NOT NULL DEFAULT 0,
	`isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
	`deletedAt` TIMESTAMP NULL DEFAULT NULL,
	`createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================
-- 5. Tạo Bảng: luu_anh (Lưu trữ ảnh của người dùng)
-- ======================================================
CREATE TABLE IF NOT EXISTS `luu_anh` (
	`nguoi_dung_id` INT NOT NULL,
	`hinh_id` INT NOT NULL,
	`ngay_luu` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	-- Khóa chính phức hợp (Composite Primary Key)
	PRIMARY KEY (`nguoi_dung_id`, `hinh_id`),

	-- Ràng buộc khóa ngoại
	FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE,
	FOREIGN KEY (`hinh_id`) REFERENCES `hinh_anh`(`hinh_id`) ON DELETE CASCADE,

	-- Bộ thuộc tính quản trị mặc định
	`deletedBy` INT NOT NULL DEFAULT 0,
	`isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
	`deletedAt` TIMESTAMP NULL DEFAULT NULL,
	`createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================
-- 6. Tạo Bảng: tym_anh (Thả tim hình ảnh)
-- ======================================================
CREATE TABLE IF NOT EXISTS `tym_anh` (
	`nguoi_dung_id` INT NOT NULL,
	`hinh_id` INT NOT NULL,
	`ngay_tym` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (`nguoi_dung_id`, `hinh_id`),
	FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE,
	FOREIGN KEY (`hinh_id`) REFERENCES `hinh_anh`(`hinh_id`) ON DELETE CASCADE,

	`deletedBy` INT NOT NULL DEFAULT 0,
	`isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
	`deletedAt` TIMESTAMP NULL DEFAULT NULL,
	`createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================
-- 7. Tạo Bảng: tym_binh_luan (Thả tim bình luận)
-- ======================================================
CREATE TABLE IF NOT EXISTS `tym_binh_luan` (
	`nguoi_dung_id` INT NOT NULL,
	`binh_luan_id` INT NOT NULL,
	`ngay_tym` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (`nguoi_dung_id`, `binh_luan_id`),
	FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE,
	FOREIGN KEY (`binh_luan_id`) REFERENCES `binh_luan`(`binh_luan_id`) ON DELETE CASCADE,

	`deletedBy` INT NOT NULL DEFAULT 0,
	`isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
	`deletedAt` TIMESTAMP NULL DEFAULT NULL,
	`createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================
-- 8. Tạo Bảng: theo_doi (Follow người dùng / tác giả)
-- ======================================================
CREATE TABLE IF NOT EXISTS `theo_doi` (
	`theo_doi_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	`nguoi_theo_doi_id` INT NOT NULL,
	`nguoi_duoc_theo_doi_id` INT NOT NULL,
	`createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	UNIQUE KEY `unique_follow` (`nguoi_theo_doi_id`, `nguoi_duoc_theo_doi_id`),
	FOREIGN KEY (`nguoi_theo_doi_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE,
	FOREIGN KEY (`nguoi_duoc_theo_doi_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE
);

-- ======================================================
-- 9. Tạo Bảng: thong_bao (Thông báo tương tác)
-- ======================================================
CREATE TABLE IF NOT EXISTS `thong_bao` (
	`thong_bao_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	`nguoi_gui_id` INT NOT NULL,
	`nguoi_nhan_id` INT NOT NULL,
	`hinh_id` INT NULL,
	`loai` VARCHAR(50) NOT NULL, -- 'LIKE' | 'COMMENT'
	`noi_dung` TEXT NOT NULL,
	`da_doc` TINYINT(1) NOT NULL DEFAULT 0,
	`createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

	FOREIGN KEY (`nguoi_gui_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE,
	FOREIGN KEY (`nguoi_nhan_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`) ON DELETE CASCADE,
	FOREIGN KEY (`hinh_id`) REFERENCES `hinh_anh`(`hinh_id`) ON DELETE CASCADE
);

-- ======================================================
-- 9. DỮ LIỆU MẪU SINH ĐỘNG (SEED / MOCK DATA)
-- Mật khẩu mẫu cho tất cả tài khoản bên dưới là: 123456
-- (Đã băm bằng bcrypt: $2b$10$t.cHgqiftehsWXmiDwCi3OTNHDvnxh.E/WXcL96iKlv.9Rn73dr46)
-- ======================================================

-- 6.1 Thêm danh sách Người dùng mẫu
INSERT INTO `nguoi_dung` (`nguoi_dung_id`, `email`, `mat_khau`, `ho_ten`, `tuoi`, `anh_dai_dien`) VALUES
(1, 'sangnguyen@gmail.com', '$2b$10$t.cHgqiftehsWXmiDwCi3OTNHDvnxh.E/WXcL96iKlv.9Rn73dr46', 'Sang Nguyễn', 24, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500'),
(2, 'phongtulam@gmail.com', '$2b$10$t.cHgqiftehsWXmiDwCi3OTNHDvnxh.E/WXcL96iKlv.9Rn73dr46', 'Phong Tử Lâm', 22, 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=500'),
(3, 'nguyennhu@gmail.com', '$2b$10$t.cHgqiftehsWXmiDwCi3OTNHDvnxh.E/WXcL96iKlv.9Rn73dr46', 'Nguyễn Như', 20, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500'),
(4, 'threadless@gmail.com', '$2b$10$t.cHgqiftehsWXmiDwCi3OTNHDvnxh.E/WXcL96iKlv.9Rn73dr46', 'Threadless Art Studio', 28, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'),
(5, 'bypfs7@gmail.com', '$2b$10$t.cHgqiftehsWXmiDwCi3OTNHDvnxh.E/WXcL96iKlv.9Rn73dr46', 'Bypfs Graphic', 25, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'),
(6, 'twilight@gmail.com', '$2b$10$t.cHgqiftehsWXmiDwCi3OTNHDvnxh.E/WXcL96iKlv.9Rn73dr46', 'Twilight Hunter', 23, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 6.2 Thêm danh sách Hình ảnh phong phú (80 ảnh: 8 thể loại x 10 ảnh)
INSERT INTO `hinh_anh` (`hinh_id`, `ten_hinh`, `duong_dan`, `mo_ta`, `the_loai`, `nguoi_dung_id`) VALUES
(1, 'Chú cún Corgi nụ cười rạng rỡ', 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800', 'Chú chó Corgi chân ngắn với biểu cảm cười híp mắt siêu đáng yêu và tràn đầy năng lượng', 'Thú cưng', 1),
(2, 'Mèo Anh lông ngắn mắt tròn ngơ ngác', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'Bức chân dung cận cảnh chú mèo xám với đôi mắt to tròn xoe ngơ ngác cực hài hước', 'Thú cưng', 2),
(3, 'Chó French Bulldog áo vàng cực ngầu', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', 'Phong cách thời trang đường phố sành điệu của chú cún bulldog trong chiếc áo len vàng nổi bật', 'Thú cưng', 3),
(4, 'Mèo con Scottish Fold tai cụp ngủ say', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800', 'Khoảnh khắc bình yên của bé mèo con tai cụp ngủ ngon lành trên tấm thảm len ấm áp', 'Thú cưng', 4),
(5, 'Chú chó Golden Retriever tinh nghịch liếm mũi', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', 'Bức ảnh bắt trọn khoảnh khắc hài hước liếm mũi của chú chó Golden thông minh', 'Thú cưng', 5),
(6, 'Chó Shiba Inu ngắm hoa anh đào', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800', 'Nét đẹp trong trẻo của chú chó quốc khuyển Nhật Bản Shiba Inu giữa vườn hoa sakura nở rộ', 'Thú cưng', 6),
(7, 'Chó Husky ngáo với đôi mắt xanh biếc', 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800', 'Vẻ đẹp dũng mãnh pha chút ngộ nghĩnh của chú chó tuyết Husky xứ Siberia', 'Thú cưng', 1),
(8, 'Mèo con mướp vàng vươn vai đón nắng', 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=800', 'Chú mèo con lông vàng đáng yêu tắm nắng sớm bên khung cửa sổ mộng mơ', 'Thú cưng', 2),
(9, 'Chuột Hamster gặm hạt hướng dương', 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800', 'Chú chuột hamster béo múp míp nhét đầy hạt vào hai bên má tròn xoe', 'Thú cưng', 3),
(10, 'Cún Poodle quấn khăn len mùa đông', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800', 'Biểu cảm dễ thương của chú cún lông xù đeo kính và quấn khăn ấm áp trong ngày tuyết rơi', 'Thú cưng', 4),
(11, 'Siêu xe Nissan GT-R trên cung đường hoàng hôn', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', 'Chiến mã thể thao Nissan GT-R dũng mãnh lăn bánh trên cung đường tuyệt đẹp trong ánh hoàng hôn rực rỡ', 'Xe cộ', 5),
(12, 'Siêu xe thể thao Porsche 911 Classic', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'Huyền thoại xe hơi thể thao Porsche 911 phong cách retro đầy uy lực và sang trọng', 'Xe cộ', 6),
(13, 'Siêu xe Lamborghini Huracán xanh dạ quang', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800', 'Thiết kế góc cạnh khí động học đỉnh cao của dòng siêu bò Lamborghini với tone màu neon nổi bật', 'Xe cộ', 1),
(14, 'Siêu xe cơ bắp Ford Mustang Shelby GT500', 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800', 'Biểu tượng xe cơ bắp Mỹ đậm chất thể thao với động cơ gầm vang đầy phấn khích', 'Xe cộ', 2),
(15, 'Xe thể thao Chevrolet Corvette mui trần', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 'Đẳng cấp tốc độ và tự do trên chiếc Corvette mui trần lướt gió miền duyên hải', 'Xe cộ', 3),
(16, 'Xe thể thao Audi R8 V10 phong cách đường phố', 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800', 'Cỗ máy tốc độ Audi R8 với dải đèn LED ma trận và âm thanh động cơ V10 phấn khích', 'Xe cộ', 4),
(17, 'Mô tô phân khối lớn Harley-Davidson cá tính', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800', 'Dòng xe cruiser kinh điển dành cho những tâm hồn tự do đam mê chinh phục mọi nẻo đường', 'Xe cộ', 5),
(18, 'Mô tô thể thao Ducati Panigale V4 đỏ rực', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 'Tuyệt phẩm superbike nước Ý với công nghệ đường đua và sắc đỏ đặc trưng quyến rũ', 'Xe cộ', 6),
(19, 'Siêu xe BMW M4 Coupe màu xanh dương', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800', 'Vẻ đẹp thể thao và hiệu suất đỉnh cao của dòng M Power đến từ nước Đức', 'Xe cộ', 1),
(20, 'Siêu xe Ferrari F8 Tributo đỏ huyền thoại', 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800', 'Kiệt tác thiết kế siêu xe thể thao nước Ý với khối động cơ tăng áp kép dũng mãnh', 'Xe cộ', 2),
(21, 'Tay cầm chơi game PS4 lơ lửng tối giản', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', 'Concept nhiếp ảnh sáng tạo với tay cầm DualShock 4 màu trắng lơ lửng trên không trung', 'Công nghệ', 3),
(22, 'Góc làm việc lập trình viên công nghệ cao', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 'Bàn làm việc developer tối giản với máy tính xách tay, code và bàn phím cơ', 'Công nghệ', 4),
(23, 'Quả địa cầu công nghệ số kết nối toàn cầu', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', 'Hình nền không gian công nghệ 3D mô phỏng mạng lưới dữ liệu thế giới kết nối thông minh', 'Công nghệ', 5),
(24, 'Vũ trụ huyền bí & Dải ngân hà Nebula', 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800', 'Hình nền thiên văn học tuyệt đẹp với hàng triệu vì sao và tinh vân rực rỡ', 'Công nghệ', 6),
(25, 'Góc gaming phong cách Retro Cyberpunk', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', 'Không gian giải trí đậm chất tương lai với ánh đèn neon tím hồng và màn hình cong sống động', 'Công nghệ', 1),
(26, 'Bàn phím cơ Custom RGB & Chuột công thái học', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'Trang bị bàn làm việc cao cấp giúp nâng cao trải nghiệm gõ phím và hiệu suất làm việc', 'Công nghệ', 2),
(27, 'Bo mạch vi xử lý Chip bán dẫn hiện đại', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', 'Hình ảnh cận cảnh vi mạch điện tử và các linh kiện phần cứng công nghệ vi mô', 'Công nghệ', 3),
(28, 'Ma trận dòng chảy dữ liệu an ninh mạng Matrix', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', 'Hình nền trừu tượng mô phỏng mã nguồn số học và bảo mật an toàn thông tin', 'Công nghệ', 4),
(29, 'Kính thực tế ảo VR khám phá không gian Metaverse', 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800', 'Trải nghiệm thế giới ảo sống động và chân thực với thiết bị kính thực tế ảo thế hệ mới', 'Công nghệ', 5),
(30, 'Laptop công nghệ mỏng nhẹ màn hình tràn viền', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'Thiết bị máy tính xách tay cao cấp dành cho doanh nhân và nhà sáng tạo nội dung', 'Công nghệ', 6),
(31, 'Biển xanh ngọc bích & Bờ cát trắng nhiệt đới', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 'Thiên đường nghỉ dưỡng Maldives với làn nước biển trong vắt và bãi cát trắng mịn màng', 'Thiên nhiên', 1),
(32, 'Tay lướt sóng điêu luyện trên đầu ngọn sóng biển', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800', 'Khoảnh khắc thể thao mạo hiểm lướt sóng biển xanh Thái Bình Dương đầy ngoạn mục', 'Thiên nhiên', 2),
(33, 'Khu rừng nguyên sinh đón tia nắng sớm', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', 'Con đường mòn trong rừng ngập tràn sắc vàng của những tia nắng sớm xuyên qua tán cây', 'Thiên nhiên', 3),
(34, 'Dãy núi Dolomites kỳ vĩ trong nắng chiều', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800', 'Khung cảnh thiên nhiên hùng vĩ với đỉnh núi đá phủ tuyết đỏ rực dưới ánh hoàng hôn', 'Thiên nhiên', 4),
(35, 'Dãy núi tuyết trùng điệp & Bầu trời xanh', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', 'Phong cảnh ngoạn mục của những rặng núi phủ tuyết trắng xóa chạm tới những đám mây', 'Thiên nhiên', 5),
(36, 'Nhiếp ảnh gia săn mây trên đỉnh núi sương mù', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800', 'Hành trình khám phá thiên nhiên hoang dã ghi lại những khoảnh khắc hùng vĩ biển mây', 'Thiên nhiên', 6),
(37, 'Dòng suối và thác nước huyền ảo trong thung lũng', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', 'Dòng chảy thanh khiết của thiên nhiên hoang sơ mang lại cảm giác an yên và mát lành', 'Thiên nhiên', 1),
(38, 'Bình minh rực rỡ trên thung lũng sương mai', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', 'Khoảnh khắc mặt trời thức giấc rải ánh nắng vàng ươm lên biển sương bồng bềnh', 'Thiên nhiên', 2),
(39, 'Vách núi đá sừng sững bên hồ nước ngọc bích', 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800', 'Nước hồ trong xanh soi bóng núi non trùng điệp tạo nên bức tranh thủy mặc tuyệt mỹ', 'Thiên nhiên', 3),
(40, 'Tán cây cổ thụ đón ánh nắng vàng rực rỡ', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800', 'Sức sống mãnh liệt của mẹ thiên nhiên qua vòm lá xanh mướt lung linh trong gió', 'Thiên nhiên', 4),
(41, 'Quán Cà phê phong cách Vintage ấm cúng', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800', 'Không gian quán cafe bình yên với ánh đèn vàng ấm áp và những cuốn sách cổ điển', 'Ẩm thực', 5),
(42, 'Ly Matcha Latte nghệ thuật bên máy tính xách tay', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800', 'Tách matcha thơm ngon với bọt sữa vẽ hoa tinh tế bên góc bàn làm việc sáng tạo', 'Ẩm thực', 6),
(43, 'Xửng hấp há cảo Dimsum Hong Kong nóng hổi', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', 'Những viên há cảo tôm thịt mềm mọng thơm lừng trong xửng tre truyền thống', 'Ẩm thực', 1),
(44, 'Tô Salad ngũ sắc dinh dưỡng Eat Clean', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', 'Món ăn lành mạnh phong phú với bơ tươi, cà chua bi và trứng luộc thơm ngon', 'Ẩm thực', 2),
(45, 'Tô Salad ngũ sắc Poke Bowl tươi ngon', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 'Bữa ăn lành mạnh phong phú dưỡng chất từ cá hồi tươi, đậu nành và rau củ', 'Ẩm thực', 3),
(46, 'Bánh Burger bò phô mai xông khói mọng nước', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'Chiếc burger bò nướng thơm lừng kẹp phô mai cheddar tan chảy hấp dẫn khó cưỡng', 'Ẩm thực', 4),
(47, 'Pizza phô mai nướng củi thơm lừng phong cách Ý', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'Bánh pizza truyền thống Napoli với lớp vỏ giòn rụm và phô mai mozzarella kéo sợi', 'Ẩm thực', 5),
(48, 'Bánh kem sinh nhật Chocolate dâu tây ngọt ngào', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', 'Chiếc bánh ngọt ngào phủ socola ganache bóng mượt trang trí dâu tây tươi mọng', 'Ẩm thực', 6),
(49, 'Tô mì Ramen Nhật Bản nước dùng đậm đà', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', 'Tô mì ramen nóng hổi với thịt xá xíu mềm tan, trứng lòng đào và rong biển giòn ngon', 'Ẩm thực', 1),
(50, 'Kẹo dẻo gấu Haribo sắc màu ngọt ngào', 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800', 'Những viên kẹo dẻo hình gấu phủ đường đủ màu sắc tươi vui và bắt mắt', 'Ẩm thực', 2),
(51, 'Tranh nghệ thuật sơn lỏng trừu tượng đa sắc màu', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800', 'Tác phẩm nghệ thuật màu acrylic lỏng loang màu sắc rực rỡ và hiện đại', 'Nghệ thuật', 3),
(52, 'Nghệ thuật đồ họa 3D Neon Pop Art', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800', 'Tác phẩm thị giác 3D đa chiều với ánh sáng neon rực rỡ ấn tượng', 'Nghệ thuật', 4),
(53, 'Nghệ thuật 3D trừu tượng dải sóng sắc màu', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', 'Đồ họa 3D mềm mại với những đường cong uyển chuyển tone màu tím hoàng hôn', 'Nghệ thuật', 5),
(54, 'Bình gốm sứ thủ công phong cách Wabi Sabi', 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800', 'Nét đẹp mộc mạc tối giản của đồ gốm trang trí nội thất phong cách Nhật Bản', 'Nghệ thuật', 6),
(55, 'Máy ảnh Film cổ điển & Cuốn sổ hành trình', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', 'Những chuyến đi phượt ghi dấu kỷ niệm bằng máy ảnh cơ vintage', 'Nghệ thuật', 1),
(56, 'Bữa tiệc sắc màu rực rỡ phong cách Pastel', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800', 'Concept nhiếp ảnh tiệc mừng sinh nhật với bóng bay nghệ thuật', 'Nghệ thuật', 2),
(57, 'Tác phẩm điêu khắc nghệ thuật đương đại', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800', 'Khối hình điêu khắc tinh xảo với ngôn ngữ tạo hình trừu tượng độc đáo', 'Nghệ thuật', 3),
(58, 'Tranh màu nước vẽ hoa mẫu đơn thanh nhã', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800', 'Tác phẩm hội họa màu nước trong trẻo tái hiện vẻ đẹp tinh khôi của cánh hoa', 'Nghệ thuật', 4),
(59, 'Poster nghệ thuật hình học trừu tượng Bauhaus', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800', 'Thiết kế đồ họa phẳng tối giản kết hợp các khối hình học màu sắc tương phản', 'Nghệ thuật', 5),
(60, 'Tranh sơn dầu tĩnh vật hoa cổ điển ấn tượng', 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=800', 'Phong cách hội họa Phục Hưng với kỹ thuật vẽ sơn dầu đắp nổi sống động', 'Nghệ thuật', 6),
(61, 'Phố cổ Kyoto và tháp chùa Yasaka huyền ảo', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'Khung cảnh cổ kính xứ sở hoa anh đào lung linh trong buổi chiều tà rực rỡ', 'Kiến trúc', 1),
(62, 'Phòng khách phong cách Scandinavian hiện đại', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800', 'Thiết kế nội thất Bắc Âu tràn ngập ánh sáng tự nhiên với tone gỗ mộc và cây xanh', 'Kiến trúc', 2),
(63, 'Biệt thự kính Contemporary sang trọng', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'Kiến trúc biệt thự hiện đại kết hợp vách kính tràn viền và hồ bơi ngoài trời đẳng cấp', 'Kiến trúc', 3),
(64, 'Ghế sofa nhung xanh ngọc bích & Phòng khách tối giản', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 'Thiết kế nội thất phòng khách tinh tế với tone màu xanh emerald quý phái', 'Kiến trúc', 4),
(65, 'Nhà hàng sang trọng với ánh đèn vàng ấm áp', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 'Không gian ẩm thực fine dining đẳng cấp với quầy bar hiện đại và đèn thả trần', 'Kiến trúc', 5),
(66, 'Nến thơm thư giãn không gian ấm cúng', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800', 'Ánh nến lung linh cùng hương tinh dầu tự nhiên tạo cảm giác thư thái trong phòng ngủ', 'Kiến trúc', 6),
(67, 'Góc phòng ngủ ấm áp phong cách Bohemian', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', 'Không gian thư giãn tự do với rèm macrame, nệm êm ái và đèn fairy lights lung linh', 'Kiến trúc', 1),
(68, 'Nhà hát Opera hiện đại với kiến trúc uốn lượn', 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800', 'Công trình kiến trúc công cộng mang tính biểu tượng với những đường cong tương lai', 'Kiến trúc', 2),
(69, 'Tòa nhà chọc trời kính phản chiếu bầu trời xanh', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 'Vẻ đẹp hiện đại hùng vĩ của các tòa nhà trung tâm tài chính đô thị', 'Kiến trúc', 3),
(70, 'Phòng bếp phong cách tối giản với bàn đảo đá marble', 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800', 'Không gian bếp hiện đại tiện nghi với tone màu trắng xám sạch sẽ và thanh lịch', 'Kiến trúc', 4),
(71, 'Giày sneaker New Balance màu xanh rêu phong cách', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800', 'Đôi giày thể thao thời trang đường phố streetwear năng động và cá tính', 'Thời trang', 5),
(72, 'Đôi khuyên tai pha lê xanh hình trái tim', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800', 'Trang sức phụ kiện cao cấp lấp lánh sang trọng tôn vinh nét đẹp tinh tế', 'Thời trang', 6),
(73, 'Cô gái phong cách năng động với áo khoác denim', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800', 'Nụ cười rạng rỡ của bạn nữ trẻ trung trong trang phục đường phố cá tính', 'Thời trang', 1),
(74, 'Bộ sưu tập thời trang mùa thu tone màu be ấm áp', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800', 'Cách phối đồ layer tinh tế với áo dạ len và khăn quàng ấm áp ngày se lạnh', 'Thời trang', 2),
(75, 'Nét đẹp cá tính trong trang phục áo len oversize', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800', 'Phong cách tối giản nhưng đầy cuốn hút với áo len rộng và phụ kiện nhẹ nhàng', 'Thời trang', 3),
(76, 'Người mẫu phong cách thời trang High Fashion sành điệu', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800', 'Bộ cánh thời trang trình diễn cao cấp với đường cắt may táo bạo và màu sắc nổi bật', 'Thời trang', 4),
(77, 'Quần áo vintage trên giá treo phong cách boutique', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800', 'Cửa hàng thời trang cổ điển với những món đồ độc bản mang đậm dấu ấn thời gian', 'Thời trang', 5),
(78, 'Bộ trang điểm son môi và mỹ phẩm cao cấp', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', 'Bộ sản phẩm làm đẹp sang trọng cho quý cô hiện đại tôn vinh vẻ đẹp tự nhiên', 'Thời trang', 6),
(79, 'Thời trang đường phố áo khoác dạ dáng dài thanh lịch', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800', 'Outfit dạo phố thanh lịch mùa đông với áo khoác dạ dài kết hợp boot da sành điệu', 'Thời trang', 1),
(80, 'Bộ trang phục thời trang dạo phố tone đen huyền bí', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800', 'Phong cách All-Black streetwear cực ngầu và thời thượng của giới trẻ Gen Z', 'Thời trang', 2)
ON DUPLICATE KEY UPDATE `ten_hinh` = VALUES(`ten_hinh`), `duong_dan` = VALUES(`duong_dan`), `mo_ta` = VALUES(`mo_ta`), `the_loai` = VALUES(`the_loai`);

-- 6.3 Thêm danh sách Bình luận tương tác qua lại sinh động
INSERT INTO `binh_luan` (`binh_luan_id`, `nguoi_dung_id`, `hinh_id`, `noi_dung`) VALUES
(1, 5, 8, 'amazing, where can I contact you if I want to buy a design?'),
(2, 4, 8, 'Thank you! You can check the bio link to order custom prints on Threadless!'),
(3, 2, 1, 'Trông chú cún ngầu thực sự bạn ơi, xin giống với!'),
(4, 3, 1, 'Kính râm mua ở shop nào vậy ạ, cho mình xin link mua cho bé nhà mình với :D'),
(5, 1, 1, 'Mình mua trên sàn cam đó bạn ơi, gõ kính thú cưng là ra liền nè!'),
(6, 1, 6, 'Meme mèo này bất hủ luôn rồi haha, nhìn cái miệng hài xỉu'),
(7, 2, 6, 'Hú leeeeeee! Lưu về làm meme gửi bạn bè ngay và luôn'),
(8, 6, 2, 'Tone màu của tranh trừu tượng này phối sang trọng và ấm cúng thật sự'),
(9, 3, 4, 'Đã cài làm hình nền khóa màn hình, đứa nào đụng vào cũng phì cười'),
(10, 5, 11, 'Đường nét vẽ tối giản nhưng rất có hồn và chiều sâu nghệ thuật'),
(11, 1, 29, 'Chiếc sofa màu xanh ngọc bích này đặt vào phòng khách nhìn sang hẳn căn nhà luôn!'),
(12, 3, 32, 'Màu nước biển Maldives trong xanh ngắt nhìn mê quá chừng'),
(13, 2, 35, 'Góc setup nhìn gọn gàng và truyền cảm hứng làm việc code cả ngày không chán')
ON DUPLICATE KEY UPDATE `noi_dung` = VALUES(`noi_dung`);

-- 6.4 Thêm danh sách Lưu ảnh (Lượt ghim ảnh yêu thích)
INSERT INTO `luu_anh` (`nguoi_dung_id`, `hinh_id`) VALUES
(1, 3), (1, 6), (1, 8), (1, 10), (1, 11), (1, 12), (1, 13), (1, 16), (1, 19), (1, 23), (1, 29), (1, 35),
(2, 1), (2, 2), (2, 8), (2, 9), (2, 15), (2, 17), (2, 20), (2, 26), (2, 30), (2, 36),
(3, 1), (3, 2), (3, 5), (3, 8), (3, 11), (3, 14), (3, 18), (3, 24), (3, 31), (3, 37),
(4, 2), (4, 11), (4, 13), (4, 19), (4, 25), (4, 32), (4, 38),
(5, 1), (5, 8), (5, 9), (5, 12), (5, 20), (5, 26), (5, 33),
(6, 1), (6, 3), (6, 8), (6, 9), (6, 15), (6, 21), (6, 27), (6, 34)
ON DUPLICATE KEY UPDATE `ngay_luu` = CURRENT_TIMESTAMP;

