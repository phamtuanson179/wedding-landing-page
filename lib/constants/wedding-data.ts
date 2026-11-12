export type WeddingRole = "his" | "hers";

export interface FamilySide {
  father: string;
  mother: string;
  address: string;
}

export interface BankInfo {
  key: "groom" | "bride";
  label: string;
  holder: string;
  bank: string;
  bankId: string;
  accountNo: string;
  qrImage?: string;
  zaloPhone: string;
}

export interface VenueInfo {
  id: "his" | "hers";
  sideLabel: string;
  name: string;
  address: string;
  mapsQuery: string;
  mapsUrl: string;
}

export interface TimelineRow {
  side: "his" | "hers";
  title: string;
  dateStr: string;
  subtitle: string;
  timeStr: string;
  timeNote: string;
}

export const TIMELINE_ROWS: TimelineRow[] = [
  {
    side: "hers",
    title: "Lễ Vu Quy",
    dateStr: "Thứ Bảy, 28.11.2026",
    subtitle: "TƯ GIA NHÀ GÁI — THUẬN AN",
    timeStr: "16:30",
    timeNote: "Đón khách & Dùng tiệc",
  },
  {
    side: "his",
    title: "Lễ Thành Hôn",
    dateStr: "Chủ Nhật, 29.11.2026",
    subtitle: "TƯ GIA & NHÀ VĂN HÓA — GIA LÂM",
    timeStr: "10:30",
    timeNote: "Hôn lễ & Tiệc mừng",
  },
];

export const VENUES: Record<WeddingRole, VenueInfo> = {
  his: {
    id: "his",
    sideLabel: "Nhà Trai",
    name: "Trung Tâm Văn Hóa - Thể Thao Xã Dương Xá",
    address: "15/9 Ỷ Lan, Đường Đình, Gia Lâm, Hà Nội",
    mapsQuery: "Trung Tâm Văn Hóa Thể Thao Xã Dương Xá, Gia Lâm, Hà Nội",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Trung+T%C3%A2m+V%C4%83n+H%C3%B3a+Th%E1%BB%83+Thao+X%C3%A3+D%C6%B0%C6%A1ng+X%C3%A1%2C+Gia+L%C3%A2m%2C+H%C3%A0+N%E1%BB%99i",
  },
  hers: {
    id: "hers",
    sideLabel: "Nhà Gái",
    name: "Nhà Văn Hóa Thôn Yên Mỹ",
    address: "Thôn Yên Mỹ, Xã Thuận An, Hà Nội",
    mapsQuery: "Nhà Văn Hóa Thôn Yên Mỹ, Thuận An, Hà Nội",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Nh%C3%A0+V%C4%83n+H%C3%B3a+Th%C3%B4n+Y%C3%AAn+M%E1%BB%B9%2C+Thu%E1%BA%ADn+An%2C+H%C3%A0+N%E1%BB%99i",
  },
};

export interface WeddingSideData {
  role: WeddingRole;
  roleTitle: string;
  badgeLabel: string;
  heroEyebrow: string;
  coupleDisplay: {
    first: string;
    second: string;
  };
  primaryFamily: {
    title: string;
    father: string;
    mother: string;
    address: string;
  };
  secondaryFamily: {
    title: string;
    father: string;
    mother: string;
    address: string;
  };
  announcementTitle: string;
  venue: VenueInfo;
  otherVenue: VenueInfo;
  bank: BankInfo;
  secondaryBank: BankInfo;
}

const BRIDE_BANK: BankInfo = {
  key: "bride",
  label: "Mừng cưới cô dâu",
  holder: "NGUYEN THI THUY LINH",
  bank: "Vietcombank - PGD Phương Mai",
  bankId: "970436",
  accountNo: "0711000294849",
  qrImage: "/images/qr/bride-qr.png",
  zaloPhone: "0987654321", // TODO: Update constant sau
};

const GROOM_BANK: BankInfo = {
  key: "groom",
  label: "Mừng cưới chú rể",
  holder: "PHAM TUAN SON",
  bank: "VietinBank - CN Hai Bà Trưng - Hội Sở",
  bankId: "970415",
  accountNo: "104868957919",
  qrImage: "/images/qr/groom-qr.png",
  zaloPhone: "0123456789", // TODO: Update constant sau
};

export const WEDDING_DATA: Record<WeddingRole, WeddingSideData> = {
  // ===================== DÀNH CHO KHÁCH NHÀ GÁI =====================
  hers: {
    role: "hers",
    roleTitle: "Nhà Gái",
    badgeLabel: "Thiệp Nhà Gái",
    heroEyebrow: "Thiệp cưới Lễ Vu Quy",
    coupleDisplay: {
      first: "Linh",
      second: "Sơn",
    },
    primaryFamily: {
      title: "Nhà Gái",
      father: "Ông Nguyễn Văn Kiên",
      mother: "Bà Nguyễn Thị Thu Hà",
      address: "Thôn Yên Mỹ, xã Thuận An, TP. Hà Nội",
    },
    secondaryFamily: {
      title: "Nhà Trai",
      father: "Ông Phạm Danh Tĩnh",
      mother: "Bà Đặng Thị Uyên",
      address: "Số 2 Ngõ 12 Ỷ Lan, Đường Đình, Gia Lâm, TP. Hà Nội",
    },
    announcementTitle: "TRÂN TRỌNG BÁO TIN LỄ VU QUY CỦA CON CHÚNG TÔI",
    venue: VENUES.hers,
    otherVenue: VENUES.his,
    bank: BRIDE_BANK,
    secondaryBank: GROOM_BANK,
  },

  // ===================== DÀNH CHO KHÁCH NHÀ TRAI =====================
  his: {
    role: "his",
    roleTitle: "Nhà Trai",
    badgeLabel: "Thiệp Nhà Trai",
    heroEyebrow: "Thiệp cưới Lễ Thành Hôn",
    coupleDisplay: {
      first: "Sơn",
      second: "Linh",
    },
    primaryFamily: {
      title: "Nhà Trai",
      father: "Ông Phạm Danh Tĩnh",
      mother: "Bà Đặng Thị Uyên",
      address: "Số 2 Ngõ 12 Ỷ Lan, Đường Đình, Gia Lâm, TP. Hà Nội",
    },
    secondaryFamily: {
      title: "Nhà Gái",
      father: "Ông Nguyễn Văn Kiên",
      mother: "Bà Nguyễn Thị Thu Hà",
      address: "Thôn Yên Mỹ, xã Thuận An, TP. Hà Nội",
    },
    announcementTitle: "TRÂN TRỌNG BÁO TIN LỄ THÀNH HÔN CỦA CON CHÚNG TÔI",
    venue: VENUES.his,
    otherVenue: VENUES.hers,
    bank: GROOM_BANK,
    secondaryBank: BRIDE_BANK,
  },
};

export function getWeddingData(role: WeddingRole = "his"): WeddingSideData {
  return WEDDING_DATA[role] || WEDDING_DATA.his;
}
