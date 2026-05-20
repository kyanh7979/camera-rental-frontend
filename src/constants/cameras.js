export const CAMERAS = [
  {
    id: '1',
    name: 'Canon EOS R5',
    brand: 'Canon',
    category: 'Máy ảnh Mirrorless',
    pricePerDay: 140,
    rating: 4.9,
    images: [
      'https://images.pexels.com/photos/212372/pexels-photo-212372.jpeg',
      'https://images.pexels.com/photos/51383/camera-lens-sony-charger-51383.jpeg'
    ],
    specs: {
      megapixels: '45 MP',
      sensor: 'Full Frame CMOS',
      video: '8K RAW',
      stabilization: 'Chống rung 5 trục trong thân máy',
      mount: 'Ngàm RF'
    },
    description:
      'Máy ảnh mirrorless full-frame cao cấp với độ phân giải 45MP, quay video 8K RAW và hệ thống lấy nét tự động hàng đầu.',
    availability: 'Còn hàng'
  },
  {
    id: '2',
    name: 'Sony A7 IV',
    brand: 'Sony',
    category: 'Máy ảnh Mirrorless',
    pricePerDay: 120,
    rating: 4.8,
    images: [
      'https://images.pexels.com/photos/599988/pexels-photo-599988.jpeg'
    ],
    specs: {
      megapixels: '33 MP',
      sensor: 'Full Frame CMOS',
      video: '4K 60p',
      stabilization: 'Chống rung 5 trục trong thân máy',
      mount: 'Ngàm E'
    },
    description:
      'Máy ảnh mirrorless đa năng, phù hợp cho cả chụp ảnh và quay video với hệ thống lấy nét tự động rất tốt.',
    availability: 'Còn hàng'
  },
  {
    id: '3',
    name: 'Nikon Z7 II',
    brand: 'Nikon',
    category: 'Máy ảnh Mirrorless',
    pricePerDay: 115,
    rating: 4.7,
    images: [
      'https://images.pexels.com/photos/2837009/pexels-photo-2837009.jpeg'
    ],
    specs: {
      megapixels: '45.7 MP',
      sensor: 'Full Frame BSI CMOS',
      video: '4K 60p',
      stabilization: 'Chống rung 5 trục trong thân máy',
      mount: 'Ngàm Z'
    },
    description:
      'Máy ảnh mirrorless độ phân giải cao với bộ xử lý kép và dải tương phản động ấn tượng.',
    availability: 'Còn hàng'
  },
  {
    id: '4',
    name: 'Canon EOS 5D Mark IV',
    brand: 'Canon',
    category: 'Máy ảnh DSLR',
    pricePerDay: 90,
    rating: 4.6,
    images: [
      'https://images.pexels.com/photos/212372/pexels-photo-212372.jpeg'
    ],
    specs: {
      megapixels: '30.4 MP',
      sensor: 'Full Frame CMOS',
      video: '4K 30p',
      stabilization: 'Chống rung trên ống kính',
      mount: 'Ngàm EF'
    },
    description:
      'Máy ảnh DSLR full-frame huyền thoại với thiết kế bền bỉ và chất lượng hình ảnh xuất sắc.',
    availability: 'Còn hàng'
  },
  {
    id: '5',
    name: 'Fujifilm X100VI',
    brand: 'Fujifilm',
    category: 'Máy ảnh Compact',
    pricePerDay: 85,
    rating: 4.9,
    images: [
      'https://images.pexels.com/photos/1576939/pexels-photo-1576939.jpeg'
    ],
    specs: {
      megapixels: '40 MP',
      sensor: 'APS-C X-Trans',
      video: '6.2K 30p',
      stabilization: 'Chống rung 6 trục',
      fixedLens: '23mm f/2'
    },
    description:
      'Máy ảnh compact cao cấp với thiết kế cổ điển, cảm biến 40MP và lens tích hợp.',
    availability: 'Còn hàng'
  },
  {
    id: '6',
    name: 'Sony ZV-E1',
    brand: 'Sony',
    category: 'Máy ảnh Vlog',
    pricePerDay: 95,
    rating: 4.7,
    images: [
      'https://images.pexels.com/photos/6898853/pexels-photo-6898853.jpeg'
    ],
    specs: {
      megapixels: '12.1 MP',
      sensor: 'Full Frame CMOS',
      video: '4K 120p',
      stabilization: 'Chống rung 5 trục',
      features: 'AI autofocus, Live streaming'
    },
    description:
      'Máy ảnh chuyên vlog với cảm biến full-frame, tính năng AI và khả năng livestream.',
    availability: 'Còn hàng'
  },
  {
    id: '7',
    name: 'Sony A7S III',
    brand: 'Sony',
    category: 'Máy quay Video',
    pricePerDay: 150,
    rating: 4.8,
    images: [
      'https://images.pexels.com/photos/800/600'
    ],
    specs: {
      megapixels: '12.1 MP',
      sensor: 'Full Frame CMOS',
      video: '4K 120p / 4K 60p 16-bit RAW',
      stabilization: 'Chống rung 5 trục',
      mount: 'Ngàm E'
    },
    description:
      'Máy quay video chuyên nghiệp với độ nhạy sáng cực cao và khả năng quay 4K 120fps.',
    availability: 'Còn hàng'
  },
  {
    id: '8',
    name: 'Blackmagic Pocket Cinema Camera 6K Pro',
    brand: 'Blackmagic',
    category: 'Máy ảnh Cinema',
    pricePerDay: 180,
    rating: 4.6,
    images: [
      'https://images.pexels.com/photos/6898857/pexels-photo-6898857.jpeg'
    ],
    specs: {
      resolution: '6K',
      sensor: 'Super 35',
      video: 'BRAW / ProRes',
      mount: 'Ngàm EF',
      builtInND: 'ND 2, 4, 6 stops'
    },
    description:
      'Máy quay phim chuyên nghiệp 6K với bộ lọc ND tích hợp và các định dạng codec chuyên nghiệp.',
    availability: 'Đặt trước'
  },
  {
    id: '9',
    name: 'GoPro HERO12 Black',
    brand: 'GoPro',
    category: 'Action Camera',
    pricePerDay: 45,
    rating: 4.5,
    images: [
      'https://images.pexels.com/photos/1367256/pexels-photo-1367256.jpeg'
    ],
    specs: {
      video: '5.3K 60fps / 4K 120fps',
      photo: '27 MP',
      stabilization: 'HyperSmooth 6.0',
      waterproof: '11m',
      battery: '1720mAh'
    },
    description:
      'Action camera chống nước với chống rung HyperSmooth 6.0 và quay 5.3K.',
    availability: 'Còn hàng'
  },
  {
    id: '10',
    name: 'Insta360 X4',
    brand: 'Insta360',
    category: 'Camera 360',
    pricePerDay: 65,
    rating: 4.4,
    images: [
      'https://images.pexels.com/photos/2399847/pexels-photo-2399847.jpeg'
    ],
    specs: {
      video: '8K 360 / 4K 60fps single lens',
      photo: '72 MP',
      stabilization: 'FlowState',
      waterproof: '10m',
      battery: '2290mAh'
    },
    description:
      'Camera 360 độ với khả năng quay 8K, chống nước và nhiều chế độ quay sáng tạo.',
    availability: 'Còn hàng'
  },
  {
    id: '11',
    name: 'DJI Mavic 3 Pro',
    brand: 'DJI',
    category: 'Flycam',
    pricePerDay: 200,
    rating: 4.9,
    images: [
      'https://images.pexels.com/photos/2041627/pexels-photo-2041627.jpeg'
    ],
    specs: {
      camera: 'Hasselblad 4/3 CMOS',
      video: '5.1K 50fps / 4K 120fps',
      flightTime: '43 phút',
      range: '15km',
      obstacleAvoidance: 'Omnidirectional'
    },
    description:
      'Flycam cao cấp với camera Hasselblad, thời gian bay 43 phút và hệ thống tránh vật cản.',
    availability: 'Còn hàng'
  },
  {
    id: '12',
    name: 'Sony RX100 VII',
    brand: 'Sony',
    category: 'Máy ảnh Du Lịch',
    pricePerDay: 50,
    rating: 4.6,
    images: [
      'https://images.pexels.com/photos/1618690/pexels-photo-1618690.jpeg'
    ],
    specs: {
      megapixels: '20.1 MP',
      sensor: '1-inch Exmor RS CMOS',
      zoom: '24-200mm f/2.8-4.5',
      video: '4K HDR',
      stabilization: 'Optical SteadyShot'
    },
    description:
      'Máy ảnh du lịch cao cấp với zoom 24-200mm trong thân máy nhỏ gọn.',
    availability: 'Còn hàng'
  },
  {
    id: '13',
    name: 'Fujifilm X-T5',
    brand: 'Fujifilm',
    category: 'Máy ảnh Vlog',
    pricePerDay: 95,
    rating: 4.7,
    images: [
      'https://images.pexels.com/photos/1576939/pexels-photo-1576939.jpeg'
    ],
    specs: {
      megapixels: '40 MP',
      sensor: 'APS-C X-Trans',
      video: '6.2K 30p',
      stabilization: 'Chống rung 5 trục trong thân máy',
      mount: 'Ngàm X'
    },
    description:
      'Máy ảnh mirrorless APS-C phong cách cổ điển với độ phân giải cao và màu sắc đặc trưng của Fujifilm.',
    availability: 'Còn hàng'
  },
  {
    id: '14',
    name: 'DJI Mini 4 Pro',
    brand: 'DJI',
    category: 'Flycam',
    pricePerDay: 85,
    rating: 4.8,
    images: [
      'https://images.pexels.com/photos/2041627/pexels-photo-2041627.jpeg'
    ],
    specs: {
      camera: '1/1.3-inch CMOS',
      video: '4K 100fps / 4K 60fps HDR',
      flightTime: '34 phút',
      range: '20km',
      weight: '249g'
    },
    description:
      'Flycam nhỏ gọn dưới 250g với camera 4K HDR và thời gian bay 34 phút.',
    availability: 'Còn hàng'
  }
];