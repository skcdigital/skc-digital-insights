// Submits a hidden form to PayFast's hosted payment page.
// PayFast requires a POST (not a GET redirect), so we dynamically
// build a form, append it to the DOM, and submit it.
export function submitPayFastForm(
  paymentUrl: string,
  fields: Record<string, string>
) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;

  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
