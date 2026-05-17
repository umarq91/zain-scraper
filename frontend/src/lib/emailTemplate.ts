type RestockEmailOptions = {
  productName: string;
  availableSizes: string[];
  productUrl: string;
  imageUrl: string | null;
};

type EmailParts = {
  subject: string;
  html: string;
  text: string;
};

export function buildRestockEmail(opts: RestockEmailOptions): EmailParts {
  const { productName, availableSizes, productUrl, imageUrl } = opts;
  const year = new Date().getFullYear();

  const sizeLabel =
    availableSizes.length === 1
      ? `Size ${availableSizes[0]} is back`
      : `Sizes ${availableSizes.join(", ")} are back`;

  const sizePills = availableSizes
    .map(
      (s) =>
        `<span style="display:inline-block;font-family:monospace;font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;padding:7px 16px;background:#F26B1F;color:#ffffff;border-radius:2px;margin:0 6px 6px 0;">${s}</span>`
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

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#F0F0EC;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
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
                    </span>
                    <br />
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
                ✓ &nbsp;Back in Stock
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

          <!-- Product image -->
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

          <!-- Body copy + CTA -->
          <tr>
            <td style="padding:24px 40px 40px;">
              <p style="margin:0 0 24px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;color:#2A2A2A;line-height:1.6;">
                Stock moves fast — popular sizes can sell out again in minutes.
                Head to the product page now and complete your purchase.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#F26B1F;border:2px solid #0A0A0A;">
                    <a href="${productUrl}" target="_blank"
                      style="display:inline-block;font-family:monospace,'Courier New',monospace;font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;padding:14px 28px;text-decoration:none;">
                      Buy Now &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:16px 0 0;font-family:monospace,'Courier New',monospace;font-size:10px;color:#2A2A2A;">
                Or copy this link:
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
                      © ${year} StockWatch
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#2A2A2A;">
                      You're watching this product
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

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

type PriceDropEmailOptions = {
  productName: string;
  productUrl: string;
  imageUrl: string | null;
  oldPrice: number; // cents
  newPrice: number; // cents
};

export function buildPriceDropEmail(opts: PriceDropEmailOptions): EmailParts {
  const { productName, productUrl, imageUrl, oldPrice, newPrice } = opts;
  const year = new Date().getFullYear();

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const savingsAmount = fmt(oldPrice - newPrice);
  const savingsPct = Math.round((1 - newPrice / oldPrice) * 100);

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
  <title>Price Drop — ${productName}</title>
</head>
<body style="margin:0;padding:0;background:#F0F0EC;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0F0EC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:580px;width:100%;background:#ffffff;border:2px solid #0A0A0A;">

          <tr><td style="background:#F26B1F;height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>

          <tr>
            <td style="padding:22px 40px 20px;border-bottom:1px solid #E4E4E0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:#0A0A0A;letter-spacing:-0.02em;line-height:1;">StockWatch</span>
                    <br />
                    <span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.14em;color:#2A2A2A;">your size radar</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.14em;color:#2A2A2A;border:1px solid #E4E4E0;padding:4px 8px;">Price Drop Alert</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px 0;">
              <span style="display:inline-block;font-family:monospace,'Courier New',monospace;font-size:10px;font-weight:bold;letter-spacing:0.16em;text-transform:uppercase;color:#F26B1F;border:1.5px solid #F26B1F;padding:5px 12px;">
                ↓ &nbsp;Price Drop
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 40px 0;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;color:#0A0A0A;letter-spacing:-0.025em;line-height:1.05;">${productName}</h1>
            </td>
          </tr>

          ${imageBlock}

          <tr>
            <td style="padding:28px 40px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:20px;">
                    <span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#2A2A2A;display:block;margin-bottom:4px;">Was</span>
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2A2A2A;text-decoration:line-through;opacity:0.5;">${fmt(oldPrice)}</span>
                  </td>
                  <td style="padding-right:20px;font-family:Georgia,serif;font-size:28px;color:#E4E4E0;">→</td>
                  <td>
                    <span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#F26B1F;display:block;margin-bottom:4px;">Now</span>
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;color:#0A0A0A;">${fmt(newPrice)}</span>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;font-family:monospace,'Courier New',monospace;font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#F26B1F;">
                You save ${savingsAmount} (${savingsPct}% off)
              </p>
            </td>
          </tr>

          <tr><td style="padding:28px 40px 0;"><div style="border-top:1px solid #E4E4E0;font-size:0;line-height:0;">&nbsp;</div></td></tr>

          <tr>
            <td style="padding:24px 40px 40px;">
              <p style="margin:0 0 24px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;color:#2A2A2A;line-height:1.6;">
                Prices can change at any time. Lock in this price before it goes back up.
              </p>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#F26B1F;border:2px solid #0A0A0A;">
                    <a href="${productUrl}" target="_blank"
                      style="display:inline-block;font-family:monospace,'Courier New',monospace;font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;padding:14px 28px;text-decoration:none;">
                      Shop Now &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-family:monospace,'Courier New',monospace;font-size:10px;color:#2A2A2A;">
                Or copy this link: <a href="${productUrl}" style="color:#F26B1F;word-break:break-all;">${productUrl}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 40px;border-top:1px solid #E4E4E0;background:#FAFAF7;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td><span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#0A0A0A;">© ${year} StockWatch</span></td>
                  <td align="right"><span style="font-family:monospace,'Courier New',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#2A2A2A;">You're tracking this product's price</span></td>
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

  const text = `PRICE DROP — ${productName}

Was ${fmt(oldPrice)} → Now ${fmt(newPrice)}
You save ${savingsAmount} (${savingsPct}% off)

Shop now: ${productUrl}

---
StockWatch · your size radar
© ${year} StockWatch`;

  const subject = `Price dropped to ${fmt(newPrice)} — ${productName}`;

  return { subject, html, text };
}
