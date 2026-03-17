import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';

config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const conn = await createConnection(dbUrl);

// Create products table (TiDB compatible)
const createTable = [
  'CREATE TABLE IF NOT EXISTS `products` (',
  '  `id` int AUTO_INCREMENT NOT NULL,',
  '  `name` varchar(255) NOT NULL,',
  '  `nameEn` varchar(255) DEFAULT \'\',',
  '  `category` enum(\'gifts\',\'shields\',\'catering\',\'occasions\',\'calligraphy\') NOT NULL,',
  '  `price` varchar(100) NOT NULL,',
  '  `priceValue` decimal(10,2) DEFAULT \'0\',',
  '  `priceNote` varchar(100),',
  '  `image` text NOT NULL,',
  '  `badge` varchar(50),',
  '  `badgeColor` varchar(20),',
  '  `description` text NOT NULL,',
  '  `rating` int NOT NULL DEFAULT 5,',
  '  `inStock` boolean NOT NULL DEFAULT true,',
  '  `tags` text NULL,',
  '  `sortOrder` int NOT NULL DEFAULT 0,',
  '  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,',
  '  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,',
  '  CONSTRAINT `products_id` PRIMARY KEY(`id`)',
  ')'
].join('\n');

try {
  await conn.execute(createTable);
  console.log('✓ Products table created (or already exists)');
} catch (e) {
  console.error('✗ Error creating table:', e.message);
  await conn.end();
  process.exit(1);
}

// Check if already seeded
const [rows] = await conn.execute('SELECT COUNT(*) as count FROM `products`');
const count = rows[0].count;

if (count > 0) {
  console.log(`✓ Products table already has ${count} rows, skipping seed`);
  await conn.end();
  process.exit(0);
}

// Seed with catalog data
const products = [
  ['دزة الورود الفاخرة', 'Luxury Rose Dazza', 'gifts', 'من 45 د.ك', 45.00, 'حسب الحجم', 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_dazza_display_d7fb14b3.webp', 'الأكثر طلباً', '#C9A84C', 'دزة ورود طبيعية فاخرة مع تغليف مخصص وبطاقة إهداء بالخط العربي', 5, 1, '["أفراح","هدايا","رمضان"]', 1],
  ['بوكس هبّة رمضان', 'Ramadan Gift Box', 'gifts', 'من 25 د.ك', 25.00, 'يشمل التوصيل', 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_ramadan_cups_b30ce7d6.jpg', 'موسمي', '#1a6b3c', 'صندوق هدايا رمضاني فاخر يحتوي على تمور وشوكولاتة وعطور مختارة', 5, 1, '["رمضان","هدايا"]', 2],
  ['بوكس الخضرة الفاخر', 'Luxury Green Gift Box', 'gifts', 'من 35 د.ك', 35.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_green_box_e70d62fd.webp', null, null, 'صندوق هدايا أخضر فاخر مزين بالزهور والشرائط الذهبية — مثالي للأفراح والمناسبات', 4, 1, '["أفراح","هدايا","عيد"]', 3],
  ['بوكسات البراند المخصصة', 'Custom Brand Boxes', 'gifts', 'من 8 د.ك / قطعة', 8.00, 'بالجملة متاح', 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_boxes_12e0ff8e.jpg', 'شركات', '#2563eb', 'صناديق هدايا مخصصة بشعار شركتك وألوانك — مثالية للفعاليات المؤسسية', 5, 1, '["شركات","هدايا","مخصص"]', 4],
  ['هدية الورود المجففة', 'Dried Flowers Gift', 'gifts', 'من 18 د.ك', 18.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_dazza_display_d7fb14b3.webp', null, null, 'ترتيب فني للورود المجففة مع تغليف فاخر — تدوم لسنوات كذكرى جميلة', 4, 1, '["هدايا","ديكور"]', 5],
  ['هدية الفطر الفاخرة', 'Eid Premium Gift', 'gifts', 'من 30 د.ك', 30.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_eid_engraving_e4c56a13.jpg', 'عيد', '#7c3aed', 'مجموعة هدايا عيد الفطر الفاخرة مع تغليف ذهبي وبطاقة تهنئة مخطوطة', 5, 1, '["عيد","هدايا"]', 6],
  ['درع التكريم الذهبي', 'Gold Honor Shield', 'shields', 'من 22 د.ك', 22.00, 'يشمل النقش', 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product6_de1b84b3.jpg', 'الأكثر مبيعاً', '#C9A84C', 'درع تكريم ذهبي فاخر بنقش ليزر دقيق — مثالي للمدارس والشركات والجهات الحكومية', 5, 1, '["شركات","مدارس","تكريم"]', 7],
  ['درع الكريستال الفاخر', 'Crystal Luxury Shield', 'shields', 'من 35 د.ك', 35.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_boxes_12e0ff8e.jpg', null, null, 'درع كريستال شفاف مع قاعدة خشبية فاخرة ونقش ذهبي — للمناسبات الرسمية الكبرى', 5, 1, '["شركات","حكومة","تكريم"]', 8],
  ['درع الخط العربي', 'Arabic Calligraphy Shield', 'shields', 'من 28 د.ك', 28.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_eid_engraving_e4c56a13.jpg', 'حصري', '#b91c1c', 'درع مميز بخط عربي أصيل منقوش بالليزر — تصميم حصري لكل مناسبة', 5, 1, '["تكريم","مخصص","فن"]', 9],
  ['درع الشركات المؤسسي', 'Corporate Shield', 'shields', 'من 18 د.ك', 18.00, 'خصم للكميات', 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_green_box_e70d62fd.webp', null, null, 'درع مؤسسي بشعار الشركة وبيانات الموظف — مثالي لحفلات التخرج والتكريم', 4, 1, '["شركات","تكريم","جملة"]', 10],
  ['ستاند الكيترنج الفاخر', 'Luxury Catering Stand', 'catering', 'تواصل للسعر', 0.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_booth_stand_79e2e9ef.webp', 'خدمة كاملة', '#C9A84C', 'ستاند كيترنج مجهز بالكامل مع طاقم خدمة محترف — للأفراح والفعاليات الكبرى', 5, 1, '["أفراح","فعاليات","شركات"]', 11],
  ['بوث العيد الوطني', 'National Day Booth', 'catering', 'تواصل للسعر', 0.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_booth_stand_a9bad866.jpg', 'وطني', '#1a6b3c', 'بوث احتفالي بالألوان الوطنية الكويتية — مجهز للفعاليات والمدارس والشركات', 5, 1, '["وطني","فعاليات","مدارس"]', 12],
  ['طاولة الضيافة الفاخرة', 'Luxury Hospitality Table', 'catering', 'من 120 د.ك', 120.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_ramadan_cups_b30ce7d6.jpg', null, null, 'طاولة ضيافة مجهزة بالكامل مع مفارش فاخرة وأدوات تقديم ذهبية', 4, 1, '["أفراح","استقبالات"]', 13],
  ['تجهيزات قرقيعان 2026', 'Qargian 2026', 'occasions', 'من 15 د.ك', 15.00, 'للطفل الواحد', 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_qargian_2026_532a544d.webp', '2026', '#C9A84C', 'حقيبة قرقيعان مميزة بتصميم حصري لعام 2026 مع حلويات وألعاب مختارة', 5, 1, '["قرقيعان","أطفال","موسمي"]', 14],
  ['باقة تخرج الذكريات', 'Graduation Memory Package', 'occasions', 'من 40 د.ك', 40.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product10_077fb0b4.jpg', null, null, 'باقة تخرج شاملة: درع + بوكس هدايا + بطاقة تهنئة بالخط العربي', 5, 1, '["تخرج","هدايا","تكريم"]', 15],
  ['لوحة الخط بالخيوط', 'Thread Calligraphy Art', 'calligraphy', 'من 55 د.ك', 55.00, null, 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product11_5a30bbf2.jpg', 'فن حصري', '#b91c1c', 'لوحة فنية بالخط العربي منفذة بالخيوط الملونة على خلفية داكنة — قطعة فنية فريدة', 5, 1, '["فن","ديكور","هدايا"]', 16],
  ['نقش ليزر مخصص', 'Custom Laser Engraving', 'calligraphy', 'من 12 د.ك', 12.00, 'حسب الحجم', 'https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product6_de1b84b3.jpg', null, null, 'نقش ليزر دقيق على الخشب أو المعدن أو الكريستال — أي نص أو شعار تريده', 5, 1, '["نقش","مخصص","هدايا"]', 17],
];

const insertSql = 'INSERT INTO `products` (name, nameEn, category, price, priceValue, priceNote, image, badge, badgeColor, description, rating, inStock, tags, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

for (const p of products) {
  try {
    await conn.execute(insertSql, p);
    console.log(`✓ Inserted: ${p[0]}`);
  } catch (e) {
    console.error(`✗ Error inserting ${p[0]}:`, e.message);
  }
}

await conn.end();
console.log(`\n✅ Seeded ${products.length} products successfully!`);
