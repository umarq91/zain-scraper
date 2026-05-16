/**
 * @param {{ productName: string, availableSizes: string[], productUrl: string, imageUrl: string | null }} opts
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildRestockEmail({ productName, availableSizes, productUrl, imageUrl }) {
  const year = new Date().getFullYear();

  const sizeLabel =
    availableSizes.length === 1
      ? `Size ${availableSizes[0]} is back`
      : `Sizes ${availableSizes.join(", ")} are back`;

  const sizePills = availableSizes
    .map(
      (s) =>
        `<span style="display:inline-block;font-family:monospace,'Courier New',monospace;font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;padding:7px 16px;background:#F26B1F;color:#ffffff;border-radius:2px;margin:0 6px 6px 0;">${s}</span>`
    )
    .join("");

  const imageBlock = imageUrl
    ? `<tr>
        <td style="padding:28px 40px 0;text-align:center;">
          <img src="${imageUrl}" alt="${productName}" width="180" height="180"
            style="display:block;margin:0 auto;max-width:180px;height:auto;object-fit:contain;border:1px solid #E4E4E0;background:#FAFAF7;" />
        </td>
      </tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${sizeLabel} — ${productName}</title>
</head>
<body style="margin:0;padding:0;background:#F0F0EC;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#F0F0EC;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:580px;width:100%;background:#ffffff;border:2px solid #0A0A0A;">

          <!-- Accent bar -->
          <tr>
            <td style="background:#F26B1F;height:5px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:22px 40px 20px;border-bottom:1px solid #E4E4E0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:#0A0A0A;letter-spacing:-0.02em;line-height:1;">
                      StockWatch
                    </span><br />
                    <span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.14em;color:#2A2A2A;">
                      your size radar
                    </span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.14em;color:#2A2A2A;border:1px solid #E4E4E0;padding:4px 8px;">
                      Restock Alert
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status badge -->
          <tr>
            <td style="padding:32px 40px 0;">
              <span style="display:inline-block;font-family:monospace,'Courier New',monospace;font-size:10px;font-weight:bold;letter-spacing:0.16em;text-transform:uppercase;color:#F26B1F;border:1.5px solid #F26B1F;padding:5px 12px;">
                &#10003; &nbsp;Back in Stock
              </span>
            </td>
          </tr>

          <!-- Product name -->
          <tr>
            <td style="padding:18px 40px 0;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:bold;color:#0A0A0A;letter-spacing:-0.025em;line-height:1.05;">
                ${productName}
              </h1>
            </td>
          </tr>

          <!-- Size label -->
          <tr>
            <td style="padding:10px 40px 0;">
              <p style="margin:0;font-family:monospace,'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#2A2A2A;">
                ${sizeLabel} in stock
              </p>
            </td>
          </tr>

          ${imageBlock}

          <!-- Size pills -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 10px;font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.14em;color:#2A2A2A;">
                Available now
              </p>
              ${sizePills}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:28px 40px 0;">
              <div style="border-top:1px solid #E4E4E0;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Copy + CTA -->
          <tr>
            <td style="padding:24px 40px 40px;">
              <p style="margin:0 0 24px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;color:#2A2A2A;line-height:1.6;">
                Stock moves fast — popular sizes can sell out again in minutes.
                Head to the product page now and complete your purchase.
              </p>

              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#F26B1F;border:2px solid #0A0A0A;">
                    <a href="${productUrl}" target="_blank"
                      style="display:inline-block;font-family:monospace,'Courier New',monospace;font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;padding:14px 28px;text-decoration:none;">
                      Buy Now &nbsp;&#8594;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-family:monospace,'Courier New',monospace;font-size:10px;color:#2A2A2A;">
                Or copy:
                <a href="${productUrl}" style="color:#F26B1F;word-break:break-all;">${productUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px;border-top:1px solid #E4E4E0;background:#FAFAF7;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#0A0A0A;">
                      &copy; ${year} StockWatch
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#2A2A2A;">
                      You&apos;re watching this product
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  const text = `BACK IN STOCK — ${productName}

${sizeLabel} in stock.

Buy now: ${productUrl}

---
StockWatch · your size radar
© ${year} StockWatch`;

  const subject = `${sizeLabel} — ${productName}`;

  return { subject, html, text };
}
