"""Generate city-level CSV files for the By Location dashboard tab."""
import csv, random, math
from pathlib import Path

random.seed(42)
OUT = Path(__file__).parent.parent / "public"

CITIES = ["Jakarta", "Bali", "Bandung", "Surabaya", "Medan",
          "Yogyakarta", "Makassar", "Semarang", "Depok", "Tangerang"]

CHANNELS = ["Organic", "Paid Search", "Social Media", "Email", "Direct", "Referral"]
CATEGORIES = ["Electronics", "Apparel", "Home & Garden", "Beauty", "Sports", "Books", "Food & Drink"]
SEGMENTS = ["Champions", "Loyal", "At Risk", "New", "Lost"]
MONTHS = [f"2024-{m:02d}" for m in range(1, 13)]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# ── City profiles (ground truth) ────────────────────────────────────────────
PROFILES = {
    "Jakarta": dict(
        total_customers=320, avg_order_value=285.0, avg_ltv=1140.0,
        monthly_churn_rate=0.048, repeat_purchase_rate=0.68,
        top_category="Electronics", top_acquisition_source="Paid Search",
        preferred_device="Mobile", peak_shopping_day="Friday",
        ig_ads_cvr=0.142, email_cvr=0.181, paid_search_cvr=0.155,
        organic_cvr=0.098, mobile_share=0.65,
        description="Jakarta is the highest-value market: premium electronics buyers with strong paid-channel ROI. Friday evening is the dominant purchase window. Email and IG Ads both over-index here."
    ),
    "Bali": dict(
        total_customers=155, avg_order_value=210.0, avg_ltv=756.0,
        monthly_churn_rate=0.055, repeat_purchase_rate=0.52,
        top_category="Home & Garden", top_acquisition_source="Organic",
        preferred_device="Mobile", peak_shopping_day="Sunday",
        ig_ads_cvr=0.091, email_cvr=0.119, paid_search_cvr=0.103,
        organic_cvr=0.134, mobile_share=0.58,
        description="Bali shoppers are organic-first and referral-driven. Home & Garden dominates. IG Ads under-perform vs national average — budget is better spent on SEO and referral programs here."
    ),
    "Bandung": dict(
        total_customers=198, avg_order_value=195.0, avg_ltv=702.0,
        monthly_churn_rate=0.061, repeat_purchase_rate=0.55,
        top_category="Apparel", top_acquisition_source="Social Media",
        preferred_device="Mobile", peak_shopping_day="Saturday",
        ig_ads_cvr=0.131, email_cvr=0.112, paid_search_cvr=0.118,
        organic_cvr=0.095, mobile_share=0.62,
        description="Bandung is Indonesia's fashion hub. Apparel dominates and Social Media is the top acquisition channel. Saturday is peak day — ideal for flash-sale campaigns targeting style-conscious millennials."
    ),
    "Surabaya": dict(
        total_customers=210, avg_order_value=230.0, avg_ltv=874.0,
        monthly_churn_rate=0.043, repeat_purchase_rate=0.65,
        top_category="Food & Drink", top_acquisition_source="Email",
        preferred_device="Mobile", peak_shopping_day="Thursday",
        ig_ads_cvr=0.110, email_cvr=0.163, paid_search_cvr=0.128,
        organic_cvr=0.102, mobile_share=0.60,
        description="Surabaya is the email powerhouse — CVR of 16.3% vs 13% national average. Practical buyers focused on Food & Drink. Strong repeat purchase rate makes this the best city for subscription and loyalty programs."
    ),
    "Medan": dict(
        total_customers=175, avg_order_value=188.0, avg_ltv=620.0,
        monthly_churn_rate=0.068, repeat_purchase_rate=0.48,
        top_category="Food & Drink", top_acquisition_source="Organic",
        preferred_device="Mobile", peak_shopping_day="Wednesday",
        ig_ads_cvr=0.099, email_cvr=0.131, paid_search_cvr=0.108,
        organic_cvr=0.121, mobile_share=0.74,
        description="Medan is highly mobile (74% share) and organic-dominant. Churn rate is elevated — a retention campaign is overdue. Food & Drink is the anchor category. Low IG Ads CVR suggests shifting budget to organic content."
    ),
    "Yogyakarta": dict(
        total_customers=145, avg_order_value=162.0, avg_ltv=486.0,
        monthly_churn_rate=0.052, repeat_purchase_rate=0.50,
        top_category="Books", top_acquisition_source="Direct",
        preferred_device="Desktop", peak_shopping_day="Sunday",
        ig_ads_cvr=0.083, email_cvr=0.141, paid_search_cvr=0.092,
        organic_cvr=0.115, mobile_share=0.55,
        description="Yogyakarta is a student-heavy market with the lowest AOV but strong Books and Sports categories. Desktop usage is above average. Paid channel ROI is the weakest in the network — lean into content and community."
    ),
    "Makassar": dict(
        total_customers=142, avg_order_value=205.0, avg_ltv=697.0,
        monthly_churn_rate=0.058, repeat_purchase_rate=0.53,
        top_category="Food & Drink", top_acquisition_source="Social Media",
        preferred_device="Mobile", peak_shopping_day="Friday",
        ig_ads_cvr=0.122, email_cvr=0.108, paid_search_cvr=0.111,
        organic_cvr=0.096, mobile_share=0.77,
        description="Makassar is the most mobile-first city (77%) and highly social-responsive. Food & Drink dominates. IG Ads are above the national average — strong candidate for social-first campaigns and mobile-optimised landing pages."
    ),
    "Semarang": dict(
        total_customers=168, avg_order_value=248.0, avg_ltv=893.0,
        monthly_churn_rate=0.040, repeat_purchase_rate=0.67,
        top_category="Electronics", top_acquisition_source="Email",
        preferred_device="Mobile", peak_shopping_day="Tuesday",
        ig_ads_cvr=0.112, email_cvr=0.172, paid_search_cvr=0.139,
        organic_cvr=0.108, mobile_share=0.61,
        description="Semarang has the lowest churn in the network and the second-highest email CVR. Electronics buyers with strong repeat behaviour. Tuesday campaigns consistently outperform — schedule email sends accordingly."
    ),
    "Depok": dict(
        total_customers=243, avg_order_value=258.0, avg_ltv=980.0,
        monthly_churn_rate=0.046, repeat_purchase_rate=0.63,
        top_category="Electronics", top_acquisition_source="Paid Search",
        preferred_device="Mobile", peak_shopping_day="Monday",
        ig_ads_cvr=0.124, email_cvr=0.143, paid_search_cvr=0.148,
        organic_cvr=0.101, mobile_share=0.63,
        description="Depok closely mirrors Jakarta in profile but with lower AOV. Paid Search dominates acquisition. Electronics and Apparel split the revenue. Monday is peak — a commuter buying pattern that rewards morning push notifications."
    ),
    "Tangerang": dict(
        total_customers=244, avg_order_value=272.0, avg_ltv=1034.0,
        monthly_churn_rate=0.044, repeat_purchase_rate=0.64,
        top_category="Apparel", top_acquisition_source="Paid Search",
        preferred_device="Mobile", peak_shopping_day="Saturday",
        ig_ads_cvr=0.133, email_cvr=0.151, paid_search_cvr=0.144,
        organic_cvr=0.099, mobile_share=0.66,
        description="Tangerang is a high-value suburban market with Apparel leading. Strong IG Ads CVR and good email performance make it a dual-channel opportunity. Saturday dominance suggests weekend lifestyle shopping patterns."
    ),
}

# ── Channel CVR lookup ───────────────────────────────────────────────────────
def channel_cvr(city, channel):
    p = PROFILES[city]
    mapping = {
        "Organic": p["organic_cvr"],
        "Paid Search": p["paid_search_cvr"],
        "Social Media": p["ig_ads_cvr"],
        "Email": p["email_cvr"],
        "Direct": round(p["organic_cvr"] * 0.85, 4),
        "Referral": round(p["organic_cvr"] * 1.15, 4),
    }
    return mapping[channel]

# ── 1. city_customer_profile.csv ────────────────────────────────────────────
with open(OUT / "city_customer_profile.csv", "w", newline="") as f:
    fields = ["city","total_customers","avg_order_value","avg_ltv",
              "monthly_churn_rate","repeat_purchase_rate","top_category",
              "top_acquisition_source","preferred_device","peak_shopping_day",
              "ig_ads_cvr","email_cvr","paid_search_cvr","organic_cvr",
              "mobile_share","description"]
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for city in CITIES:
        row = {"city": city, **PROFILES[city]}
        w.writerow(row)
print("✓ city_customer_profile.csv")

# ── 2. city_segment_mix.csv ─────────────────────────────────────────────────
SEG_WEIGHTS = {
    "Jakarta":     [0.22, 0.28, 0.18, 0.20, 0.12],
    "Bali":        [0.14, 0.22, 0.22, 0.26, 0.16],
    "Bandung":     [0.16, 0.24, 0.20, 0.24, 0.16],
    "Surabaya":    [0.20, 0.30, 0.16, 0.20, 0.14],
    "Medan":       [0.12, 0.18, 0.24, 0.26, 0.20],
    "Yogyakarta":  [0.12, 0.20, 0.22, 0.28, 0.18],
    "Makassar":    [0.14, 0.22, 0.22, 0.26, 0.16],
    "Semarang":    [0.22, 0.30, 0.16, 0.18, 0.14],
    "Depok":       [0.20, 0.26, 0.18, 0.22, 0.14],
    "Tangerang":   [0.21, 0.27, 0.17, 0.21, 0.14],
}
BASE_LTV = {"Champions":950, "Loyal":600, "At Risk":320, "New":180, "Lost":90}
BASE_AOV = {"Champions":280, "Loyal":210, "At Risk":160, "New":130, "Lost":100}
BASE_CHURN = {"Champions":0.02, "Loyal":0.04, "At Risk":0.10, "New":0.07, "Lost":0.20}

with open(OUT / "city_segment_mix.csv", "w", newline="") as f:
    fields = ["city","segment","customer_count","avg_ltv","avg_order_value","churn_rate","share_of_city"]
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for city in CITIES:
        total = PROFILES[city]["total_customers"]
        weights = SEG_WEIGHTS[city]
        for i, seg in enumerate(SEGMENTS):
            count = round(total * weights[i])
            noise = lambda base: round(base * random.uniform(0.92, 1.08), 2)
            w.writerow({
                "city": city, "segment": seg,
                "customer_count": count,
                "avg_ltv": noise(BASE_LTV[seg]),
                "avg_order_value": noise(BASE_AOV[seg]),
                "churn_rate": round(BASE_CHURN[seg] * random.uniform(0.9, 1.1), 4),
                "share_of_city": round(weights[i], 4),
            })
print("✓ city_segment_mix.csv")

# ── 3. city_channel_performance.csv ─────────────────────────────────────────
CAT_REVENUE_WEIGHT = {
    "Jakarta":    [0.35, 0.20, 0.10, 0.10, 0.10, 0.05, 0.10],
    "Bali":       [0.15, 0.15, 0.30, 0.12, 0.12, 0.08, 0.08],
    "Bandung":    [0.12, 0.38, 0.10, 0.14, 0.10, 0.06, 0.10],
    "Surabaya":   [0.18, 0.15, 0.12, 0.10, 0.10, 0.08, 0.27],
    "Medan":      [0.12, 0.14, 0.12, 0.10, 0.10, 0.08, 0.34],
    "Yogyakarta": [0.10, 0.15, 0.12, 0.10, 0.14, 0.22, 0.17],
    "Makassar":   [0.12, 0.14, 0.12, 0.10, 0.10, 0.08, 0.34],
    "Semarang":   [0.30, 0.18, 0.12, 0.12, 0.10, 0.08, 0.10],
    "Depok":      [0.32, 0.22, 0.10, 0.12, 0.10, 0.06, 0.08],
    "Tangerang":  [0.20, 0.32, 0.10, 0.14, 0.10, 0.06, 0.08],
}

# Monthly seasonality index (Jan-Dec)
SEASON = [0.82, 0.78, 0.88, 0.90, 0.92, 0.95, 0.97, 0.98, 1.00, 1.05, 1.10, 1.35]

with open(OUT / "city_channel_performance.csv", "w", newline="") as f:
    fields = ["city","acquisition_source","month","sessions","conversions",
              "revenue","conversion_rate","ad_spend","roas","avg_order_value"]
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for city in CITIES:
        p = PROFILES[city]
        base_sessions_total = p["total_customers"] * 7  # ~7 sessions/customer/year total
        for ch in CHANNELS:
            ch_share = {"Organic":0.22,"Paid Search":0.20,"Social Media":0.19,
                        "Email":0.16,"Direct":0.13,"Referral":0.10}[ch]
            base_sessions = base_sessions_total * ch_share / 12  # monthly
            cvr = channel_cvr(city, ch)
            base_aov = p["avg_order_value"] * random.uniform(0.90, 1.10)
            for mi, month in enumerate(MONTHS):
                s = round(base_sessions * SEASON[mi] * random.uniform(0.88, 1.12))
                conv = round(s * cvr * random.uniform(0.92, 1.08))
                rev = round(conv * base_aov * random.uniform(0.95, 1.05), 2)
                if ch in ("Paid Search", "Social Media"):
                    ad_spend = round(rev * random.uniform(0.22, 0.30), 2)
                    roas = round(rev / ad_spend, 2) if ad_spend else 0
                else:
                    ad_spend = round(rev * random.uniform(0.05, 0.12), 2)
                    roas = round(rev / ad_spend, 2) if ad_spend else 0
                w.writerow({
                    "city": city, "acquisition_source": ch, "month": month,
                    "sessions": s, "conversions": conv,
                    "revenue": rev,
                    "conversion_rate": round(conv / s, 4) if s else 0,
                    "ad_spend": ad_spend, "roas": roas,
                    "avg_order_value": round(rev / conv, 2) if conv else 0,
                })
print("✓ city_channel_performance.csv")

# ── 4. city_category_revenue.csv ────────────────────────────────────────────
with open(OUT / "city_category_revenue.csv", "w", newline="") as f:
    fields = ["city","category","month","revenue","orders","avg_order_value"]
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for city in CITIES:
        p = PROFILES[city]
        weights = CAT_REVENUE_WEIGHT[city]
        total_annual_rev = p["total_customers"] * p["avg_ltv"]
        for ci, cat in enumerate(CATEGORIES):
            cat_annual = total_annual_rev * weights[ci]
            for mi, month in enumerate(MONTHS):
                rev = round(cat_annual / 12 * SEASON[mi] * random.uniform(0.88, 1.12), 2)
                aov_cat = p["avg_order_value"] * random.uniform(0.80, 1.20)
                orders = max(1, round(rev / aov_cat))
                w.writerow({
                    "city": city, "category": cat, "month": month,
                    "revenue": rev, "orders": orders,
                    "avg_order_value": round(rev / orders, 2),
                })
print("✓ city_category_revenue.csv")
print("\nAll city CSV files written to:", OUT)
