// Создаёт уведомление
function showToast(message, type = 'error') {
  const toastContainer = document.querySelector('.toast-container');

  // Создаём элемент уведомления
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  // Добавляем уведомление в контейнер
  toastContainer.appendChild(toast);

  // Удаляем уведомление через 4 секунды
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Отображение уведомлений
document.addEventListener('DOMContentLoaded', () => {
  // Обрабатываем ошибки
  const errors = JSON.parse(document.body.dataset.errors || '[]');
  errors.forEach((error) => showToast(error.msg || error, 'error'));

  // Обрабатываем успешные сообщения
  const success = document.body.dataset.success;
  if (success) {
    showToast(success, 'success');
  }
});
