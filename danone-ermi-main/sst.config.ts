/// <reference path="./.sst/platform/config.d.ts" />
const { assertProjectConfig, projectConfig } = require("./project.config.cjs");

export default $config({
  app(input) {
    assertProjectConfig();

    return {
      name: projectConfig.appName,
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      home: "aws",
      providers: {
        aws: {
          profile: process.env.CI ? undefined : process.env.AWS_PROFILE,
          region: process.env.AWS_REGION || "us-east-1",
        },
      },
    };
  },
  async run() {
    const { site } = await import("./infra/web");

    return {
      siteUrl: site.url,
    };
  },
});
