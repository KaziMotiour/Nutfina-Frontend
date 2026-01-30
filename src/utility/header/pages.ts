interface Page {
  name: string;
  href: string;
}

const pages: Page[] = [
  {
    name: "Cart",
    href: "/cart",
  },
  {
    name: "Checkout",
    href: "/checkout",
  },
  {
    name: "Address",
    href: "/address",
  },
  {
    name: "Track Order",
    href: "/track-order",
  },
  {
    name: "Orders",
    href: "/orders",
  },
  // {
  //   name: "About Us",
  //   href: "/about-us",
  // },
  // {
  //   name: "Contact Us",
  //   href: "/contact-us",
  // },  
  // {
  //   name: "Compare",
  //   href: "/compare",
  // },
  // {
  //   name: "FAQ",
  //   href: "/faq",
  // },
  // {
  //   name: "Login",
  //   href: "/login",
  // },
];
export default pages;
