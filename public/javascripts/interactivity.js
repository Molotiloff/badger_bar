document.addEventListener('DOMContentLoaded', () => {
  const shapes = document.querySelectorAll('.image-mapper-shape');

  shapes.forEach(shape => {
    shape.addEventListener('click', () => {
      const location = shape.getAttribute('data-index');
      window.location.href = `/reservations/new?location=Барная%20стойка`; // Добавьте динамическую логику, если нужно
    });
  });
});
