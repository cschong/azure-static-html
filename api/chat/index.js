module.exports = async function (context, req) {
  try {
    const message = req.body?.message;
    if (!message) {
      context.res = { status: 400, body: { error: "Missing message" } };
      return;
    }

    const url = process.env.FOUNDRY_RESPONSES_URL;
    const model = process.env.FOUNDRY_MODEL || "gpt-4.1-mini";
    const apiKey = process.env.FOUNDRY_API_KEY;

    if (!apiKey) {
      throw new Error("FOUNDRY_API_KEY is not set in application settings");
    }

    const payload = {
      model,
      input: message
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        // ⬇️ THIS is the key change
        "api-key": apiKey
        // If this fails, we’ll switch to Authorization: Bearer <key>
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    if (!r.ok) {
      context.res = {
        status: r.status,
        body: { error: "Upstream error", details: data }
      };
      return;
    }

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

    context.log("Running in SWA function");
  }
};
