// js/animations.js

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animated');
  
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
  
    animatedElements.forEach(el => observer.observe(el));
  });


  // modal de TEAM----

const teamItems = document.querySelectorAll('.team-item');
const modal = document.getElementById('teamModal');
const modalImg = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalInfo = document.getElementById('modalInfo');
const closeBtn = document.querySelector('.close');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

let currentIndex = 0;

function showModal(index) {
    const item = teamItems[index];
    const img = item.querySelector('img');
    const title = item.querySelector('h2').textContent;
    const rank = item.querySelector('p').textContent;

    // Animación reiniciada
    modalImg.classList.remove('fade-img');
    modalInfo.classList.remove('fade-text');
    void modalImg.offsetWidth;
    void modalInfo.offsetWidth;
    modalImg.classList.add('fade-img');
    modalInfo.classList.add('fade-text');

    modalImg.src = img.src;
    modalTitle.textContent = title;
    modalText.textContent = `Este es ${title}, actualmente en el rango "${rank}". Aquí podés colocar más detalles sobre su experiencia, rol o trayectoria.`;

    modal.style.display = "block";
    currentIndex = index;

    // Mostrar u ocultar flechas
    leftArrow.classList.toggle('hidden', currentIndex === 0);
    rightArrow.classList.toggle('hidden', currentIndex === teamItems.length - 1);
}

teamItems.forEach((item, index) => {
    item.addEventListener('click', () => showModal(index));
});

// Cerrar modal con botón X
closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
});

// Cerrar al hacer clic fuera
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Flechas navegación
leftArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
        showModal(currentIndex - 1);
    }
});

rightArrow.addEventListener('click', () => {
    if (currentIndex < teamItems.length - 1) {
        showModal(currentIndex + 1);
    }
});


//Galería Index

// Opcionalmente puedes agregar un efecto adicional con JS, pero no es necesario para el filtro B/N
document.querySelectorAll('.gallery img').forEach(img => {
  img.addEventListener('mouseenter', () => {
    img.classList.add('hovered');
  });

  img.addEventListener('mouseleave', () => {
    img.classList.remove('hovered');
  });
});
//Fin galería Index


//Tarjetas Información Telefonia//
function openModal(id) {
    document.getElementById(id).style.display = 'block';
  }

  function closeModal(id) {
    document.getElementById(id).style.display = 'none';
  }

  window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (event.target === modal) modal.style.display = "none";
    });
  }
