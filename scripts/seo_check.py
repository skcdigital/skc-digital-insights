"""
SKC Digital — SEO Monitor
---------------------------
Checks if skcdigital.co.za is appearing on Google for key search terms.
Also checks page speed, meta tags, and basic SEO health.

How to run:
  pip install requests beautifulsoup4
  python scripts/seo_check.py

Note: Google blocks automated scraping, so this checks your own
site's SEO health directly rather than scraping Google results.
"""

import requests
from bs4 import BeautifulSoup
import time
import os
from datetime import date

TARGET = "https://skcdigital.co.za"

# Pages to check
PAGES = [
    "/",
    "/services",
    "/portfolio",
    "/pricing",
    "/about",
    "/contact",
    "/blog",
]

# Keywords your pages SHOULD contain
KEYWORD_TARGETS = {
    "/":         ["IT solutions", "Pretoria", "Excel", "automation", "web development"],
    "/services": ["Excel", "bookkeeping", "website", "automation", "consulting"],
    "/pricing":  ["R", "price", "from", "once-off", "monthly"],
    "/about":    ["Suzan", "Pretoria", "BCom", "UNISA"],
    "/contact":  ["WhatsApp", "email", "contact"],
}

os.makedirs("reports", exist_ok=True)

def check_page_seo(path):
    url = TARGET + path
    result = {
        "url": url,
        "status": None,
        "load_time": None,
        "title": None,
        "meta_desc": None,
        "h1": None,
        "h1_count": 0,
        "keyword_hits": [],
        "keyword_misses": [],
        "issues": [],
        "score": 0,
    }

    try:
        start = time.time()
        r = requests.get(url, timeout=10)
        result["load_time"] = round(time.time() - start, 2)
        result["status"] = r.status_code

        if r.status_code != 200:
            result["issues"].append(f"Page returned {r.status_code}")
            return result

        soup = BeautifulSoup(r.text, "html.parser")

        title_tag = soup.find("title")
        if title_tag:
            result["title"] = title_tag.text.strip()
            if len(result["title"]) < 10:
                result["issues"].append("Title too short (under 10 chars)")
            elif len(result["title"]) > 70:
                result["issues"].append("Title too long (over 70 chars) — Google may cut it off")
        else:
            result["issues"].append("❌ Missing <title> tag")

        meta = soup.find("meta", attrs={"name": "description"})
        if meta and meta.get("content"):
            result["meta_desc"] = meta["content"].strip()
            if len(result["meta_desc"]) < 50:
                result["issues"].append("Meta description too short")
            elif len(result["meta_desc"]) > 160:
                result["issues"].append("Meta description too long (over 160 chars)")
        else:
            result["issues"].append("❌ Missing meta description")

        h1s = soup.find_all("h1")
        result["h1_count"] = len(h1s)
        if len(h1s) == 0:
            result["issues"].append("❌ No <h1> heading found")
        elif len(h1s) > 1:
            result["issues"].append(f"Multiple <h1> tags ({len(h1s)}) — should be only one")
        else:
            result["h1"] = h1s[0].text.strip()

        page_text = soup.get_text().lower()
        keywords  = KEYWORD_TARGETS.get(path, [])
        for kw in keywords:
            if kw.lower() in page_text:
                result["keyword_hits"].append(kw)
            else:
                result["keyword_misses"].append(kw)
                result["issues"].append(f"Keyword not found on page: '{kw}'")

        if result["load_time"] > 3:
            result["issues"].append(f"⚠ Slow load time: {result['load_time']}s (aim for under 3s)")

        score = 100
        score -= len(result["issues"]) * 10
        result["score"] = max(0, min(100, score))

    except Exception as e:
        result["issues"].append(f"Error: {e}")

    return result

def run_seo_check():
    print("=" * 56)
    print("  SKC Digital — SEO Health Check")
    print(f"  {TARGET}")
    print(f"  Date: {date.today().strftime('%d %B %Y')}")
    print("=" * 56)

    all_results = []
    for path in PAGES:
        print(f"  Checking {path}...")
        all_results.append(check_page_seo(path))

    report = []
    report.append("=" * 56)
    report.append("  SKC DIGITAL — SEO REPORT")
    report.append(f"  {date.today().strftime('%d %B %Y')}")
    report.append("=" * 56)

    total_score = 0
    for r in all_results:
        total_score += r["score"]
        icon = "✅" if r["score"] >= 80 else "⚠️ " if r["score"] >= 50 else "❌"
        report.append(f"\n{icon} {r['url']}")
        report.append(f"   Score      : {r['score']}/100")
        report.append(f"   Status     : {r['status']}")
        report.append(f"   Load time  : {r['load_time']}s")
        if r["title"]:
            report.append(f"   Title      : {r['title'][:60]}")
        if r["h1"]:
            report.append(f"   H1         : {r['h1'][:60]}")
        if r["keyword_hits"]:
            report.append(f"   ✅ Keywords : {', '.join(r['keyword_hits'])}")
        if r["keyword_misses"]:
            report.append(f"   ❌ Missing  : {', '.join(r['keyword_misses'])}")
        if r["issues"]:
            report.append("   Issues:")
            for issue in r["issues"]:
                report.append(f"     • {issue}")

    avg_score = round(total_score / len(all_results)) if all_results else 0
    report.append("\n" + "=" * 56)
    report.append(f"  Average Score : {avg_score}/100")
    if avg_score >= 80:
        report.append("  Rating        : 🟢 GOOD")
    elif avg_score >= 60:
        report.append("  Rating        : 🟡 FAIR — Some improvements needed")
    else:
        report.append("  Rating        : 🔴 NEEDS WORK")
    report.append("=" * 56)

    report_text = "\n".join(report)
    print("\n" + report_text)

    filename = f"reports/seo_report_{date.today().isoformat()}.txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(report_text)
    print(f"\n✅ SEO report saved to: {filename}\n")

if __name__ == "__main__":
    run_seo_check()
