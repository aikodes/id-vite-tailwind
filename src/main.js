import { initializeMenu } from "./miller-menu.js";
import { menuData } from "./menu-data.js";
import { initializeMegaMenu } from "./mega-menu.js";
import { initializeMobileInteractions } from "./mobile-interactions.js";
import { updateNotificationTextContrast } from "./utils.js";
import "./notifications.js";
import "basecoat-css/all";
// import "./toggle-tabs.js";


// Recommended way, to include only the icons you need.
import {
  createIcons,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShoppingCart,
  Heart,
  Search,
  Mic,
  Dot,
  LayoutGrid,
  X,
  UserCog,
  Menu,
  ArrowRight
} from "lucide";

createIcons({
  icons: {
    User,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Zap,
    ShoppingCart,
    Heart,
    Search,
    Mic,
    Dot,
    LayoutGrid,
    X,
    UserCog,
    Menu,
    ArrowRight,
  },
});

// Make lucide globally available for dynamic icon creation
window.lucide = { createIcons };

// Initialize when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const millerMenu = initializeMenu(menuData, {
    millerMenuKeys: ["menu1", "menu2"],
  });

  initializeMegaMenu({
    menuKey: "menu3",
  });

  initializeMobileInteractions();

  // Initialize text contrast for notification color
  updateNotificationTextContrast();

  window.addEventListener("pagehide", () => {
    if (millerMenu?.destroy) {
      millerMenu.destroy();
    }
  });
});
