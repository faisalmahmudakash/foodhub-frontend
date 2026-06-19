import HeroPage from "./heroSection/page";
import PopularFoodPage from "./popularFood/page";

export default async function HomePage() {
  return (
    <main>
      <HeroPage />
      <PopularFoodPage />
    </main>
  );
}
