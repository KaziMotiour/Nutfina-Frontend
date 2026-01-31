interface Team {
  name: string;
  image: string;
  title: string;
}

const team: Team[] = [
  {
    image: process.env.NEXT_PUBLIC_URL + "/assets/img/user/motiour.jpeg",
    name: "Kazi Motiour",
    title: "Man with the plan",
  },
  {
    image: process.env.NEXT_PUBLIC_URL + "/assets/img/user/imon_barua.jpg",
    name: "Imon Barua",
    title: "Marketing Manager",
  },
  {
    image: process.env.NEXT_PUBLIC_URL + "/assets/img/user/rafa.jpg",
    name: "Shohag Alamin",
    title: "Digital creator",
  },
  {
    image: process.env.NEXT_PUBLIC_URL + "/assets/img/user/md-shafiur-rahman.jpg",
    name: "DR MD Shafiul Rahman",
    title: "Food engineer",
  },
  {
    image: process.env.NEXT_PUBLIC_URL + "/assets/img/user/rafi.jpeg",
    name: "Iftekhar Uddin",
    title: "In charge of production",
  }
];
export default team;
