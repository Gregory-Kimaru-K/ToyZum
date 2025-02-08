import CategoryComp from "../components/body/CategoryComp"
import FlashSale from "../components/body/FlashSale"
import FooterComp from "../components/body/FooterComp"
import PopularPoductsComp from "../components/body/PopularPoductsComp"
import PromotionComp from "../components/body/PromotionComp"

function Home() {
  return (
    <div>
      <PromotionComp />
      <FlashSale />
      <CategoryComp />
      <PopularPoductsComp />
      <FooterComp />

    </div>
  )
}

export default Home