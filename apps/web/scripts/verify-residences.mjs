/** Visit each seeded property and navigate every actual A0302 tour station. */
import assert from "node:assert/strict";

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = new URL("../../../", import.meta.url);
process.env.PLAYWRIGHT_BROWSERS_PATH ||= fileURLToPath(new URL(".agent-work/browsers",root));
const { chromium } = await import("@playwright/test");
const evidence = new URL("docs/frontend-definitive/evidence/residences/",root);
await mkdir(evidence,{recursive:true});
const base = "http://127.0.0.1:"+(process.env.ARVESSA_TEST_PORT || "3042");
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:960}});
const report = {browser:browser.version(), viewport:[1440,960], properties:[], rooms:[], errors:[]};
page.on("pageerror", e=>report.errors.push(e.message));
try {
  await page.goto(base);
  await page.waitForFunction(()=>localStorage.getItem("arvessa.demo.v1"));
  const units = await page.evaluate(()=>JSON.parse(localStorage.getItem("arvessa.demo.v1")).properties);
  assert.equal(units.length,84);
  assert.equal(new Set(units.map(p=>p.id)).size,84);
  for (const unit of units) {
    const response = await page.goto(base+"/properties/"+unit.id,{waitUntil:"domcontentloaded"});
    assert.equal(response.status(),200);
    await page.getByRole("heading",{level:1,name:unit.name,exact:true}).waitFor();
    const plan = page.locator(".residence-plan svg").first();
    assert.equal(await plan.getAttribute("aria-label"),`Mặt bằng ${unit.beds} phòng ngủ, ${unit.area} mét vuông`);
    report.properties.push({unit:unit.id,project:unit.projectId,area:unit.area,beds:unit.beds,
      coverage:unit.id==="A0302"?"registered Blender scene":"furnished bedroom-count archetype"});
  }
  await page.goto(base+"/properties/A0302");
  const experience = page.getByRole("region",{name:"Khám phá không gian căn A0302"});
  await experience.getByRole("button",{name:"Tour 360°",exact:true}).click();
  const stations = JSON.parse(await readFile(new URL("apps/web/src/features/spatial/a0302-tour.json",root),"utf8"));
  const labels = {living:"Phòng khách",kitchen:"Bếp & phòng ăn",hall:"Sảnh / lưu thông",balcony:"Loggia",
    "bedroom-1":"Phòng ngủ 1","bedroom-2":"Phòng ngủ 2","bath-1":"Phòng tắm 1","bath-2":"Phòng tắm 2"};
  for(const [id,station] of Object.entries(stations)) {
    await experience.locator(".room-navigation").getByRole("button",{name:labels[id]}).click();
    const canvas = experience.locator('canvas[data-room="'+id+'"]');
    await canvas.waitFor();
    const exits = experience.locator(".tour-hotspot");
    assert.equal(await exits.count(),Object.keys(station.portals).length);
    const destination = Object.keys(station.portals)[0];
    const portal = experience.getByRole("button",{name:"Đi tới "+labels[destination],exact:true,includeHidden:true});
    await canvas.focus();
    for(let turn=0; turn<45 && !(await portal.isVisible());turn++){
      await page.keyboard.press("ArrowLeft");
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    }
    await portal.click({timeout:1500});
    await experience.locator('canvas[data-room="'+destination+'"]').waitFor();
    report.rooms.push({id,adjacent:Object.keys(station.portals),navigatedTo:destination});
  }
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:width===390?844:960});
    await experience.locator(".room-navigation").getByRole("button",{name:"Phòng ngủ 1"}).click();
    await experience.locator('canvas[data-room="bedroom-1"]').waitFor();
    await experience.locator(".residence-view").screenshot({path:fileURLToPath(new URL("tour-"+width+".jpg",evidence)),quality:90});
  }
  assert.deepEqual(report.errors,[]);
} finally {
  await writeFile(new URL("checks.json",evidence),JSON.stringify(report,null,2)+"\n");
  await browser.close();
}
console.log(report.properties.length,"property routes;",report.rooms.length,"room transitions");
