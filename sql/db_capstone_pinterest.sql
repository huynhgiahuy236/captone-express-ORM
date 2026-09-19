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

-- 6.2 Thêm danh sách Hình ảnh phong phú (38 ảnh chuẩn khớp 100% hình ảnh thực tế)
INSERT INTO `hinh_anh` (`hinh_id`, `ten_hinh`, `duong_dan`, `mo_ta`, `the_loai`, `nguoi_dung_id`) VALUES
(1, 'Chú chó French Bulldog áo vàng phong cách', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', 'Chú cún thời trang với biểu cảm cực ngầu trong chiếc áo len vàng nổi bật', 'Thú cưng', 1),
(2, 'Tranh nghệ thuật sơn lỏng trừu tượng đa sắc màu', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800', 'Tác phẩm nghệ thuật màu acrylic lỏng loang màu sắc rực rỡ và hiện đại', 'Nghệ thuật', 1),
(3, 'Nghệ thuật đồ họa 3D Neon Pop Art', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800', 'Tác phẩm thị giác 3D đa chiều với ánh sáng neon rực rỡ ấn tượng', 'Nghệ thuật', 2),
(4, 'Siêu xe Nissan GT-R trên cung đường hoàng hôn', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', 'Chiến mã thể thao Nissan GT-R dũng mãnh lăn bánh trên cung đường tuyệt đẹp trong ánh hoàng hôn rực rỡ', 'Xe cộ', 3),
(5, 'Chú cún Corgi cười híp mắt', 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800', 'Bức ảnh chân dung cún cưng ngộ nghĩnh đáng yêu cười toe toét', 'Thú cưng', 2),
(6, 'Chú mèo mắt tròn ngơ ngác đáng yêu', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'Khoảnh khắc hài hước của chú mèo cưng với đôi mắt to tròn ngơ ngác', 'Thú cưng', 3),
(7, 'Kẹo dẻo gấu Haribo sắc màu ngọt ngào', 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800', 'Những viên kẹo dẻo hình gấu phủ đường đủ màu sắc tươi vui và bắt mắt', 'Ẩm thực', 3),
(8, 'Giày sneaker New Balance màu xanh rêu phong cách', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800', 'Đôi giày thể thao thời trang đường phố streetwear năng động và cá tính', 'Thời trang', 4),
(9, 'Quả địa cầu công nghệ số kết nối toàn cầu', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', 'Hình nền không gian công nghệ 3D mô phỏng mạng lưới dữ liệu thế giới', 'Công nghệ', 4),
(10, 'Đôi khuyên tai pha lê xanh hình trái tim', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800', 'Trang sức phụ kiện cao cấp lấp lánh sang trọng tôn vinh nét đẹp tinh tế', 'Thời trang', 3),
(11, 'Nghệ thuật 3D trừu tượng dải sóng sắc màu', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', 'Đồ họa 3D mềm mại với những đường cong uyển chuyển tone màu tím hoàng hôn', 'Nghệ thuật', 5),
(12, 'Vũ trụ huyền bí & Dải ngân hà Nebula', 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800', 'Hình nền thiên văn học tuyệt đẹp với hàng triệu vì sao và tinh vân rực rỡ', 'Công nghệ', 6),
(13, 'Tay cầm chơi game PS4 lơ lửng tối giản', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', 'Concept nhiếp ảnh sáng tạo với tay cầm DualShock 4 màu trắng lơ lửng trên không trung', 'Công nghệ', 5),
(14, 'Chú cún ngộ nghĩnh quấn khăn len mùa đông', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800', 'Biểu cảm đáng yêu của cún cưng đeo kính quấn khăn len ấm áp ngày đông', 'Thú cưng', 1),
(15, 'Dãy núi Dolomites kỳ vĩ trong nắng chiều', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800', 'Khung cảnh thiên nhiên hùng vĩ với đỉnh núi đá phủ tuyết đỏ rực dưới hoàng hôn', 'Thiên nhiên', 6),
(16, 'Quán Cà phê phong cách Vintage ấm cúng', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800', 'Không gian quán cafe bình yên với ánh đèn vàng ấm áp và những cuốn sách cổ', 'Ẩm thực', 1),
(17, 'Bình gốm sứ thủ công phong cách Wabi Sabi', 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800', 'Nét đẹp mộc mạc tối giản của đồ gốm trang trí nội thất phong cách Nhật Bản', 'Nghệ thuật', 2),
(18, 'Chú chó Golden Retriever biểu cảm hài hước', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', 'Khoảnh khắc tinh nghịch liếm mũi siêu đáng yêu của chú chó Golden', 'Thú cưng', 3),
(19, 'Phố cổ Kyoto và tháp chùa Yasaka huyền ảo', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'Khung cảnh cổ kính xứ sở hoa anh đào lung linh trong buổi chiều tà rực rỡ', 'Kiến trúc', 4),
(20, 'Phòng khách phong cách Scandinavian hiện đại', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800', 'Thiết kế nội thất Bắc Âu tràn ngập ánh sáng tự nhiên với tone gỗ mộc', 'Kiến trúc', 5),
(21, 'Máy ảnh Film cổ điển & Cuốn sổ hành trình', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', 'Những chuyến đi phượt ghi dấu kỷ niệm bằng máy ảnh cơ vintage', 'Nghệ thuật', 6),
(22, 'Ly Matcha Latte nghệ thuật bên máy tính xách tay', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800', 'Tách matcha thơm ngon với bọt sữa vẽ hoa tinh tế bên góc bàn làm việc', 'Ẩm thực', 1),
(23, 'Tay lướt sóng điêu luyện trên đầu ngọn sóng', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800', 'Khoảnh khắc thể thao mạo hiểm lướt sóng biển xanh Thái Bình Dương', 'Thiên nhiên', 2),
(24, 'Biệt thự kính Contemporary sang trọng', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'Kiến trúc biệt thự hiện đại kết hợp vách kính tràn viền và hồ bơi ngoài trời', 'Kiến trúc', 3),
(25, 'Khu rừng nguyên sinh đón tia nắng sớm', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', 'Con đường mòn trong rừng ngập tràn sắc vàng của những tia nắng sớm', 'Thiên nhiên', 4),
(26, 'Siêu xe thể thao Porsche 911 Classic', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'Huyền thoại xe hơi thể thao phong cách retro đầy uy lực', 'Xe cộ', 5),
(27, 'Dãy núi tuyết trùng điệp & Bầu trời xanh', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', 'Phong cảnh ngoạn mục của những rặng núi phủ tuyết trắng xóa', 'Thiên nhiên', 6),
(28, 'Nến thơm thư giãn không gian ấm cúng', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800', 'Ánh nến lung linh cùng hương tinh dầu tự nhiên tạo cảm giác thư thái', 'Kiến trúc', 1),
(29, 'Ghế sofa nhung xanh ngọc bích & Phòng khách tối giản', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 'Thiết kế nội thất phòng khách tinh tế với tone màu xanh emerald quý phái', 'Kiến trúc', 1),
(30, 'Nhà hàng sang trọng với ánh đèn vàng ấm áp', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 'Không gian ẩm thực fine dining đẳng cấp với quầy bar hiện đại', 'Ẩm thực', 2),
(31, 'Bữa tiệc sắc màu rực rỡ phong cách Pastel', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800', 'Concept nhiếp ảnh tiệc mừng sinh nhật với bóng bay nghệ thuật', 'Nghệ thuật', 3),
(32, 'Biển xanh ngọc bích & Bờ cát trắng nhiệt đới', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 'Thiết kế thiên đường nghỉ dưỡng Maldives với làn nước biển trong vắt', 'Thiên nhiên', 4),
(33, 'Tô Salad ngũ sắc dinh dưỡng Eat Clean', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', 'Món ăn lành mạnh phong phú với bơ tươi, cà chua bi và trứng luộc', 'Ẩm thực', 5),
(34, 'Cô gái phong cách năng động với áo khoác denim', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800', 'Nụ cười rạng rỡ của bạn nữ trẻ trung trong trang phục đường phố cá tính', 'Thời trang', 6),
(35, 'Góc làm việc lập trình viên công nghệ cao', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 'Bàn làm việc developer tối giản với máy tính xách tay và bàn phím cơ', 'Công nghệ', 1),
(36, 'Nhiếp ảnh gia săn mây trên đỉnh núi sương mù', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800', 'Hành trình khám phá thiên nhiên hoang dã ghi lại những khoảnh khắc hùng vĩ', 'Thiên nhiên', 2),
(37, 'Xửng hấp há cảo Dimsum Hong Kong nóng hổi', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', 'Những viên há cảo tôm thịt mềm mọng thơm lừng trong xửng tre truyền thống', 'Ẩm thực', 3),
(38, 'Tô Salad ngũ sắc Poke Bowl tươi ngon', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 'Bữa ăn lành mạnh phong phú dưỡng chất từ cá hồi, đậu nành và rau củ tươi', 'Ẩm thực', 4)
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

