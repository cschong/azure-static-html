const { DefaultAzureCredential } = require("@azure/identity");

async function getToken() {
  const credential = new DefaultAzureCredential();
  const scope = "https://cognitiveservices.azure.com/.default";
  const token = await credential.getToken(scope);
  return token.token;
}

module.exports = async function (context, req) {
  try {
    const message = req.body?.message;
    if (!message) {
      context.res = { status: 400, body: { error: "Missing message" } };
      return;
    }

    const url = process.env.FOUNDRY_RESPONSES_URL;
    const model = process.env.FOUNDRY_MODEL || "gpt-4.1-mini";

    const token = await getToken();

    const payload = {
      model,
      input: message
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    const answer =
      data.output_text ||
      data.output?.flatMap(o => o.content?.map(c => c.text)).join("\n") ||
      "No text returned";

    context.res = {
      status: 200,
      body: { answer }
    };

  } catch (err) {
    context.res = {
      status: 500,
      body: { error: String(err) }
    };
  }
};
