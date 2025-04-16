document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper('.swiper-container', {
      // Configuración básica
      loop: true,
      speed: 1000,
      spaceBetween: 30,
      centeredSlides: true,
      slidesPerView: 'auto',
      
      // Autoplay corregido
      autoplay: {
        delay: 3000, // 3 segundos (ajusta según necesites)
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      
      // Paginación
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      
      // Navegación
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      
      // Efectos
      effect: 'slide',
      grabCursor: true,
    });
    
    // Progress bar del autoplay (corregido)
    const progressCircle = document.querySelector('.autoplay-progress svg');
    const progressContent = document.querySelector('.autoplay-progress span');
    
    if (progressCircle && progressContent) {
      swiper.on('autoplayTimeLeft', (s, time, progress) => {
        progressCircle.style.setProperty('--progress', 1 - progress);
        progressContent.textContent = `${Math.ceil(time/1000)}s`;
      });
    }
    
    // Efecto de zoom en la imagen activa
    function updateZoom() {
      const slides = document.querySelectorAll('.swiper-slide');
      slides.forEach(slide => {
        const img = slide.querySelector('img');
        if (img) img.style.transform = slide.classList.contains('swiper-slide-active') ? 'scale(1.1)' : 'scale(1)';
      });
    }
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
          console.error('Error al cargar:', this.src);
          this.src = 'https://via.placeholder.com/800x500?text=Imagen+no+encontrada';
        };
      });
    
    swiper.on('slideChange', updateZoom);
    updateZoom(); // Inicializar
  });