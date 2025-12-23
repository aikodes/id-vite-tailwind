// Menu data structure
export const menuData = {
  menu1: {
    title: "Browse Categories",
    columns: [
      {
        title: "Categories",
        items: [
          { id: "clothing", label: "Clothing", hasChildren: true },
          { id: "electronics", label: "Electronics", hasChildren: true },
          { id: "home", label: "Home", hasChildren: true },
          { id: "beauty", label: "Beauty & Personal Care", hasChildren: true },
          { id: "books", label: "Books", hasChildren: true },
          { id: "toys", label: "Toys & Games", hasChildren: true },
          { id: "sports", label: "Sports & Outdoors", hasChildren: true },
          { id: "automotive", label: "Automotive", hasChildren: true },
        ],
      },
    ],
    children: {
      clothing: {
        title: "Clothing",
        items: [
          { id: "mens", label: "Men's", hasChildren: true },
          { id: "womens", label: "Women's", hasChildren: true },
          { id: "kids", label: "Kids", hasChildren: true },
          { id: "baby", label: "Baby", hasChildren: true },
          { id: "accessories", label: "Accessories", hasChildren: true },
        ],
        children: {
          mens: {
            title: "Men's",
            items: [
              { id: "shirts", label: "Shirts", hasChildren: true },
              { id: "pants", label: "Pants", hasChildren: true },
              { id: "outerwear", label: "Outerwear", hasChildren: true },
              { id: "activewear", label: "Activewear", hasChildren: true },
              {
                id: "underwear",
                label: "Underwear & Socks",
                hasChildren: true,
              },
            ],
            children: {
              shirts: {
                title: "Shirts",
                items: [
                  { id: "tshirts", label: "T-Shirts", hasChildren: true },
                  {
                    id: "casual",
                    label: "Casual Shirts",
                    hasChildren: false,
                    href: "https://google.com",
                    target: "_blank",
                  },
                  {
                    id: "formal",
                    label: "Formal Shirts",
                    hasChildren: false,
                    href: "https://google.com",
                    target: "_blank",
                  },
                  {
                    id: "polos",
                    label: "Polo Shirts",
                    hasChildren: false,
                    href: "https://google.com",
                    target: "_blank",
                  },
                  {
                    id: "henleys",
                    label: "Henleys",
                    hasChildren: false,
                    href: "https://google.com",
                    target: "_blank",
                  },
                ],
                children: {
                  tshirts: {
                    title: "T-Shirts",
                    items: [
                      {
                        id: "plain",
                        label: "Plain",
                        hasChildren: false,
                        href: "https://google.com",
                        target: "_blank",
                      },
                      {
                        id: "polos",
                        label: "Polos",
                        hasChildren: false,
                        href: "https://google.com",
                        target: "_blank",
                      },
                      {
                        id: "graphic",
                        label: "Graphic",
                        hasChildren: false,
                        href: "https://google.com",
                        target: "_blank",
                      },
                    ],
                  },
                },
              },
              pants: {
                title: "Pants",
                items: [
                  { id: "jeans", label: "Jeans", hasChildren: false },
                  { id: "chinos", label: "Chinos", hasChildren: false },
                  { id: "dress", label: "Dress Pants", hasChildren: false },
                  { id: "shorts", label: "Shorts", hasChildren: false },
                  { id: "joggers", label: "Joggers", hasChildren: false },
                ],
              },
              outerwear: {
                title: "Outerwear",
                items: [
                  { id: "jackets", label: "Jackets", hasChildren: false },
                  { id: "coats", label: "Coats", hasChildren: false },
                  { id: "hoodies", label: "Hoodies", hasChildren: false },
                  { id: "sweaters", label: "Sweaters", hasChildren: false },
                  { id: "vests", label: "Vests", hasChildren: false },
                ],
              },
            },
          },
          womens: {
            title: "Women's",
            items: [
              { id: "tops", label: "Tops", hasChildren: true },
              { id: "bottoms", label: "Bottoms", hasChildren: true },
              { id: "dresses", label: "Dresses", hasChildren: true },
              { id: "activewear", label: "Activewear", hasChildren: true },
              { id: "intimates", label: "Intimates", hasChildren: true },
            ],
            children: {
              tops: {
                title: "Tops",
                items: [
                  { id: "blouses", label: "Blouses", hasChildren: false },
                  { id: "tshirts", label: "T-Shirts", hasChildren: false },
                  { id: "sweaters", label: "Sweaters", hasChildren: false },
                  { id: "tanks", label: "Tank Tops", hasChildren: false },
                  { id: "tunics", label: "Tunics", hasChildren: false },
                ],
              },
            },
          },
        },
      },
      electronics: {
        title: "Electronics",
        items: [
          { id: "computers", label: "Computers", hasChildren: true },
          { id: "phones", label: "Phones & Accessories", hasChildren: false },
          { id: "tv", label: "TV & Home Theater", hasChildren: false },
          { id: "audio", label: "Audio", hasChildren: false },
          { id: "wearables", label: "Wearable Technology", hasChildren: false },
        ],
        children: {
          computers: {
            title: "Computers",
            items: [
              { id: "laptops", label: "Laptops", hasChildren: false },
              { id: "desktops", label: "Desktops", hasChildren: false },
              { id: "tablets", label: "Tablets", hasChildren: false },
              { id: "monitors", label: "Monitors", hasChildren: false },
              {
                id: "accessories",
                label: "Computer Accessories",
                hasChildren: false,
              },
            ],
          },
        },
      },
      home: {
        title: "Home",
        items: [
          { id: "furniture", label: "Furniture", hasChildren: true },
          { id: "kitchen", label: "Kitchen", hasChildren: true },
          { id: "bedding", label: "Bedding", hasChildren: true },
          { id: "decor", label: "Home Decor", hasChildren: true },
          { id: "storage", label: "Storage & Organization", hasChildren: true },
        ],
        children: {
          furniture: {
            title: "Furniture",
            items: [
              { id: "living", label: "Living Room", hasChildren: false },
              { id: "bedroom", label: "Bedroom", hasChildren: false },
              { id: "dining", label: "Dining Room", hasChildren: false },
              { id: "office", label: "Home Office", hasChildren: false },
              { id: "patio", label: "Patio", hasChildren: false },
            ],
          },
        },
      },
    },
  },
  menu2: {
    title: "Shop by Brand",
    columns: [
      {
        title: "Popular Brands",
        items: [
          { id: "apple", label: "Apple", hasChildren: true },
          { id: "samsung", label: "Samsung", hasChildren: true },
          { id: "nike", label: "Nike", hasChildren: true },
          { id: "adidas", label: "Adidas", hasChildren: true },
          { id: "sony", label: "Sony", hasChildren: true },
          { id: "microsoft", label: "Microsoft", hasChildren: true },
          { id: "levi", label: "Levi's", hasChildren: true },
          // { id: "amazon", label: "Amazon Basics", hasChildren: true },
        ],
      },
    ],
    children: {
      apple: {
        title: "Apple",
        items: [
          { id: "iphone", label: "iPhone", hasChildren: true },
          { id: "ipad", label: "iPad", hasChildren: true },
          { id: "mac", label: "Mac", hasChildren: true },
          { id: "watch", label: "Apple Watch", hasChildren: true },
          { id: "airpods", label: "AirPods", hasChildren: true },
        ],
        children: {
          iphone: {
            title: "iPhone",
            items: [
              { id: "iphone15", label: "iPhone 15", hasChildren: false },
              { id: "iphone14", label: "iPhone 14", hasChildren: false },
              { id: "iphone13", label: "iPhone 13", hasChildren: false },
              { id: "iphonese", label: "iPhone SE", hasChildren: false },
              {
                id: "accessories",
                label: "iPhone Accessories",
                hasChildren: false,
              },
            ],
          },
        },
      },
    },
  },
};
