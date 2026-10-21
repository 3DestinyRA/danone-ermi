const params = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : ""
);

export const flags = {
  pick: params.get("pick") === "1",
  autoplace: params.get("autoplace") === "1",
  verify: params.get("verify") === "1",
  top: params.get("top") === "1",
  pdfplace: params.get("pdfplace") === "1",
  debug: params.get("debug") === "1",
};
