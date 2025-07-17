'use client'
import {
  Footer,
  Header,
  Hero,
  HomeExperience,
  HomeProjects,
  Socmed,
  Stacks,
} from "../components";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Home() {

  return (
    <div className="w-full overflow-x-hidden">
      <Header />
      <Hero />
      <Socmed />
      <HomeProjects />
      <HomeExperience />
      <Stacks />
      <Footer />
    </div>
  );
}

export default Home;
