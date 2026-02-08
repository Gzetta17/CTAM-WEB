(function ($) {
    "use strict";
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });
    
    
    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 0) {
            $('.navbar').addClass('nav-sticky');
        } else {
            $('.navbar').removeClass('nav-sticky');
        }
    });
    
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    
    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Testimonials carousel
    $(".testimonials-carousel").owlCarousel({
        autoplay: true,
        animateIn: 'slideInDown',
        animateOut: 'slideOutDown',
        items: 1,
        smartSpeed: 450,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            '<i class="fa fa-angle-right" aria-hidden="true"></i>'
        ]
    });
    
    
    // Blogs carousel
    $(".blog-carousel").owlCarousel({
        autoplay: true,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            '<i class="fa fa-angle-right" aria-hidden="true"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
    
    // Portfolio isotope and filter
    var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    });

    $('#portfolio-flters li').on('click', function () {
        $("#portfolio-flters li").removeClass('filter-active');
        $(this).addClass('filter-active');

        portfolioIsotope.isotope({filter: $(this).data('filter')});
    });
    
})(jQuery);

/********* inicio carrusel *********/

  document.addEventListener("DOMContentLoaded", function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".carousel-slide");
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove("active");
        if (i === index) {
          slide.classList.add("active");
        }
      });
    }

    function moveSlide(step) {
      currentSlide = (currentSlide + step + slides.length) % slides.length;
      showSlide(currentSlide);
    }

    if (prevBtn && nextBtn && slides.length > 0) {
      prevBtn.addEventListener("click", () => moveSlide(-1));
      nextBtn.addEventListener("click", () => moveSlide(1));

      // Auto-slide
      setInterval(() => moveSlide(1), 5000);

      // Mostrar el primer slide al iniciar
      showSlide(currentSlide);
    }
  });
  $(document).ready(function() {
    $('.filter-btn').click(function() {
        var category = $(this).attr('data-category');
        if (category == 'todos') {
            $('.service-item').show();
        } else {
            $('.service-item').each(function() {
                if ($(this).attr('data-category') == category) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
    });
});

/********* Fin carrusel *********/



/********* Boton Filtro Comercios *********/
function toggleFilter() {
    const filterPanel = document.getElementById('filter-panel');
    
    // Alterna entre mostrar y ocultar el filtro
    if (filterPanel.style.display === 'block') {
        filterPanel.style.display = 'none';
    } else {
        filterPanel.style.display = 'block';
    }
}


/********* Buscador en Comercios Adheridos *********/
document.getElementById('searchInput').addEventListener('keyup', function() {
    let input = this.value.toLowerCase();
    let items = document.querySelectorAll('.service-item');

    items.forEach(function(item) {
        let title = item.querySelector('h3').innerText.toLowerCase();
        let description = item.querySelector('p').innerText.toLowerCase();
        
        if (title.includes(input) || description.includes(input)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});





// Inicializar contadores
// Inicializar contadores
let comerciosAdheridos = 500;  // Cambiar este número según la cantidad real
let tarjetas = 1500;           // Este número es fijo, +1500
let socios = 3000;             // Este número es fijo, +3000

// Función para actualizar el contador con un efecto animado
function updateCounter(id, targetValue) {
    let element = document.getElementById(id);
    let currentValue = 0;
    let increment = targetValue / 50;  // Incremento mayor para animar más rápido

    let interval = setInterval(function() {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(interval);
        }
        element.innerHTML = Math.floor(currentValue);  // Redondear el número
    }, 20); // Intervalo de actualización más corto para simular cámara rápida
}

// Llamar a la función para actualizar cada contador
updateCounter("comerciosAdheridosCount", comerciosAdheridos);
updateCounter("tarjetasCount", tarjetas);
updateCounter("sociosCount", socios);


/********* Carrusel de promos en index *********/







/********* Carrusel + Info tarjeta *********/
const track = document.getElementById('track');
const progressBar = document.getElementById('progressBar');
const carousel = document.getElementById('carousel');

const totalSlides = track.children.length;
let index = 0;
let interval;
let progressInterval;
const slideDuration = 5000; // 5 segundos

function goToSlide(i) {
  track.style.transform = `translateX(-${i * 100}%)`;
  progressBar.style.transition = "none";
  progressBar.style.width = "0%";

  // Barra de progreso animada
  setTimeout(() => {
    progressBar.style.transition = `width ${slideDuration}ms linear`;
    progressBar.style.width = "100%";
  }, 50);
}

function startCarousel() {
  goToSlide(index);

  interval = setInterval(() => {
    index = (index + 1) % totalSlides;
    goToSlide(index);
  }, slideDuration);
}

function stopCarousel() {
  clearInterval(interval);
  progressBar.style.transition = "none";
  progressBar.style.width = "0%";
}

// Pausar al pasar el mouse
carousel.addEventListener('mouseenter', stopCarousel);
carousel.addEventListener('mouseleave', () => {
  startCarousel();
});

document.addEventListener("DOMContentLoaded", () => {
  startCarousel();
});

/********* Fin Carrusel + Info tarjeta *********/

document.getElementById('adminButton').addEventListener('click', function() {
    document.getElementById('loginPopup').style.display = 'block';
});





/********* Fin Noticias  *********/
function mostrarPopup(card) {
  const popup = document.getElementById('popup-noticia');
  const titulo = card.querySelector('.news-title').textContent;
  const contenidoHTML = card.querySelector('.popup-content-hidden').innerHTML;
  const imgSrc = card.querySelector('img').src;

  document.getElementById('popupTitulo').textContent = titulo;
  document.getElementById('popupImagen').src = imgSrc;

  const descripcionContainer = document.getElementById('popupDescripcion');
  descripcionContainer.innerHTML = contenidoHTML;

  popup.style.display = 'block';
}

function cerrarPopup() {
  document.getElementById('popup-noticia').style.display = 'none';
}


/********* Fin Noticias *********/



/********* Agregar Noticias *********/

document.getElementById('guardarNoticiaBtn').addEventListener('click', () => {
  const titulo = document.getElementById('noticiaTitulo').value.trim();
  const descripcion = document.getElementById('noticiaDescripcion').value.trim();
  const imagen = document.getElementById('noticiaImagen').files[0];

  if (!titulo || !descripcion || !imagen) {
    return alert('Todos los campos son obligatorios');
  }

  const formData = new FormData();
  formData.append('title', titulo);
  formData.append('description', descripcion);
  formData.append('image', imagen);

  fetch('http://localhost:3000/api/noticia', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    alert('Noticia guardada correctamente');
    document.getElementById('noticiaTitulo').value = '';
    document.getElementById('noticiaDescripcion').value = '';
    document.getElementById('noticiaImagen').value = '';
  })
  .catch(err => {
    console.error('Error al guardar noticia:', err);
    alert('Error al guardar noticia');
  });
});


/********* Fin Agregar Noticias *********/

/********* Fin Agregar Noticias *********/





