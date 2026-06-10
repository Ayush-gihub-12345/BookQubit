const D1_QUERY_ENDPOINT = (accountId, databaseId) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

const getD1Config = () => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_D1_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    throw new Error(
      "Missing Cloudflare D1 env vars: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_API_TOKEN",
    );
  }

  return { accountId, databaseId, apiToken };
};

export const queryD1 = async (sql, params = []) => {
  const { accountId, databaseId, apiToken } = getD1Config();

  const response = await fetch(D1_QUERY_ENDPOINT(accountId, databaseId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const message =
      payload?.errors?.map((error) => error.message).join("; ") ||
      `Cloudflare D1 request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload.result?.[0]?.results || [];
};

export const normalizeBookRow = (row) => {
  if (!row) return null;

  let data = {};
  if (typeof row.data === "string" && row.data.trim()) {
    try {
      data = JSON.parse(row.data);
    } catch {
      data = {};
    }
  }

  const { data: _data, ...columns } = row;
  const book = { ...data, ...columns };

  if (typeof book.tags === "string") {
    try {
      book.tags = JSON.parse(book.tags);
    } catch {
      book.tags = book.tags ? [book.tags] : [];
    }
  }

  if (!Array.isArray(book.tags)) book.tags = [];

  book.buttons = {
    ...(book.buttons || {}),
    knowMore: `/${book.language || "en"}/books/${book.slug || book.id}`,
    getBook: book.buttons?.getBook || "#",
    readSummary: book.buttons?.readSummary || "#summary",
    listenAudiobook: book.buttons?.listenAudiobook || "#",
  };

  return book;
};
