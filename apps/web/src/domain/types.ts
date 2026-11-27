export const roles = [
  "buyer",
  "sales",
  "leader",
  "support",
  "legal",
  "finance",
  "manager",
  "admin",
  "platform",
] as const;
export type Role = (typeof roles)[number];
export const roleNames: Record<Role, string> = {
  buyer: "Khách hàng",
  sales: "Chuyên viên kinh doanh",
  leader: "Trưởng nhóm",
  support: "Chăm sóc khách hàng",
  legal: "Pháp chế",
  finance: "Tài chính",
  manager: "Giám đốc kinh doanh",
  admin: "Quản trị công ty",
  platform: "Quản trị nền tảng",
};
export type Scope = "buyer" | "crm" | "management";
export interface Session {
  id: string;
  name: string;
  role: Role;
  expiresAt: number;
}
export interface Project {
  id: string;
  name: string;
  location: string;
  story: string;
  image: string;
  towers: string[];
  floors: number;
  unitsPerFloor: number;
  policy: {
    eligible: boolean;
    amount: number;
    holdMinutes: number;
    terms: string;
  };
  published: boolean;
}
export type Availability = "AVAILABLE" | "HELD" | "RESERVED" | "SOLD";
export interface Property {
  id: string;
  projectId: string;
  tower: string;
  floor: number;
  number: number;
  name: string;
  type: string;
  beds: number;
  baths: number;
  area: number;
  price: number;
  direction: string;
  view: string;
  availability: Availability;
  image: string;
}
export type ReservationStatus =
  | "HOLD_REQUESTED"
  | "HOLD_CONFLICT"
  | "TEMPORARILY_HELD"
  | "HOLD_EXPIRED"
  | "HOLD_CANCELLED"
  | "EXTENSION_REQUESTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_FAILED"
  | "PAYMENT_VERIFICATION"
  | "DEPOSIT_CONFIRMED"
  | "CONTRACT_PENDING"
  | "CONTRACT_COMPLETED";
export interface TimelineEvent {
  at: number;
  text: string;
  actor: string;
}
export interface Reservation {
  id: string;
  propertyId: string;
  buyerId: string;
  status: ReservationStatus;
  price: number;
  amount: number;
  expiresAt: number;
  history: TimelineEvent[];
}
export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  status:
    | "SUBMITTED"
    | "FAILED"
    | "VERIFICATION"
    | "CONFIRMED"
    | "REFUND_REQUESTED"
    | "REFUNDED";
  method: string;
  createdAt: number;
  history: TimelineEvent[];
}
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  priority: string;
  assignee: string;
  budget: number;
  notes: string;
  propertyId: string;
  customerId?: string;
  history: TimelineEvent[];
}
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: number;
  preferences: string;
  assignee: string;
  notes: string;
  consent: boolean;
}
export interface Opportunity {
  id: string;
  name: string;
  customerId: string;
  propertyId: string;
  stage: string;
  amount: number;
  assignee: string;
  expectedDate: string;
  nextAction: string;
  lostReason: string;
}
export interface Appointment {
  id: string;
  customerId: string;
  propertyId: string;
  date: string;
  staff: string;
  status: string;
  feedback: string;
}
export interface Contract {
  id: string;
  reservationId: string;
  customerId: string;
  status: string;
  version: number;
  checklist: string[];
  comment: string;
  attachment: string;
  dueDate: string;
  versions?: {
    version: number;
    at: number;
    comment: string;
    attachment: string;
    checklist: string[];
  }[];
}
export interface Waitlist {
  id: string;
  propertyId: string;
  customerId: string;
  status: "WAITING" | "CONTACTED";
  createdAt: number;
}
export interface Task {
  id: string;
  title: string;
  assignee: string;
  customerId: string;
  propertyId: string;
  opportunityId: string;
  priority: string;
  dueDate: string;
  status: string;
}
export interface Ticket {
  id: string;
  customerId: string;
  title: string;
  priority: string;
  assignee: string;
  status: string;
  messages: TimelineEvent[];
  attachment: string;
  rating: number;
  createdAt: number;
}
export interface Campaign {
  id: string;
  title: string;
  audience: string;
  source: string;
  status: string;
  budget: number;
  content: string;
  startDate: string;
}
export interface Employee {
  id: string;
  name: string;
  role: Role;
  team: string;
  active: boolean;
}
export interface Approval {
  id: string;
  kind:
    | "extension"
    | "refund"
    | "adjustment"
    | "price"
    | "contract"
    | "campaign"
    | "status";
  recordId: string;
  reason: string;
  value: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedBy: Role;
  history: TimelineEvent[];
}
export interface Audit {
  id: string;
  at: number;
  actor: Role;
  actorId?: string;
  action: string;
  recordId: string;
}
export interface Preferences {
  sound: boolean;
  volume: number;
  reducedMotion: boolean;
  density: "comfortable" | "compact";
  theme: "light" | "dark";
  recent: boolean;
  notifications: boolean;
  widgets: string[];
}
export interface DemoState {
  version: 1;
  projects: Project[];
  properties: Property[];
  leads: Lead[];
  customers: Customer[];
  opportunities: Opportunity[];
  appointments: Appointment[];
  reservations: Reservation[];
  payments: Payment[];
  contracts: Contract[];
  tasks: Task[];
  tickets: Ticket[];
  campaigns: Campaign[];
  employees: Employee[];
  approvals: Approval[];
  audit: Audit[];
  favorites: string[];
  comparisons: string[];
  savedSearches: { name: string; query: string }[];
  recentlyViewed: string[];
  preferences: Preferences;
  cms: {
    headline: string;
    subtitle: string;
    featuredProject: string;
    company: string;
    policy: string;
    features: string[];
  };
  processed: Record<string, string>;
  waitlist: Waitlist[];
}
export type Entity =
  | "leads"
  | "customers"
  | "opportunities"
  | "appointments"
  | "tasks"
  | "tickets"
  | "campaigns"
  | "employees"
  | "contracts";
export type EntityRecord =
  | Lead
  | Customer
  | Opportunity
  | Appointment
  | Task
  | Ticket
  | Campaign
  | Employee
  | Contract;
export type Scenario =
  | "normal"
  | "conflict"
  | "expired"
  | "price-change"
  | "offline"
  | "payment-failed"
  | "payment-pending";
