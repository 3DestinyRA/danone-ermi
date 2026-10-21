const { assertDeployConfig, getDomainForStage } = require("../project.config.cjs");

const domainName = getDomainForStage($app.stage);

if (!$dev && !domainName) {
  throw new Error(`No domain configured for SST stage "${$app.stage}".`);
}

if (!$dev) {
  assertDeployConfig($app.stage);
}

export const site = new sst.aws.StaticSite("SafetyViewerSite", {
  path: ".",
  build: {
    command: "npm run build",
    output: "dist",
  },
  assets: {
    fileOptions: [
      {
        files: "**",
        cacheControl: "max-age=31536000,public,immutable",
      },
      {
        files: "**/*.html",
        cacheControl: "max-age=0,no-cache,no-store,must-revalidate",
      },
      {
        files: "models/**/*.glb",
        contentType: "model/gltf-binary",
        cacheControl: "max-age=31536000,public,immutable",
      },
      {
        files: ["draco/**/*.wasm", "basis/**/*.wasm"],
        contentType: "application/wasm",
        cacheControl: "max-age=31536000,public,immutable",
      },
      {
        files: ["images/**/*", "draco/**/*", "basis/**/*"],
        cacheControl: "max-age=31536000,public,immutable",
      },
    ],
  },
  domain: $dev
    ? undefined
    : {
        name: domainName as string,
        dns: sst.aws.dns(),
      },
});
