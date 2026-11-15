"use client";
import { ProjectGovernance } from "./management/project-governance";
import { WaitlistPanel } from "./reservation/waitlist";
import { Scope } from "@/domain/types";
import Dashboard from "./crm/dashboard";
import { Leads, Customers } from "./crm/leads-customers";
import { Pipeline, Inventory } from "./crm/pipeline-inventory";
import {
  Appointments,
  Tasks,
  Support,
  Marketing,
  Contracts,
} from "./crm/work-records";
import { Reports } from "./crm/reports";
import { ReservationList, PaymentList } from "./reservation/reservation";
import { Personal, MyProperties } from "./buyer/personal";
import { Approvals, Teams, Security, Cms } from "./management/management";
export default function WorkspacePage({
  scope,
  module,
}: {
  scope: Scope;
  module: string;
}) {
  if (module === "dashboard") return <Dashboard scope={scope} />;
  switch (module) {
    case "leads":
      return <Leads />;
    case "customers":
      return <Customers />;
    case "pipeline":
      return <Pipeline />;
    case "inventory":
      return (
        <>
          {scope === "management" && <ProjectGovernance />}
          <Inventory />
        </>
      );
    case "appointments":
      return <Appointments />;
    case "reservations":
      return (
        <>
          <ReservationList />
          <WaitlistPanel />
        </>
      );
    case "payments":
      return <PaymentList />;
    case "contracts":
      return <Contracts />;
    case "tasks":
      return <Tasks />;
    case "support":
      return <Support />;
    case "marketing":
      return <Marketing />;
    case "reports":
      return <Reports />;
    case "personal":
    case "profile":
      return <Personal />;
    case "properties":
      return <MyProperties />;
    case "approvals":
      return <Approvals />;
    case "teams":
      return <Teams />;
    case "security":
      return <Security />;
    case "cms":
      return <Cms />;
    case "settings":
      return <Cms settings />;
    case "finance":
      return (
        <>
          <PaymentList />
          <section style={{ marginTop: 30 }}>
            <Contracts />
          </section>
        </>
      );
    default:
      return null;
  }
}
