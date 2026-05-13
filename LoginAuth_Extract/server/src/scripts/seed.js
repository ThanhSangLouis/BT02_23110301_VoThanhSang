const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../../.env.development' });

const Category = require('../modules/category/category.model');
const Product = require('../modules/product/product.model');
const Promotion = require('../modules/promotion/promotion.model');
const News = require('../modules/news/news.model');

const categories = [
  { name: 'Văn học', slug: 'van-hoc', description: 'Tiểu thuyết, truyện ngắn, thơ, văn học Việt Nam và thế giới', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', order: 1 },
  { name: 'Kinh tế', slug: 'kinh-te', description: 'Sách kinh doanh, tài chính, đầu tư và quản trị', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', order: 2 },
  { name: 'Thiếu nhi', slug: 'thieu-nhi', description: 'Sách tranh, truyện cổ tích, sách giáo dục cho trẻ em', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', order: 3 },
  { name: 'CNTT', slug: 'cntt', description: 'Lập trình, công nghệ thông tin, AI và khoa học máy tính', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400', order: 4 },
  { name: 'Ngoại ngữ', slug: 'ngoai-ngu', description: 'Tiếng Anh, tiếng Nhật, tiếng Trung và các ngôn ngữ khác', image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', order: 5 },
];

const products = [
  // Văn học
  {
    name: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
    slug: 'tuoi-tre-dang-gia-bao-nhieu',
    author: 'Rosie Nguyễn',
    publisher: 'NXB Trẻ',
    price: 79000,
    salePrice: 63200,
    stockQuantity: 150,
    soldQuantity: 89,
    description: 'Tuổi trẻ không phải là khoảng thời gian để câu nói thả thính, mà là khoảng thời gian để tạo nên giá trị. Đây là cuốn sách viết về những trải nghiệm, những bài học và những suy ngẫm trong quá trình sống và làm việc của tác giả.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800',
    ],
    publishYear: 2023,
    pages: 280,
    isNew: true,
    isFeatured: true,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 234,
  },
  {
    name: 'Nhà Giả Kim',
    slug: 'nha-gia-kim',
    author: 'Paulo Coelho',
    publisher: 'NXB Hội Nhà Văn',
    price: 85000,
    salePrice: null,
    stockQuantity: 200,
    soldQuantity: 156,
    description: 'Nhà Giả Kim là một tiểu thuyết của nhà văn Brazil Paulo Coelho, xuất bản lần đầu năm 1988. Cuốn sách kể về hành trình của một chàng trai chăn cừu tên Santiago đi tìm kho báu ở Ai Cập.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    ],
    publishYear: 2022,
    pages: 208,
    isNew: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 567,
  },
  {
    name: 'Harry Potter và Hòn Đá Phù Thủy',
    slug: 'harry-potter-va-hon-da-phu-thuy',
    author: 'J.K. Rowling',
    publisher: 'NXB Trẻ',
    price: 150000,
    salePrice: 120000,
    stockQuantity: 100,
    soldQuantity: 234,
    description: 'Harry Potter và Hòn Đá Phù Thủy là cuốn sách đầu tiên trong bộ truyện Harry Potter nổi tiếng. Câu chuyện kể về cậu bé Harry Potter phát hiện mình là một phù thủy và được nhận vào trường Hogwarts.',
    coverImage: 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=600',
    images: [
      'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=800',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    ],
    publishYear: 2021,
    pages: 384,
    isNew: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 890,
  },
  // Kinh tế
  {
    name: 'Khởi Nghiệp Từ Số 0',
    slug: 'khoi-nghiep-tu-so-0',
    author: 'Đỗ Neville',
    publisher: 'First News',
    price: 99000,
    salePrice: 79200,
    stockQuantity: 120,
    soldQuantity: 67,
    description: 'Cuốn sách chia sẻ những kinh nghiệm thực tế về việc khởi nghiệp từ con số 0, từ việc tìm ý tưởng, xây dựng đội ngũ cho đến việc huy động vốn và mở rộng kinh doanh.',
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
    images: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    ],
    publishYear: 2023,
    pages: 320,
    isNew: true,
    isFeatured: true,
    isBestseller: false,
    rating: 4.6,
    reviewCount: 123,
  },
  {
    name: 'Nghĩ Lớn và Dám Thất Bại',
    slug: 'nghi-lon-va-dang-that-bai',
    author: 'Richard Branson',
    publisher: 'NXB Lao Động',
    price: 139000,
    salePrice: null,
    stockQuantity: 80,
    soldQuantity: 45,
    description: 'Cuốn sách là những câu chuyện có thật từ Richard Branson về cách ông xây dựng Virgin Group từ một tạp chí nhỏ trở thành một đế chế kinh doanh toàn cầu.',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    ],
    publishYear: 2022,
    pages: 416,
    isNew: false,
    isFeatured: false,
    isBestseller: true,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    name: 'Bí Quyết Đầu Tư Warren Buffett',
    slug: 'bi-quyet-dau-tu-warren-buffett',
    author: 'Robert Hagstrom',
    publisher: 'NXB Tài Chính',
    price: 165000,
    salePrice: 132000,
    stockQuantity: 60,
    soldQuantity: 34,
    description: 'Khám phá chiến lược đầu tư của huyền thoại Warren Buffett, người được mệnh danh là "nhà tiên tri xứ Omaha". Cuốn sách phân tích các nguyên tắc đầu tư giá trị đã giúp Buffett tạo dựng khối tài sản khổng lồ.',
    coverImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600',
    images: [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    ],
    publishYear: 2021,
    pages: 350,
    isNew: false,
    isFeatured: true,
    isBestseller: false,
    rating: 4.8,
    reviewCount: 156,
  },
  // Thiếu nhi
  {
    name: 'Doraemon Đặc Biệt - Tập 1',
    slug: 'doraemon-dac-biet-tap-1',
    author: 'Fujiko F. Fujio',
    publisher: 'Kim Đồng',
    price: 35000,
    salePrice: null,
    stockQuantity: 300,
    soldQuantity: 234,
    description: 'Tập truyện đặc biệt về chú mèo máy Doraemon với những câu chuyện hấp dẫn, mang tính giáo dục cao, phù hợp với lứa tuổi thiếu nhi.',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600',
    images: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    ],
    publishYear: 2023,
    pages: 120,
    isNew: true,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 456,
  },
  {
    name: 'Cổ Tích Việt Nam - Tập 1',
    slug: 'co-tich-viet-nam-tap-1',
    author: 'Nhiều tác giả',
    publisher: 'NXB Giáo Dục',
    price: 45000,
    salePrice: 36000,
    stockQuantity: 180,
    soldQuantity: 98,
    description: 'Tuyển chọn các câu chuyện cổ tích Việt Nam hay nhất, giúp trẻ em hiểu thêm về văn hóa và truyền thống dân tộc.',
    coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600',
    images: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
    ],
    publishYear: 2022,
    pages: 80,
    isNew: false,
    isFeatured: false,
    isBestseller: true,
    rating: 4.7,
    reviewCount: 234,
  },
  // CNTT
  {
    name: 'JavaScript: The Good Parts',
    slug: 'javascript-the-good-parts',
    author: 'Douglas Crockford',
    publisher: "O'Reilly",
    price: 195000,
    salePrice: 156000,
    stockQuantity: 50,
    soldQuantity: 28,
    description: 'Cuốn sách kinh điển về JavaScript, tập trung vào những phần tốt nhất của ngôn ngữ mà bạn nên sử dụng để viết code chất lượng cao.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    ],
    publishYear: 2021,
    pages: 176,
    isNew: false,
    isFeatured: true,
    isBestseller: false,
    rating: 4.5,
    reviewCount: 67,
  },
  {
    name: 'Clean Code - Robert C. Martin',
    slug: 'clean-code-robert-c-martin',
    author: 'Robert C. Martin',
    publisher: 'Prentice Hall',
    price: 285000,
    salePrice: null,
    stockQuantity: 40,
    soldQuantity: 56,
    description: 'Cuốn sách kinh điển về lập trình sạch, hướng dẫn cách viết code dễ đọc, dễ bảo trì và có thể mở rộng.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    ],
    publishYear: 2020,
    pages: 464,
    isNew: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 189,
  },
  {
    name: 'React - The Complete Guide',
    slug: 'react-the-complete-guide',
    author: 'Academind',
    publisher: 'Packt Publishing',
    price: 350000,
    salePrice: 280000,
    stockQuantity: 35,
    soldQuantity: 23,
    description: 'Hướng dẫn toàn diện về React, từ cơ bản đến nâng cao, bao gồm React Hooks, Redux, React Router và các best practices.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
    images: [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    ],
    publishYear: 2023,
    pages: 750,
    isNew: true,
    isFeatured: true,
    isBestseller: false,
    rating: 4.7,
    reviewCount: 45,
  },
  // Ngoại ngữ
  {
    name: 'English Grammar in Use',
    slug: 'english-grammar-in-use',
    author: 'Raymond Murphy',
    publisher: 'Cambridge University Press',
    price: 250000,
    salePrice: 200000,
    stockQuantity: 100,
    soldQuantity: 78,
    description: 'Cuốn sách ngữ pháp tiếng Anh nổi tiếng nhất thế giới, phù hợp cho người học ở mọi trình độ.',
    coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600',
    images: [
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
    ],
    publishYear: 2022,
    pages: 400,
    isNew: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 345,
  },
  {
    name: 'Minna no Nihongo Shokyuu',
    slug: 'minna-no-nihongo-shokyuu',
    author: '3A Corporation',
    publisher: '3A Corporation',
    price: 180000,
    salePrice: 144000,
    stockQuantity: 90,
    soldQuantity: 45,
    description: 'Bộ sách học tiếng Nhật sơ cấp phổ biến nhất, được sử dụng rộng rãi tại các trường đại học và trung tâm ngoại ngữ.',
    coverImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600',
    images: [
      'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800',
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
    ],
    publishYear: 2021,
    pages: 320,
    isNew: false,
    isFeatured: false,
    isBestseller: false,
    rating: 4.8,
    reviewCount: 178,
  },
  // Thêm nhiều sản phẩm hơn
  {
    name: 'Đắc Nhân Tâm',
    slug: 'dac-nhan-tam',
    author: 'Dale Carnegie',
    publisher: 'NXB Tổng Hợp',
    price: 95000,
    salePrice: 76000,
    stockQuantity: 250,
    soldQuantity: 189,
    description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và thuyết phục người khác, giúp bạn thành công trong cuộc sống và sự nghiệp.',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600',
    images: [
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    ],
    publishYear: 2023,
    pages: 320,
    isNew: true,
    isFeatured: true,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 567,
  },
  {
    name: 'Tư Duy Nhanh và Chậm',
    slug: 'tu-duy-nhanh-va-cham',
    author: 'Daniel Kahneman',
    publisher: 'NXB Tri Thức',
    price: 225000,
    salePrice: 180000,
    stockQuantity: 70,
    soldQuantity: 34,
    description: 'Nobel kinh tế Daniel Kahneman giải thích hai hệ thống tư duy trong não người và cách chúng ảnh hưởng đến quyết định của chúng ta.',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
    images: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    ],
    publishYear: 2022,
    pages: 512,
    isNew: false,
    isFeatured: true,
    isBestseller: false,
    rating: 4.7,
    reviewCount: 123,
  },
  {
    name: 'Sapiens - Lược Sử Loài Người',
    slug: 'sapiens-luoc-su-loai-nguoi',
    author: 'Yuval Noah Harari',
    publisher: 'NXB Thế Giới',
    price: 265000,
    salePrice: null,
    stockQuantity: 85,
    soldQuantity: 67,
    description: 'Một cuốn sách phi hư cấu thú vị về lịch sử loài người từ thuở hồng hoang đến hiện tại.',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
    images: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    ],
    publishYear: 2021,
    pages: 528,
    isNew: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 234,
  },
  {
    name: 'Python Crash Course',
    slug: 'python-crash-course',
    author: 'Eric Matthes',
    publisher: 'No Starch Press',
    price: 295000,
    salePrice: 236000,
    stockQuantity: 45,
    soldQuantity: 32,
    description: 'Khóa học Python cơ bản đến trung cấp, phù hợp cho người mới bắt đầu học lập trình.',
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600',
    images: [
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    ],
    publishYear: 2023,
    pages: 544,
    isNew: true,
    isFeatured: true,
    isBestseller: false,
    rating: 4.6,
    reviewCount: 56,
  },
  {
    name: 'Machine Learning Yearning',
    slug: 'machine-learning-yearning',
    author: 'Andrew Ng',
    publisher: 'DeepLearning.AI',
    price: 0,
    salePrice: null,
    stockQuantity: 9999,
    soldQuantity: 0,
    description: 'Cuốn sách miễn phí của Andrew Ng về chiến lược kỹ thuật trong Machine Learning.',
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600',
    images: [
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    ],
    publishYear: 2022,
    pages: 118,
    isNew: false,
    isFeatured: true,
    isBestseller: false,
    rating: 4.8,
    reviewCount: 234,
  },
  {
    name: 'Giải Thích Về Trái Tim',
    slug: 'giai-thich-ve-trai-tim',
    author: 'Minh Niệm',
    publisher: 'First News',
    price: 85000,
    salePrice: 68000,
    stockQuantity: 120,
    soldQuantity: 78,
    description: 'Một cuốn sách về triết học và cách sống, giúp bạn hiểu về bản thân và cuộc sống.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    ],
    publishYear: 2023,
    pages: 256,
    isNew: true,
    isFeatured: false,
    isBestseller: false,
    rating: 4.5,
    reviewCount: 89,
  },
  {
    name: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
    slug: 'cho-toi-xin-mot-ve-di-tuoi-tho',
    author: 'Nguyễn Nhật Ánh',
    publisher: 'NXB Trẻ',
    price: 78000,
    salePrice: 62400,
    stockQuantity: 200,
    soldQuantity: 145,
    description: 'Một cuốn sách đầy hoài bão và ký ức về tuổi thơ, viết bởi nhà văn được yêu thích nhất Việt Nam.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    ],
    publishYear: 2022,
    pages: 300,
    isNew: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 456,
  },
];

const promotions = [
  {
    title: 'Khuyến Mãi Mùa Hè - Giảm Đến 50%',
    slug: 'khuyen-mai-mua-he-2024',
    description: 'Ưu đãi mùa hè sôi động, giảm giá lên đến 50% cho tất cả sách văn học và kinh tế.',
    discountPercent: 50,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    link: '/products',
  },
  {
    title: 'Sách Mới - Giảm 20% Cho Khách Hàng Thân Thiết',
    slug: 'sach-moi-giam-20',
    description: 'Đón chào mùa sách mới với ưu đãi 20% dành riêng cho khách hàng thân thiết.',
    discountPercent: 20,
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    link: '/products?isNew=true',
  },
  {
    title: 'Flash Sale - Chỉ Hôm Nay',
    slug: 'flash-sale-hom-nay',
    description: 'Flash sale mỗi ngày! Giảm 30% cho 100 đơn hàng đầu tiên.',
    discountPercent: 30,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    link: '/products',
  },
];

const news = [
  {
    title: 'Mùa Hè Này Đọc Gì? Top 10 Cuốn Sách Không Thể Bỏ Qua',
    slug: 'mua-he-nay-doc-gi',
    content: `<p>Mùa hè là thời điểm hoàn hảo để đắm chìm trong những cuốn sách hay. Dưới đây là top 10 cuốn sách được đánh giá cao nhất mùa hè này.</p>
    <h3>1. Tuổi Trẻ Đáng Giá Bao Nhiêu</h3>
    <p>Cuốn sách truyền cảm hứng về việc sống hết mình trong những năm tháng tuổi trẻ.</p>
    <h3>2. Nhà Giả Kim</h3>
    <p>Câu chuyện kinh điển về việc theo đuổi giấc mơ của một chàng trai chăn cừu.</p>`,
    excerpt: 'Khám phá top 10 cuốn sách hay nhất mùa hè 2024, từ văn học đến self-help.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    author: 'Admin',
    category: 'Tin tức',
    tags: ['sách hay', 'mùa hè', 'recommendation'],
    isFeatured: true,
    viewCount: 1234,
  },
  {
    title: 'Tác Giả Nổi Tiếng Sắp Ra Mắt Tác Phẩm Mới',
    slug: 'tac-gia-noi-tieng-ra-mat-tac-pham-moi',
    content: `<p>Nhiều tác giả nổi tiếng đang chuẩn bị ra mắt những tác phẩm mới trong năm nay. Hãy cùng điểm qua những cuốn sách đáng chú ý.</p>`,
    excerpt: 'Thông tin về các tác phẩm mới sắp ra mắt từ các tác giả được yêu thích.',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    author: 'Admin',
    category: 'Tin tức',
    tags: ['tác giả', 'tin mới', '2024'],
    isFeatured: true,
    viewCount: 856,
  },
  {
    title: 'Hướng Dẫn Chọn Sách Theo Tính Cách',
    slug: 'huong-dan-chon-sach-theo-tinh-cach',
    content: `<p>Bạn là người hướng nội hay hướng ngoại? Bạn thích đọc sách về kinh doanh hay tiểu thuyết? Cùng khám phá nhé!</p>`,
    excerpt: 'Bài viết hướng dẫn cách chọn sách phù hợp với tính cách và sở thích của bạn.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    author: 'Admin',
    category: 'Hướng dẫn',
    tags: ['hướng dẫn', 'recommendation'],
    isFeatured: false,
    viewCount: 567,
  },
  {
    title: 'Lợi Ích Của Việc Đọc Sách Mỗi Ngày',
    slug: 'loi-ich-cua-viec-doc-sach',
    content: `<p>Nghiên cứu cho thấy đọc sách mỗi ngày mang lại nhiều lợi ích cho sức khỏe tinh thần và trí tuệ.</p>`,
    excerpt: 'Khám phá những lợi ích tuyệt vời của việc đọc sách đều đặn mỗi ngày.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    author: 'Admin',
    category: 'Kiến thức',
    tags: ['lợi ích', 'sức khỏe'],
    isFeatured: false,
    viewCount: 2345,
  },
  {
    title: 'Sự Kiện Book Fair 2024 - Mua 1 Tặng 1',
    slug: 'su-kien-book-fair-2024',
    content: `<p>Book Fair 2024 sẽ diễn ra tại TP.HCM với nhiều ưu đãi hấp dẫn. Mua 1 tặng 1 cho tất cả sách.</p>`,
    excerpt: 'Thông tin về sự kiện Book Fair 2024 với nhiều ưu đãi hấp dẫn.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    author: 'Admin',
    category: 'Sự kiện',
    tags: ['book fair', 'sự kiện', 'ưu đãi'],
    isFeatured: true,
    viewCount: 1567,
  },
];

async function seed() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Promotion.deleteMany({}),
      News.deleteMany({}),
    ]);

    // Create categories and get their IDs
    console.log('📚 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create products with category IDs
    console.log('📖 Creating products...');
    
    // Map products to categories based on position
    const categorySlugs = Object.keys(categoryMap);
    const productsWithCategories = products.map((p, index) => {
      // Assign categories in rotation: van-hoc, kinh-te, thieu-nhi, cntt, ngoai-ngu
      const categoryIndex = index % categorySlugs.length;
      return {
        ...p,
        category: categoryMap[categorySlugs[categoryIndex]],
      };
    });
    
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create promotions
    console.log('🎉 Creating promotions...');
    const createdPromotions = await Promotion.insertMany(promotions);
    console.log(`✅ Created ${createdPromotions.length} promotions`);

    // Create news
    console.log('📰 Creating news...');
    const createdNews = await News.insertMany(news);
    console.log(`✅ Created ${createdNews.length} news articles`);

    console.log('\n🎊 Seed completed successfully!');
    console.log(`
Summary:
- Categories: ${createdCategories.length}
- Products: ${createdProducts.length}
- Promotions: ${createdPromotions.length}
- News: ${createdNews.length}
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
