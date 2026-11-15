import { Entity, Preferences, Role, Scenario } from "@/domain/types";
export type Command =
  | {
      type: "inquiry";
      name: string;
      email: string;
      message: string;
      propertyId: string;
    }
  | {
      type: "waitlist";
      propertyId: string;
      customerId: string;
      contacted?: boolean;
    }
  | { type: "project"; id: string; values: Record<string, string> }
  | { type: "merge"; sourceId: string; targetId: string }
  | {
      type: "hold";
      propertyId: string;
      buyerId: string;
      price: number;
      accepted: boolean;
      key: string;
      scenario: Scenario;
    }
  | { type: "reservation"; id: string; action: "cancel" | "extend" | "expire" }
  | {
      type: "pay";
      id: string;
      method: string;
      accepted: boolean;
      key: string;
      result: "success" | "failed" | "pending";
    }
  | { type: "reconcile"; id: string; confirmed: boolean }
  | { type: "refund"; id: string; reason: string }
  | { type: "adjustment"; id: string; reason: string; amount: number }
  | { type: "approve"; id: string; approve: boolean; reason: string }
  | {
      type: "request";
      kind: "price" | "status" | "contract" | "campaign";
      id: string;
      reason: string;
      value: string;
    }
  | { type: "save"; entity: Entity; values: Record<string, string> }
  | { type: "delete"; entity: Entity; id: string }
  | { type: "convert"; id: string }
  | { type: "stage"; id: string; stage: string; reason: string }
  | {
      type: "contract";
      id: string;
      action: "draft" | "review" | "sign" | "comment";
      text?: string;
    }
  | { type: "ticket-message"; id: string; text: string }
  | { type: "favorite" | "compare" | "view"; id: string }
  | { type: "search"; name: string; query: string }
  | { type: "preferences"; values: Partial<Preferences> }
  | { type: "cms"; values: Record<string, string> }
  | { type: "transfer"; from: string; to: string }
  | { type: "reset" };
export interface Actor {
  role: Role;
  id: string;
}
export interface CommandResult {
  id: string;
  message: string;
}
export interface DemoAdapter {
  execute(command: Command, actor: Actor): Promise<CommandResult>;
}
