import { describe, it, expect } from "vitest";
import { residenceLayout } from "../src/features/spatial/residence-layout";
describe("residence spatial contract", () => {
  for (const beds of [1, 2, 3])
    it(`${beds} bedroom layout conserves area and has no overlapping rooms`, () => {
      const p = residenceLayout(beds, 107);
      expect(p.rooms.filter((r) => r.kind === "bedroom")).toHaveLength(beds);
      expect(p.rooms.filter((r) => r.kind === "bath")).toHaveLength(
        beds === 1 ? 1 : 2,
      );
      expect(p.rooms.reduce((s, r) => s + r.area, 0)).toBeCloseTo(107, 5);
      for (const r of p.rooms) {
        expect(r.area).toBeGreaterThan(0);
        expect(r.x + r.w).toBeLessThanOrEqual(p.width + 1e-6);
        expect(r.z + r.d).toBeLessThanOrEqual(p.depth + 1e-6);
        for (const other of p.rooms) {
          if (r === other) continue;
          const overlapX =
              Math.min(r.x + r.w, other.x + other.w) - Math.max(r.x, other.x),
            overlapZ =
              Math.min(r.z + r.d, other.z + other.d) - Math.max(r.z, other.z);
          expect(overlapX > 1e-6 && overlapZ > 1e-6).toBe(false);
        }
      }
      for (const id of ["living", "kitchen", "bedroom-1", "balcony"])
        expect(p.rooms.some((r) => r.id === id)).toBe(true);
    });
});
