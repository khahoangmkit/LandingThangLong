document.addEventListener('DOMContentLoaded', function() {
  // Kiểm tra xem GSAP đã có sẵn chưa
  if (typeof gsap === 'undefined') {
    console.error('GSAP is not loaded.');
    return;
  }
  if (typeof ScrollTrigger === 'undefined') { 
    console.error('ScrollTrigger is not loaded via CDN. Check script tags in HTML.');
    return; 
  }

  // Đăng ký plugin ScrollTrigger
  gsap.registerPlugin(ScrollTrigger); 

  // --- Animation cho Tiêu đề Section ---

  // Helper function để tạo animation cho một nhóm phần tử
  function animateSectionTitle(selector, animationType = 'fade-in-up') {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      let animationProps = { opacity: 0 };
      if (animationType === 'fade-in-up') {
        animationProps.y = 30; // Trượt lên từ 30px dưới
      } else if (animationType === 'fade-in') {
        // Mặc định là fade-in
      } else if (animationType === 'scale-up') {
        animationProps.scale = 0.9;
      }
      // Thêm các loại animation khác nếu cần

      gsap.from(el, {
        ...animationProps,
        duration: 0.8, // Thời gian animation
        ease: 'power2.out', // Kiểu easing
        scrollTrigger: {
          trigger: el,
          start: 'top 85%', // Kích hoạt khi 85% của phần tử hiển thị từ dưới lên
          markers: false, // Tắt markers
          toggleActions: 'play none none none' // Chỉ play 1 lần
        }
      });
    });
  }

  // Áp dụng cho các tiêu đề section
  animateSectionTitle('.slide2-left .image-title', 'fade-in-up'); // Tiêu đề "Thông tin tổng quan"
  // Đối với "Mặt bằng tầng", cấu trúc HTML không có tiêu đề page-title rõ ràng ở cấp section.
  // Thay vào đó, ta có thể animate các cột nội dung bên trong nó.
  // Ví dụ: animateSectionTitle('#matbangduan .custom-bg-col h3', 'fade-in-up');
  // Hoặc toàn bộ khối: animateSectionTitle('#matbangduan .custom-bg-col', 'fade-in-up');

  animateSectionTitle('.header-loi-the .title', 'fade-in-up'); // Tiêu đề "6 LỢI THẾ"
  animateSectionTitle('.album-duan-gallery-title', 'fade-in-up'); // Tiêu đề "THƯ VIỆN ẢNH"
  animateSectionTitle('#tintuc .page-title', 'fade-in-up'); // Tiêu đề "TIN TỨC"
  animateSectionTitle('.form-section .form-title', 'fade-in-up'); // Tiêu đề Form "ĐĂNG KÝ NHẬN TƯ VẤN"


  // --- Animation cho các khối nội dung khác (Ví dụ) ---
  
  // Mô tả trong "Thông tin tổng quan"
  animateSectionTitle('.slide2-desc', 'fade-in');

  // MỚI: Hiệu ứng cho hình ảnh bên phải trong #thongtintongquan
  const thongTinImage = document.querySelector('#thongtintongquan .slide2-right img');
  if (thongTinImage) {
    gsap.from(thongTinImage, {
      opacity: 0,
      scale: 0.8, // Hiệu ứng phóng to từ nhỏ
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: thongTinImage,
        start: 'top 85%', 
        markers: false,   
        toggleActions: 'play none none none' 
      }
    });
  }

  // MỚI: Hiệu ứng cho danh sách chi tiết dự án trong #thongtintongquan (xuất hiện lần lượt)
  const thongTinDetailsItems = document.querySelectorAll('#thongtintongquan .slide2-footer-row .slide2-footer-item');
  if (thongTinDetailsItems.length > 0) {
    gsap.from(thongTinDetailsItems, {
      opacity: 0,
      x: -30, // Trượt vào từ bên trái
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.2, // Mỗi mục xuất hiện cách nhau 0.2 giây
      scrollTrigger: {
        trigger: '#thongtintongquan .slide2-footer-row', // Cập nhật trigger thành container của các item
        start: 'top 85%',
        markers: false,
        toggleActions: 'play none none none'
      }
    });
  }

  // --- Hết hiệu ứng cho section THÔNG TIN TỔNG QUAN ---

  // Tiêu đề "MẶT BẰNG TẦNG"

  // Các mục trong "6 LỢI THẾ" (accordion items) - xuất hiện lần lượt
  const accordionContainer = document.getElementById('6loithe'); 
  if (accordionContainer) {
    const accordionItems = accordionContainer.querySelectorAll('.accordion-item'); // Query within the container
    console.log('Accordion Items Found:', accordionItems); // Log to check if items are found
    if (accordionItems.length > 0) {
      accordionItems.forEach((item, index) => {
        gsap.from(item, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          delay: index * 0.15, // Hiệu ứng so le
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item.closest('.accordion'), // Trigger khi khối accordion cha vào view
            start: 'top 80%',
            markers: false, // Tắt markers
            toggleActions: 'play none none none'
          }
        });
      });
    } else {
      console.warn('Scroll Animations: No elements with class .accordion-item found within #6loithe.');
    }
  } else {
    console.warn('Scroll Animations: Element with ID #6loithe not found. Accordion animations skipped.');
  }

  // Các thẻ tin tức trong "TIN TỨC" - xuất hiện lần lượt
  const newsItems = document.querySelectorAll('#tintuc .news-item');
  newsItems.forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      y: 30,
      duration: 0.5,
      delay: index * 0.1, // Hiệu ứng so le nhẹ hơn
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item.closest('.news-grid'), // Trigger khi lưới tin tức cha vào view
        start: 'top 80%',
        markers: false, // Tắt markers
        toggleActions: 'play none none none'
      }
    });
  });

  // Hình ảnh trong slide2-right (nếu có và không phải là slider)
  // animateSectionTitle('.slide2-right img', 'scale-up'); // Ví dụ

  // Form liên hệ toàn bộ khối
  const contactForm = document.querySelector('#contact .main-content');
  gsap.from(contactForm, {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: contactForm,
      start: 'top 85%', 
      markers: false, // Tắt markers
      toggleActions: 'play none none none'
    }
  });

  // Bạn có thể thêm nhiều animation khác ở đây theo cấu trúc tương tự

  const tieuDiemThinhVuongTitle = document.querySelector('#matbangduan .custom-bg-section h3');
  if (tieuDiemThinhVuongTitle) {
    gsap.from(tieuDiemThinhVuongTitle, {
      opacity: 0,
      scale: 0.8, // Hiệu ứng phóng to từ nhỏ
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: tieuDiemThinhVuongTitle,
        start: 'top 85%',
        markers: false,
        toggleActions: 'play none none none'
      }
    });
  }
  const tieuDiemThinhVuongSpan = document.querySelectorAll('#matbangduan .custom-bg-section span');
  if (tieuDiemThinhVuongSpan.length > 0) {
    gsap.from(tieuDiemThinhVuongSpan, {
      opacity: 0,
      x: -30, // Trượt vào từ bên trái
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.2, // Mỗi mục xuất hiện cách nhau 0.2 giây
      scrollTrigger: {
        trigger: '#matbangduan .custom-bg-section span', // Cập nhật trigger thành container của các item
        start: 'top 85%',
        markers: false,
        toggleActions: 'play none none none'
      }
    });
  }

});
