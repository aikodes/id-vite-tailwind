document.addEventListener("DOMContentLoaded", () => {
  const showNotiBtn = document.getElementById("showNotification");
  const notification = document.getElementById("notification");
  const closeNotiBtn = document.getElementById("closeNotification");
  const progressBar = document.getElementById("progressBar");
  let autoDismissTimeout;
  let previousActiveElement = null;

  // Set duration (10 seconds)
  const NOTIFICATION_DURATION = 6000;
  document.documentElement.style.setProperty('--notification-duration', `${NOTIFICATION_DURATION}ms`);

  const dismissNotification = () => {
    notification.classList.remove("animate-in", "slide-in-from-bottom");
    notification.classList.add("animate-out", "duration-300", "slide-out-to-bottom", "fill-mode-forwards");

    notification.addEventListener(
      "animationend",
      () => {
        notification.classList.add("hidden");
        // Return focus to trigger button
        if (previousActiveElement) {
          previousActiveElement.focus();
        }
      },
      { once: true }
    );
  };

  showNotiBtn.addEventListener("click", () => {
    // Store currently focused element
    previousActiveElement = document.activeElement;
    
    // Clear any existing timeout
    clearTimeout(autoDismissTimeout);

    // Reset progress bar
    progressBar.style.transform = "scaleX(1)";
    
    notification.classList.remove(
      "hidden",
      "animate-out",
      "slide-out-to-bottom"
    );
    notification.classList.add("animate-in", "slide-in-from-bottom");
    
    // Move focus to notification
    notification.focus();
    
    // Animate progress bar
    setTimeout(() => {
      progressBar.style.transform = "scaleX(0)";
    }, 10);
    
    // Set new 6-second timeout
    autoDismissTimeout = setTimeout(dismissNotification, NOTIFICATION_DURATION);
  });

  closeNotiBtn.addEventListener("click", () => {
    // Clear timeout when manually closed
    clearTimeout(autoDismissTimeout);
    progressBar.style.transform = "scaleX(0)";
    dismissNotification();
  });
  
  // Add ESC key support
  notification.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dismissNotification();
    }
  });
})