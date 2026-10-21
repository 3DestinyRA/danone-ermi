const REQUIRED_PLACEHOLDER_PREFIX = "REPLACE_WITH_";

const projectConfig = {
  appName: "danone-ermi-safety-viewer",
  domains: {
    staging: "staging-danone-ermi.3destinyra.com",
    production: "danone-ermi.3destinyra.com",
  },
};

function assertRequiredValues(stage, values) {
  const placeholders = values
    .filter(([, value]) => !value || value.startsWith(REQUIRED_PLACEHOLDER_PREFIX))
    .map(([key]) => key);

  if (placeholders.length > 0) {
    throw new Error(
      `Missing deploy config for ${stage}: ${placeholders.join(", ")}`
    );
  }
}

function assertProjectConfig() {
  assertRequiredValues("app", [["appName", projectConfig.appName]]);
}

function assertDeployConfig(stage) {
  if (stage === "staging") {
    assertRequiredValues(stage, [
      ["appName", projectConfig.appName],
      ["domains.staging", projectConfig.domains.staging],
    ]);
    return;
  }

  if (stage === "production") {
    assertRequiredValues(stage, [
      ["appName", projectConfig.appName],
      ["domains.production", projectConfig.domains.production],
    ]);
    return;
  }

  assertProjectConfig();
}

function getDomainForStage(stage) {
  if (stage === "staging") {
    return projectConfig.domains.staging;
  }

  if (stage === "production") {
    return projectConfig.domains.production;
  }

  return undefined;
}

module.exports = {
  projectConfig,
  assertProjectConfig,
  assertDeployConfig,
  getDomainForStage,
};
