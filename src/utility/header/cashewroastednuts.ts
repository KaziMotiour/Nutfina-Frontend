interface CashewRoastedNuts {
    name: string;
    href: string;
}
  
const CashewRoastedNuts: CashewRoastedNuts[] = [
    {
      name: "Salted",
      href: "/products/?category=roasted-nuts",
    },
    {
      name: "Honey black paper",
      href: "/products/?category=roasted-nuts",
    },
    {
      name: "Mix masala",
      href: "/products/?category=roasted-nuts",
    },
];

const SaltedRoastedNuts: CashewRoastedNuts[] = [
  {
    name: "Salted Cashew",
    href: "/products/?category=roasted-nuts",
  },
  {
    name: "Salted Almond",
    href: "/products/?category=roasted-nuts",
  },
  {
    name: "Salted Peanuts",
    href: "/products/?category=roasted-nuts",
  },
];

const NutPowder = [
    {
        name: "Cashew Nut Powder",
        href: "/products/?category=nutrition-powder",
    },
    {
        name: "Almond Nut Powder",
        href: "/products/?category=nutrition-powder",
    },
]


export { CashewRoastedNuts, NutPowder, SaltedRoastedNuts };
  