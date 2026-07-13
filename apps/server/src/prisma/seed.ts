import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fotografi.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@fotografi.com',
      password: adminPassword,
      name: 'Admin',
      phone: '6281234567890',
      role: 'admin',
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email} (password: admin123)`);

  // Create sample categories
  const categories = [
    { name: 'Wedding', description: 'Foto pernikahan profesional', sortOrder: 1 },
    { name: 'Wisuda', description: 'Foto wisuda dan kelulusan', sortOrder: 2 },
    { name: 'Prewedding', description: 'Foto prewedding romantis', sortOrder: 3 },
    { name: 'Engagement', description: 'Foto lamaran dan tunangan', sortOrder: 4 },
    { name: 'Family', description: 'Foto keluarga', sortOrder: 5 },
    { name: 'Graduation', description: 'Foto kelulusan', sortOrder: 6 },
    { name: 'Birthday', description: 'Foto ulang tahun', sortOrder: 7 },
    { name: 'Corporate', description: 'Foto perusahaan', sortOrder: 8 },
    { name: 'Product', description: 'Foto produk', sortOrder: 9 },
    { name: 'Studio', description: 'Foto studio profesional', sortOrder: 10 },
  ];

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().replace(/\s+/g, '-');
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        id: uuidv4(),
        name: cat.name,
        slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${categories.length} categories created`);

  // Create sample packages for Wedding
  const weddingCategory = await prisma.category.findUnique({
    where: { slug: 'wedding' },
  });

  if (weddingCategory) {
    const weddingPackages = [
      {
        name: 'Basic',
        slug: 'wedding-basic',
        price: 3500000,
        description: 'Paket wedding basic untuk dokumentasi pernikahan sederhana',
        duration: '4 Jam',
        photographer: 1,
        videographer: 0,
        photoCount: 200,
        videoCount: 0,
        hasDrone: false,
        hasAlbum: true,
        hasPrint: false,
        hasFrame: false,
        hasCinematic: false,
        hasHighlight: false,
        location: 'Dalam Kota',
        isPopular: false,
        benefits: ['1 Fotografer', '4 Jam Coverage', '200 Foto Edit', 'Album 10x10'],
      },
      {
        name: 'Medium',
        slug: 'wedding-medium',
        price: 5500000,
        description: 'Paket wedding medium dengan coverage lebih lengkap',
        duration: '8 Jam',
        photographer: 2,
        videographer: 1,
        photoCount: 400,
        videoCount: 1,
        hasDrone: false,
        hasAlbum: true,
        hasPrint: true,
        hasFrame: false,
        hasCinematic: true,
        hasHighlight: false,
        location: 'Dalam Kota',
        isPopular: true,
        benefits: ['2 Fotografer', '1 Videografer', '8 Jam Coverage', '400 Foto Edit', '1 Video Highlight', 'Album 10x10', 'Cetak 4R 50 pcs'],
      },
      {
        name: 'Premium',
        slug: 'wedding-premium',
        price: 8500000,
        description: 'Paket wedding premium dengan hasil maksimal',
        duration: '12 Jam / Full Day',
        photographer: 2,
        videographer: 1,
        photoCount: 600,
        videoCount: 2,
        hasDrone: true,
        hasAlbum: true,
        hasPrint: true,
        hasFrame: true,
        hasCinematic: true,
        hasHighlight: true,
        location: 'Dalam & Luar Kota',
        isPopular: true,
        benefits: ['2 Fotografer Senior', '1 Videografer', 'Full Day Coverage', '600+ Foto Edit', '2 Video (Cinematic + Highlight)', 'Drone Aerial', 'Album Premium 12x12', 'Cetak Foto 4R & 8R', 'Frame 20x30', 'Flash Disk'],
      },
    ];

    for (const pkg of weddingPackages) {
      const existing = await prisma.package.findFirst({
        where: { slug: pkg.slug },
      });
      if (!existing) {
        const packageId = uuidv4();
        await prisma.package.create({
          data: {
            id: packageId,
            categoryId: weddingCategory.id,
            name: pkg.name,
            slug: pkg.slug,
            price: pkg.price,
            description: pkg.description,
            duration: pkg.duration,
            photographer: pkg.photographer,
            videographer: pkg.videographer,
            photoCount: pkg.photoCount,
            videoCount: pkg.videoCount,
            hasDrone: pkg.hasDrone,
            hasAlbum: pkg.hasAlbum,
            hasPrint: pkg.hasPrint,
            hasFrame: pkg.hasFrame,
            hasCinematic: pkg.hasCinematic,
            hasHighlight: pkg.hasHighlight,
            location: pkg.location,
            isPopular: pkg.isPopular,
            benefits: {
              create: pkg.benefits.map((b: string) => ({
                id: uuidv4(),
                benefit: b,
              })),
            },
          },
        });
      }
    }
    console.log(`✅ ${weddingPackages.length} wedding packages created`);
  }

  // Create sample FAQs
  const faqs = [
    {
      question: 'Bagaimana cara memesan paket fotografi?',
      answer: 'Anda dapat memesan melalui website dengan memilih paket yang diinginkan, mengisi data diri, dan melakukan pembayaran DP. Tim kami akan mengkonfirmasi pemesanan Anda dalam 1x24 jam.',
      sortOrder: 1,
    },
    {
      question: 'Apakah bisa request lokasi di luar kota?',
      answer: 'Tentu, kami melayani pemotretan di luar kota dengan biaya transportasi dan akomodasi tambahan yang akan disepakati bersama.',
      sortOrder: 2,
    },
    {
      question: 'Berapa lama proses editing foto?',
      answer: 'Proses editing foto biasanya memakan waktu 2-4 minggu tergantung jumlah foto dan kompleksitas editing. Untuk paket premium, proses bisa lebih cepat.',
      sortOrder: 3,
    },
    {
      question: 'Apakah hasil foto diberikan dalam bentuk softcopy?',
      answer: 'Ya, semua hasil foto diberikan dalam bentuk softcopy (digital) melalui Google Drive atau Flash Disk. Untuk paket tertentu juga tersedia cetak foto dan album.',
      sortOrder: 4,
    },
    {
      question: 'Bagaimana jika saya ingin membatalkan pemesanan?',
      answer: 'Pembatalan dapat dilakukan dengan menghubungi admin. Kebijakan refund tergantung pada waktu pembatalan. Pembatalan H-7 mendapatkan refund 50%, H-3 tidak dapat refund.',
      sortOrder: 5,
    },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({
      data: {
        id: uuidv4(),
        question: faq.question,
        answer: faq.answer,
        sortOrder: faq.sortOrder,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${faqs.length} FAQs created`);

  // Create default website settings
  const defaultSettings: Record<string, string> = {
    studio_name: 'Fotografi Studio',
    address: 'Jl. Merdeka No. 123, Jakarta',
    email: 'info@fotografi.com',
    whatsapp: '6281234567890',
    instagram: '@fotografi_studio',
    facebook: 'fotografistudio',
    tiktok: '@fotografi_studio',
    logo_url: '',
    admin_logo_url: '',
    favicon_url: '',
    apple_touch_icon_url: '',
    og_image_url: '',
    theme_color: '#0f172a',
    footer_text: 'Fotografi Studio - Mengabadikan setiap momen berharga Anda.',
    footer_links_title: 'Quick Links',
    footer_social_title: 'Ikuti Kami',
    copyright_text: '© 2026 Fotografi Studio. All rights reserved.',
    meta_title: 'Fotografi Studio - Jasa Fotografi Profesional',
    meta_description: 'Jasa fotografi profesional untuk wedding, prewedding, wisuda, dan berbagai momen spesial Anda. Harga terjangkau, hasil berkualitas.',
    hero_badge: 'Premium Photography Studio',
    hero_title: 'Abadikan Momen Berharga Bersama Kami',
    hero_description: 'Fotografi profesional untuk setiap momen spesial Anda. Dari wedding hingga corporate event, kami hadir dengan hasil terbaik.',
    hero_primary_cta_label: 'Lihat Paket',
    hero_secondary_cta_label: 'Konsultasi Gratis',
    about_badge: 'Tentang Kami',
    about_title: 'Mengabadikan Momen Terbaik Anda',
    about_description: 'Kami adalah tim fotografer profesional dengan pengalaman lebih dari 12 tahun. Berkomitmen memberikan hasil foto berkualitas tinggi dengan sentuhan artistik yang unik.',
    about_feature_1_title: 'Fotografer Profesional',
    about_feature_1_desc: 'Tim fotografer berpengalaman dan bersertifikat dengan portofolio yang luas.',
    about_feature_2_title: 'Hasil Berkualitas',
    about_feature_2_desc: 'Menggunakan peralatan terbaik dan teknik editing modern untuk hasil maksimal.',
    about_feature_3_title: 'Tepat Waktu',
    about_feature_3_desc: 'Komitmen terhadap deadline dengan hasil yang memuaskan tanpa kompromi.',
    portfolio_badge: 'Portfolio',
    portfolio_title: 'Hasil Karya Kami',
    portfolio_description: 'Lihat beberapa hasil foto terbaik dari setiap sesi pemotretan.',
    packages_badge: 'Paket Foto',
    packages_title: 'Pilih Paket Sesuai Kebutuhan',
    packages_description: 'Tersedia berbagai paket fotografi untuk setiap momen spesial Anda.',
    packages_primary_cta_label: 'Booking Sekarang',
    packages_secondary_cta_label: 'Lihat Semua Paket',
    testimonials_badge: 'Testimoni',
    testimonials_title: 'Apa Kata Klien Kami',
    testimonials_description: 'Kepuasan klien adalah prioritas utama kami.',
    faq_badge: 'FAQ',
    faq_title: 'Pertanyaan Umum',
    faq_description: 'Temukan jawaban cepat untuk pertanyaan yang paling sering ditanyakan calon customer kami.',
    contact_badge: 'Kontak',
    contact_title: 'Hubungi Kami',
    contact_description: 'Jangan ragu untuk menghubungi kami. Kami siap membantu Anda.',
    contact_primary_cta_label: 'Chat WhatsApp Sekarang',
    section_show_portfolio: 'true',
    section_show_packages: 'true',
    section_show_testimonials: 'true',
    section_show_faq: 'true',
    section_show_contact: 'true',
    homepage_section_order: JSON.stringify([
      'about',
      'portfolio',
      'packages',
      'testimonials',
      'faq',
      'contact',
    ]),
    payment_instructions: 'Lakukan transfer DP sesuai nominal yang tertera, lalu upload bukti pembayaran agar admin dapat memverifikasi booking Anda.',
    payment_confirmation_note: 'Tim admin memverifikasi pembayaran pada jam kerja. Pastikan nominal dan invoice sudah sesuai.',
    payment_bank_name: 'Bank BCA',
    payment_account_name: 'Fotografi Studio',
    payment_account_number: '1234567890',
    payment_methods: JSON.stringify([
      {
        id: 'bank-bca',
        label: 'Transfer Bank BCA',
        type: 'bank_transfer',
        bankName: 'Bank BCA',
        accountName: 'Fotografi Studio',
        accountNumber: '1234567890',
        instructions: 'Cantumkan nomor invoice pada berita transfer agar verifikasi lebih cepat.',
        isActive: true,
      },
      {
        id: 'bank-mandiri',
        label: 'Transfer Bank Mandiri',
        type: 'bank_transfer',
        bankName: 'Bank Mandiri',
        accountName: 'Fotografi Studio',
        accountNumber: '9876543210',
        instructions: 'Transfer sesuai nominal DP dan upload bukti pembayaran yang jelas.',
        isActive: true,
      },
    ]),
    booking_time_slots: JSON.stringify([
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
    ]),
    booking_blackout_dates: JSON.stringify([]),
    booking_max_per_slot: '1',
    booking_window_days: '30',
    booking_advance_notice_days: '0',
    theme_palette: 'gold',
    font_type: 'modern-sans',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.websiteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log(`✅ ${Object.keys(defaultSettings).length} settings created`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
