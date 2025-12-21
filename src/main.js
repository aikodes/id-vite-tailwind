import { initializeMenu } from "./vanilla-menu.js";
import { menuData } from "./menu-data.js";
import { initializeMegaMenu } from "./mega-menu.js";
import "./notifications.js";
import "basecoat-css/all";
// import "./toggle-tabs.js";


// Recommended way, to include only the icons you need.
import {
  createIcons,
  User,
  ChevronDown,
  Zap,
  ShoppingCart,
  Heart,
  Search,
  Mic,
  Dot,
  LayoutGrid,
  X,
  UserCog,
} from "lucide";

createIcons({
  icons: {
    User,
    ChevronDown,
    Zap,
    ShoppingCart,
    Heart,
    Search,
    Mic,
    Dot,
    LayoutGrid,
    X,
    UserCog,
  },
});

// Initialize when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeMenu(menuData, {
    millerMenuKeys: ["menu1", "menu2"],
  });

  initializeMegaMenu({
    menuKey: "menu3",
  });
});
