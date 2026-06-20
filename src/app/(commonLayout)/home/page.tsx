import HeroPage from "./heroSection/page";
import PopularFoodPage from "./popularFood/page";
import ShortMenuPage from "./shortMenu/page";

export default async function HomePage() {
  return (
    <main>
      <HeroPage />
      <PopularFoodPage />
      <ShortMenuPage />
    </main>
  );
}
