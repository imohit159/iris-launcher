import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const architectures = ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"];
const run = (command, args, options = {}) =>
  execFileSync(command, args, { cwd: root, stdio: "inherit", ...options });
const capture = (command, args) =>
  execFileSync(command, args, { maxBuffer: 128 * 1024 * 1024 });

function verify(apk) {
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!sdk) throw new Error("Set ANDROID_HOME to your Android SDK directory.");
  const versions = readdirSync(path.join(sdk, "build-tools"))
    .filter((version) => /^\d+\.\d+\.\d+$/.test(version))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const tools = path.join(sdk, "build-tools", versions.at(-1) || "missing");
  const entries = capture("unzip", ["-Z1", apk]).toString().trim().split("\n");
  const libraries = entries.filter((entry) => /^lib\/[^/]+\/[^/]+\.so$/.test(entry));
  const expected = new Set(libraries.map((entry) => entry.split("/")[2]));
  if (!expected.has("libreactnative.so") || !expected.has("libappmodules.so")) {
    throw new Error("APK is missing the React Native application libraries.");
  }
  for (const abi of architectures) {
    for (const library of expected) {
      if (!libraries.includes(`lib/${abi}/${library}`)) {
        throw new Error(`APK is missing ${abi}/${library}; refusing a partial release.`);
      }
    }
  }
  // ZIP alignment alone cannot detect incompatible precompiled native libraries.
  for (const entry of libraries.filter((name) => /lib\/(arm64-v8a|x86_64)\//.test(name))) {
    const elf = capture("unzip", ["-p", apk, entry]);
    if (elf.readUInt32BE(0) !== 0x7f454c46 || elf[4] !== 2 || elf[5] !== 1) {
      throw new Error(`Unexpected ELF format: ${entry}`);
    }
    const start = Number(elf.readBigUInt64LE(32));
    const size = elf.readUInt16LE(54);
    const count = elf.readUInt16LE(56);
    for (let index = 0; index < count; index++) {
      const header = start + index * size;
      if (elf.readUInt32LE(header) !== 1) continue;
      const offset = elf.readBigUInt64LE(header + 8);
      const address = elf.readBigUInt64LE(header + 16);
      const alignment = elf.readBigUInt64LE(header + 48);
      if (alignment < 16384n || offset % 16384n !== address % 16384n) {
        throw new Error(`Native library does not support 16 KB pages: ${entry}`);
      }
    }
  }
  run(path.join(tools, "zipalign"), ["-c", "-P", "16", "4", apk]);
  run(path.join(tools, "apksigner"), ["verify", "--verbose", apk]);
  const metadata = capture(path.join(tools, "aapt"), ["dump", "badging", apk]).toString();
  console.log(metadata.split("\n").filter((line) => /^(package:|sdkVersion:|targetSdkVersion:|native-code:)/.test(line)).join("\n"));
  console.log("Verified all four ABIs, native library completeness, 16 KB alignment, and APK signature.");
}

if (process.argv[2] === "--verify") {
  if (!process.argv[3]) throw new Error("Usage: pnpm android:verify-apk /absolute/path/to.apk");
  verify(path.resolve(process.argv[3]));
} else {
  run("pnpm", ["exec", "expo", "prebuild", "--platform", "android", "--no-install"]);
  run("./gradlew", [":app:assembleRelease", `-PreactNativeArchitectures=${architectures.join(",")}`, "--max-workers=2", "-Dorg.gradle.jvmargs=-Xmx2g -XX:MaxMetaspaceSize=1g", "--console=plain"], {
    cwd: path.join(root, "android"),
    env: { ...process.env, NODE_ENV: "production" },
  });
  const apk = path.join(root, "android/app/build/outputs/apk/release/app-release.apk");
  verify(apk);
  const { version } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const destination = path.join(root, "dist", `iris-launcher-${version}-universal.apk`);
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(apk, destination);
  console.log(`Universal APK: ${destination}`);
}
