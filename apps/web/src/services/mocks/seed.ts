import { DemoState, Project, Property, Role } from "@/domain/types";
export function createSeed(now = Date.now()): DemoState {
  const projects: Project[] = [
    {
      id: "stillwater",
      name: "The Stillwater",
      location: "Thảo Điền · TP. Hồ Chí Minh",
      story:
        "Một khoảng lặng bên dòng chảy thành phố. Những lớp hiên sâu, mặt nước và ánh sáng tạo nên nhịp sống riêng.",
      image: "/images/residence-exterior.svg",
      towers: ["A", "B"],
      floors: 6,
      unitsPerFloor: 4,
      policy: {
        eligible: true,
        amount: 100_000_000,
        holdMinutes: 15,
        terms:
          "Giữ căn mô phỏng trong 15 phút. Yêu cầu hoàn cọc được xét duyệt theo hồ sơ demo; không có giao dịch tiền thật.",
      },
      published: true,
    },
    {
      id: "cedar",
      name: "Cedar House",
      location: "Tây Hồ · Hà Nội",
      story:
        "Kiến trúc thấp tầng, những khoảng sân xanh và vật liệu ấm áp. Một cách sống gần với thiên nhiên.",
      image: "/images/residence-courtyard.svg",
      towers: ["C"],
      floors: 4,
      unitsPerFloor: 4,
      policy: {
        eligible: true,
        amount: 80_000_000,
        holdMinutes: 10,
        terms:
          "Chính sách demo Cedar House: 10 phút giữ căn, 80 triệu đồng đặt cọc mô phỏng, hoàn cọc cần phê duyệt.",
      },
      published: true,
    },
    {
      id: "horizon",
      name: "Horizon Bay",
      location: "Sơn Trà · Đà Nẵng",
      story:
        "Tầm nhìn mở ra đường chân trời. Không gian sống đón gió biển và ánh sáng tự nhiên.",
      image: "/images/residence-exterior.svg",
      towers: ["D"],
      floors: 5,
      unitsPerFloor: 4,
      policy: {
        eligible: false,
        amount: 0,
        holdMinutes: 15,
        terms:
          "Dự án demo chưa mở đặt cọc. Chỉ đăng ký tư vấn hoặc danh sách quan tâm.",
      },
      published: true,
    },
  ];
  const properties: Property[] = [];
  for (const p of projects)
    for (const tower of p.towers)
      for (let floor = 1; floor <= p.floors; floor++)
        for (let number = 1; number <= 4; number++) {
          const id = `${tower}${String(floor).padStart(2, "0")}0${number}`;
          properties.push({
            id,
            projectId: p.id,
            tower,
            floor,
            number,
            name: `${number === 4 ? "Sky residence" : "Garden residence"} ${id}`,
            type: number === 4 ? "Penthouse" : "Căn hộ",
            beds: number === 1 ? 1 : number === 4 ? 3 : 2,
            baths: number === 1 ? 1 : 2,
            area: 65 + number * 18 + floor * 2,
            price: (5.5 + number * 1.1 + floor * 0.18) * 1e9,
            direction: number % 2 ? "Đông Nam" : "Tây Bắc",
            view: number % 2 ? "Sông" : "Vườn",
            availability: floor === 2 && number === 4 ? "SOLD" : "AVAILABLE",
            image: p.image,
          });
        }
  const date = (d: number) =>
    new Date(now + d * 86400000).toISOString().slice(0, 10);
  return {
    version: 1,
    projects,
    properties,
    customers: [
      {
        id: "buyer-demo",
        name: "Minh Anh",
        email: "minhanh@example.test",
        phone: "0900000001",
        budget: 12e9,
        preferences: "2 phòng ngủ, hướng Đông Nam, tầm nhìn sông",
        assignee: "staff-sales",
        notes: "Quan tâm không gian sống yên tĩnh. Hồ sơ hoàn toàn giả lập.",
        consent: true,
      },
      {
        id: "customer-2",
        name: "Hoàng Nam",
        email: "hoangnam@example.test",
        phone: "0900000002",
        budget: 10e9,
        preferences: "Gần công viên, có phòng làm việc",
        assignee: "staff-leader",
        notes: "Muốn tham quan vào cuối tuần.",
        consent: false,
      },
    ],
    leads: [
      {
        id: "lead-1",
        name: "Minh Anh",
        email: "minhanh@example.test",
        phone: "0900000001",
        source: "Website",
        status: "Đã tư vấn",
        priority: "Cao",
        assignee: "staff-sales",
        budget: 12e9,
        notes: "Quan tâm The Stillwater.",
        propertyId: "A0302",
        customerId: "buyer-demo",
        history: [
          { at: now - 86400000, text: "Gửi yêu cầu tư vấn", actor: "Website" },
        ],
      },
      {
        id: "lead-2",
        name: "Hoàng Nam",
        email: "hoangnam@example.test",
        phone: "0900000002",
        source: "Sự kiện",
        status: "Mới",
        priority: "Vừa",
        assignee: "staff-leader",
        budget: 10e9,
        notes: "Ưu tiên tầng thấp.",
        propertyId: "B0101",
        customerId: "customer-2",
        history: [],
      },
    ],
    opportunities: [
      {
        id: "opp-1",
        name: "Minh Anh · The Stillwater",
        customerId: "buyer-demo",
        propertyId: "A0302",
        stage: "Tư vấn",
        amount: properties.find((p) => p.id === "A0302")!.price,
        assignee: "staff-sales",
        expectedDate: date(14),
        nextAction: "Hẹn tham quan căn mẫu",
        lostReason: "",
      },
    ],
    appointments: [
      {
        id: "visit-1",
        customerId: "buyer-demo",
        propertyId: "A0302",
        date: `${date(1)}T09:00`,
        staff: "staff-sales",
        status: "Đã xác nhận",
        feedback: "",
      },
    ],
    reservations: [],
    payments: [],
    contracts: [],
    tasks: [
      {
        id: "task-1",
        title: "Chuẩn bị lịch tham quan cho Minh Anh",
        assignee: "staff-sales",
        customerId: "buyer-demo",
        propertyId: "A0302",
        opportunityId: "opp-1",
        priority: "Cao",
        dueDate: date(1),
        status: "Đang làm",
      },
    ],
    tickets: [
      {
        id: "ticket-1",
        customerId: "buyer-demo",
        title: "Thông tin chỗ đỗ xe",
        priority: "Vừa",
        assignee: "staff-support",
        status: "Đang xử lý",
        messages: [
          {
            at: now,
            text: "Mỗi căn có thể đăng ký chỗ đỗ xe thế nào?",
            actor: "Minh Anh",
          },
        ],
        attachment: "",
        rating: 0,
        createdAt: now,
      },
    ],
    campaigns: [
      {
        id: "campaign-1",
        title: "A quieter perspective",
        audience: "Khách quan tâm The Stillwater",
        source: "Website",
        status: "Bản nháp",
        budget: 50e6,
        content:
          "Khám phá một nhịp sống mới bên sông. Đặt lịch tham quan không gian mẫu.",
        startDate: date(3),
      },
    ],
    employees: (
      [
        ["sales", "Linh Trần", "Kinh doanh"],
        ["leader", "Quang Phạm", "Kinh doanh"],
        ["support", "An Nguyễn", "Chăm sóc"],
        ["legal", "Vy Lê", "Pháp chế"],
        ["finance", "Hà Đỗ", "Tài chính"],
        ["manager", "Minh Vũ", "Điều hành"],
        ["admin", "Huy Bùi", "Vận hành"],
        ["platform", "ARVESSA Demo", "Nền tảng"],
      ] as [Role, string, string][]
    ).map(([role, name, team]) => ({
      id: `staff-${role}`,
      name,
      role,
      team,
      active: true,
    })),
    approvals: [],
    audit: [],
    favorites: ["A0302"],
    comparisons: [],
    savedSearches: [],
    recentlyViewed: [],
    preferences: {
      sound: false,
      volume: 0.15,
      reducedMotion: false,
      density: "comfortable",
      theme: "light",
      recent: false,
      notifications: true,
      widgets: ["pipeline", "visits", "inventory"],
    },
    cms: {
      headline: "Một nhịp sống khác.\nMột tầm nhìn riêng.",
      subtitle: "Những không gian được tuyển chọn cho cách bạn muốn sống.",
      featuredProject: "stillwater",
      company: "ARVESSA Demo Studio",
      policy:
        "Nội dung và chính sách trên nền tảng này chỉ phục vụ trình diễn, không phải đề nghị giao dịch.",
      features: ["discovery", "explorer", "reservations"],
    },
    processed: {},
    waitlist: [],
  };
}
