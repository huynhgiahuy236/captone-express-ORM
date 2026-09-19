import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '12345',
    database: 'db_capstone_pinterest',
    charset: 'utf8mb4'
  });

  console.log('Connected to MySQL database...');

  // Set connection charset
  await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
  await connection.query('ALTER DATABASE `db_capstone_pinterest` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

  // Convert tables to utf8mb4
  const tables = ['nguoi_dung', 'hinh_anh', 'binh_luan', 'luu_anh'];
  for (const table of tables) {
    console.log(`Converting table ${table} to utf8mb4...`);
    await connection.query(`ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  }

  // Update all comments with proper UTF-8 Vietnamese strings
  const comments = [
    { id: 1, text: 'amazing, where can I contact you if I want to buy a design?' },
    { id: 2, text: 'Thank you! You can check the bio link to order custom prints on Threadless!' },
    { id: 3, text: 'Trông chú cún ngầu thực sự bạn ơi, xin giống với!' },
    { id: 4, text: 'Kính râm mua ở shop nào vậy ạ, cho mình xin link mua cho bé nhà mình với :D' },
    { id: 5, text: 'Mình mua trên sàn cam đó bạn ơi, gõ kính thú cưng là ra liền nè!' },
    { id: 6, text: 'Meme mèo này bất hủ luôn rồi haha, nhìn cái miệng hài xỉu' },
    { id: 7, text: 'Hú leeeeeee! Lưu về làm meme gửi bạn bè ngay và luôn' },
    { id: 8, text: 'Tone màu của tranh trừu tượng này phối sang trọng và ấm cúng thật sự' },
    { id: 9, text: 'Đã cài làm hình nền khóa màn hình, đứa nào đụng vào cũng phì cười' },
    { id: 10, text: 'Đường nét vẽ tối giản nhưng rất có hồn và chiều sâu nghệ thuật' },
    { id: 11, text: 'Chiếc sofa màu xanh ngọc bích này đặt vào phòng khách nhìn sang hẳn căn nhà luôn!' },
    { id: 12, text: 'Màu nước biển Maldives trong xanh ngắt nhìn mê quá chừng' },
    { id: 13, text: 'Góc setup nhìn gọn gàng và truyền cảm hứng làm việc code cả ngày không chán' }
  ];

  for (const c of comments) {
    await connection.query('UPDATE `binh_luan` SET `noi_dung` = ? WHERE `binh_luan_id` = ?', [c.text, c.id]);
    console.log(`Updated comment #${c.id}: ${c.text}`);
  }

  // Fetch comments to verify
  const [rows] = await connection.query('SELECT binh_luan_id, noi_dung FROM binh_luan ORDER BY binh_luan_id ASC');
  console.log('\n--- VERIFIED COMMENTS IN DATABASE ---');
  for (const r of rows) {
    console.log(`#${r.binh_luan_id}: ${r.noi_dung}`);
  }

  await connection.end();
}

main().catch(err => {
  console.error('Error fixing UTF8:', err);
  process.exit(1);
});
