import type { Metadata } from "next";
import { WeddingLandingPage } from "@/components/wedding-page";

export const metadata: Metadata = {
  title: "Lễ Vu Quy - Thuỳ Linh & Tuấn Sơn (Nhà Gái)",
  description:
    "Trân trọng kính mời quý khách đến dự Tiệc Mừng Lễ Vu Quy chung vui cùng gia đình chúng tôi tại Thôn Yên Mỹ, Thuận An, Hà Nội.",
};

export default function HersWeddingPage() {
  return <WeddingLandingPage role="hers" />;
}
