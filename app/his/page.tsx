import type { Metadata } from "next";
import { WeddingLandingPage } from "@/components/wedding-page";

export const metadata: Metadata = {
  title: "Lễ Thành Hôn - Tuấn Sơn & Thuỳ Linh (Nhà Trai)",
  description:
    "Trân trọng kính mời quý khách đến dự Lễ Thành Hôn & Tiệc Cưới chung vui cùng gia đình chúng tôi tại Gia Lâm, Hà Nội.",
};

export default function HisWeddingPage() {
  return <WeddingLandingPage role="his" />;
}
