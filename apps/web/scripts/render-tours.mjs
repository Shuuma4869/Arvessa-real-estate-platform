// Reproduce original ARVESSA panoramas from the shared furnished model; no remote assets.
import { chromium } from "@playwright/test";
import ts from "typescript";
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
const app = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(app, "public/images/tours");
const originals = path.resolve(app, "../../assets/residence-tours");
await mkdir(output, { recursive: true });
await mkdir(originals, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.route("http://arvessa-render.local/**", async (route) => {
  const pathname = new URL(route.request().url()).pathname;
  if (pathname === "/")
    return route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><title>ARVESSA panorama renderer</title><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script><script type="module" src="/render.js"></script>`,
    });
  if (pathname === "/render.js")
    return route.fulfill({
      contentType: "text/javascript",
      body: renderSource,
    });
  if (["/interior-model.js", "/residence-layout.js"].includes(pathname)) {
    const source = await readFile(
      path.join(
        app,
        "src/features/spatial",
        pathname.slice(1).replace(".js", ".ts"),
      ),
      "utf8",
    );
    return route.fulfill({
      contentType: "text/javascript",
      body: ts.transpileModule(source, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
        },
      }).outputText,
    });
  }
  if (/^\/spatial-flagships\/library\/[a-zA-Z0-9_.-]+$/.test(pathname)) {
    return route.fulfill({path: path.join(app,"public",pathname), contentType:pathname.endsWith(".glb")?"model/gltf-binary":"image/webp"});
  }
  const root = path.join(app, "node_modules/three");
  const file = path.resolve(root, pathname.replace(/^\/three\//, ""));
  if (pathname.startsWith("/three/") && file.startsWith(root + path.sep))
    return route.fulfill({
      contentType: "text/javascript",
      body: await readFile(file),
    });
  return route.fulfill({ status: 404, body: "Not found" });
});
const renderSource = `import * as THREE from 'three';import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';import {Sky} from 'three/addons/objects/Sky.js';import{createInterior}from'/interior-model.js';import{residenceLayout}from'/residence-layout.js';
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(512,256);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;document.body.append(renderer.domElement);
const pmrem=new THREE.PMREMGenerator(renderer),envRoom=new RoomEnvironment(),env=pmrem.fromScene(envRoom,.04);envRoom.dispose();pmrem.dispose();
window.renderRoom=async(beds,id)=>{const layout=residenceLayout(beds,100),model=createInterior(layout,true),scene=new THREE.Scene();await model.ready;scene.background=new THREE.Color(0xc0d6d2);const sky=new Sky();sky.scale.setScalar(100);sky.material.uniforms.turbidity.value=4;sky.material.uniforms.rayleigh.value=1.2;sky.material.uniforms.sunPosition.value.set(-.4,.35,.8);scene.add(sky);scene.environment=env.texture;scene.environmentIntensity=.5;scene.add(model.root);scene.add(new THREE.HemisphereLight(0xffefcf,0x66705a,1.3));const sun=new THREE.DirectionalLight(0xffdeb1,1.8);sun.position.set(-8,16,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:60});sun.shadow.normalBias=.06;scene.add(sun);
// Warm fill sources are physical lights, shared geometry remains unchanged.
for(const r of layout.rooms.filter(r=>r.kind!=='balcony')){const l=new THREE.PointLight(0xffe8c3,4,12,2);l.position.set(r.x+r.w/2-layout.width/2,2.45,r.z+r.d/2-layout.depth/2);scene.add(l)}
const room=layout.rooms.find(r=>r.id===id);const cube=new THREE.WebGLCubeRenderTarget(2048,{type:THREE.HalfFloatType});const camera=new THREE.CubeCamera(.05,150,cube);camera.position.set(room.x+room.w/2-layout.width/2,1.55,room.z+room.d/2-layout.depth/2);scene.add(camera);camera.update(renderer,scene);
const target=new THREE.WebGLRenderTarget(4096,2048,{type:THREE.UnsignedByteType});target.texture.colorSpace=THREE.SRGBColorSpace;
const shader=new THREE.ShaderMaterial({uniforms:{cube:{value:cube.texture}},vertexShader:'varying vec2 uvOut;void main(){uvOut=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform samplerCube cube;varying vec2 uvOut;void main(){float theta=(uvOut.x-.5)*6.28318530718;float phi=(1.-uvOut.y)*3.14159265359;vec3 d=vec3(sin(theta)*sin(phi),cos(phi),-cos(theta)*sin(phi));gl_FragColor=textureCube(cube,d);\\n#include <tonemapping_fragment>\\n#include <colorspace_fragment>\\n}'});
const output=new THREE.Scene(),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),shader);output.add(quad);renderer.setRenderTarget(target);renderer.render(output,new THREE.Camera());const pixels=new Uint8Array(4096*2048*4);renderer.readRenderTargetPixels(target,0,0,4096,2048,pixels);renderer.setRenderTarget(null);let binary='';for(let i=0;i<pixels.length;i+=8192)binary+=String.fromCharCode(...pixels.subarray(i,i+8192));const data=btoa(binary);target.dispose();cube.dispose();quad.geometry.dispose();shader.dispose();model.dispose();sky.geometry.dispose();sky.material.dispose();sun.shadow.map?.dispose();return{data,camera:camera.position.toArray()}};window.ready=true;`;
await page.goto("http://arvessa-render.local/");
await page.waitForFunction(() => window.ready);
const catalog = [];
for (const beds of [1, 2, 3])
  for (const room of ["living", "kitchen", "bedroom-1", "balcony"]) {
    const result = await page.evaluate(
      ([beds, room]) => window.renderRoom(beds, room),
      [beds, room],
    );
    const raw = Buffer.from(result.data, "base64");
    const source = sharp(raw, {
      raw: { width: 4096, height: 2048, channels: 4 },
    }).flip();
    const name = `${beds}br-${room}`;
    await source
      .clone()
      .png()
      .toFile(path.join(originals, `${name}.png`));
    const webp = await source.webp({ quality: 88 }).toBuffer();
    await writeFile(path.join(output, `${name}.webp`), webp);
    catalog.push({
      name,
      beds,
      room,
      width: 4096,
      height: 2048,
      projection: "equirectangular",
      camera: result.camera,
      source: "Original ARVESSA shared interior-model.ts + residence-layout.ts",
      sha256: createHash("sha256").update(webp).digest("hex"),
      bytes: webp.length,
    });
    console.log(name, webp.length);
  }
await browser.close();
await writeFile(
  path.join(originals, "catalog.json"),
  JSON.stringify(catalog, null, 2) + "\n",
);
if (errors.length) throw Error(errors.join("\n"));
console.log("12 original 2:1 panoramas rendered.");
