"""
Website Audit Script for skcdigital.co.za
------------------------------------------
Checks for:
- Broken links (404 errors)
- Server errors (500 errors)
- Missing images and assets
- HTTP redirects
- SSL/HTTPS issues
- Slow loading pages
- Basic SEO checks (title, meta description)

How to run:
  1. Install dependencies:  pip install requests beautifulsoup4
  2. Run the script:        python scripts/audit.py
  3. Results saved to:      audit_report.txt
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

# ── Configuration ──────────────────────────────────────────
BASE_URL = "https://skcdigital.co.za"
TIMEOUT  = 10       # seconds before giving up on a page
MAX_PAGES = 50      # max pages to scan (prevents infinite loops)
SLOW_THRESHOLD = 3  # seconds — flag pages slower than this
# ───────────────────────────────────────────────────────────

visited = set()
errors  = []
warnings = []
ok_pages = []

def is_internal(url):
    """Check if a URL belongs to the same website."""
    return urlparse(url).netloc in ("", urlparse(BASE_URL).netloc)

def check_seo(soup, url):
    """Basic SEO checks on a page."""
    issues = []
    title = soup.find("title")
    if not title or not title.text.strip():
        issues.append("Missing <title> tag")

    desc = soup.find("meta", attrs={"name": "description"})
    if not desc or not desc.get("content", "").strip():
        issues.append("Missing meta description")

    h1s = soup.find_all("h1")
    if len(h1s) == 0:
        issues.append("No <h1> heading found")
    elif len(h1s) > 1:
        issues.append(f"Multiple <h1> tags found ({len(h1s)}) — should only be one")

    return issues

def scan_page(url):
    """Fetch a page, record its status, and return all links found."""
    if url in visited or len(visited) >= MAX_PAGES:
        return []
    visited.add(url)

    print(f"  Scanning: {url}")
    start = time.time()

    try:
        response = requests.get(url, timeout=TIMEOUT, allow_redirects=True)
        elapsed = round(time.time() - start, 2)
        status  = response.status_code

        if elapsed > SLOW_THRESHOLD:
            warnings.append(f"⚠  SLOW ({elapsed}s)       {url}")

        if status == 200:
            ok_pages.append(f"✅ [{status}] {url} ({elapsed}s)")
        elif status in (301, 302):
            warnings.append(f"↩  REDIRECT [{status}]    {url}")
        elif status == 403:
            warnings.append(f"🔒 FORBIDDEN [{status}]   {url}")
        elif status == 404:
            errors.append(f"❌ NOT FOUND [{status}]    {url}")
        elif status >= 500:
            errors.append(f"🔥 SERVER ERROR [{status}] {url}")
        else:
            warnings.append(f"⚠  UNEXPECTED [{status}]  {url}")

        if "text/html" not in response.headers.get("Content-Type", ""):
            return []

        soup = BeautifulSoup(response.text, "html.parser")

        seo_issues = check_seo(soup, url)
        for issue in seo_issues:
            warnings.append(f"📋 SEO — {issue}  ({url})")

        links = []
        for tag in soup.find_all(["a", "img", "script", "link"]):
            href = tag.get("href") or tag.get("src")
            if href:
                full_url = urljoin(url, href)
                if full_url.startswith(("mailto:", "tel:", "#")):
                    continue
                links.append(full_url)

        return links

    except requests.exceptions.SSLError:
        errors.append(f"🔐 SSL ERROR                {url}")
    except requests.exceptions.ConnectionError:
        errors.append(f"📡 CONNECTION ERROR         {url}")
    except requests.exceptions.Timeout:
        errors.append(f"⏱  TIMEOUT ({TIMEOUT}s)        {url}")
    except Exception as e:
        errors.append(f"💥 UNKNOWN ERROR            {url}  →  {e}")

    return []

def check_external_link(url):
    """Quickly check if an external link is reachable."""
    try:
        r = requests.head(url, timeout=TIMEOUT, allow_redirects=True)
        if r.status_code == 404:
            errors.append(f"❌ BROKEN EXTERNAL LINK [{r.status_code}]  {url}")
        elif r.status_code >= 500:
            warnings.append(f"⚠  EXTERNAL SERVER ERROR [{r.status_code}]  {url}")
    except Exception:
        warnings.append(f"⚠  UNREACHABLE EXTERNAL LINK  {url}")

def run_audit():
    print("=" * 60)
    print(f"  SKC Digital Website Audit")
    print(f"  Target: {BASE_URL}")
    print(f"  Max pages: {MAX_PAGES}")
    print("=" * 60)

    queue = [BASE_URL]
    external_links = set()

    while queue and len(visited) < MAX_PAGES:
        url = queue.pop(0)
        found_links = scan_page(url)

        for link in found_links:
            if is_internal(link) and link not in visited:
                queue.append(link)
            elif not is_internal(link) and link not in external_links:
                external_links.add(link)

    print(f"\n  Checking {len(external_links)} external links...")
    for ext_url in list(external_links)[:20]:
        check_external_link(ext_url)

    report = []
    report.append("=" * 60)
    report.append("  AUDIT REPORT — skcdigital.co.za")
    report.append("=" * 60)
    report.append(f"\n  Pages scanned : {len(visited)}")
    report.append(f"  Errors found  : {len(errors)}")
    report.append(f"  Warnings      : {len(warnings)}")
    report.append(f"  Pages OK      : {len(ok_pages)}")

    if errors:
        report.append("\n── ERRORS (fix these first) " + "─" * 32)
        for e in errors:
            report.append(f"  {e}")

    if warnings:
        report.append("\n── WARNINGS (review these) " + "─" * 33)
        for w in warnings:
            report.append(f"  {w}")

    if ok_pages:
        report.append("\n── PAGES LOADED SUCCESSFULLY " + "─" * 30)
        for p in ok_pages:
            report.append(f"  {p}")

    report.append("\n" + "=" * 60)
    report.append("  End of Report")
    report.append("=" * 60)

    report_text = "\n".join(report)
    print("\n" + report_text)

    with open("audit_report.txt", "w", encoding="utf-8") as f:
        f.write(report_text)

    print(f"\n✅ Report saved to: audit_report.txt")

if __name__ == "__main__":
    run_audit()
