from db import Base, engine, SessionLocal
from models import Offer

Base.metadata.create_all(bind=engine)

SEED = [
    {
        "name": "Starter Content System",
        "summary": "Weekly content pipeline for small businesses.",
        "price_usd": 750,
        "features": [
            "4 posts/week (FB/IG/LinkedIn)",
            "1 monthly blog (800–1,000 words)",
            "Monthly content calendar",
            "Basic analytics recap"
        ]
    },
    {
        "name": "Growth Engine",
        "summary": "Multi-channel content + light lead gen.",
        "price_usd": 1800,
        "features": [
            "12 posts/week across channels",
            "2 monthly blogs (1,200+ words)",
            "Landing page + CTA setup",
            "Lead capture & 1 nurture sequence"
        ]
    },
    {
        "name": "Pro Automation Suite",
        "summary": "Full content ops + outbound automation.",
        "price_usd": 3200,
        "features": [
            "20+ posts/week + shorts",
            "3 long-form pieces/mo",
            "CRM + outbound automations",
            "Quarterly strategy workshop"
        ]
    }
]

def main():
    db = SessionLocal()
    try:
        if db.query(Offer).count() == 0:
            for s in SEED:
                db.add(Offer(
                    name=s["name"],
                    summary=s["summary"],
                    price_usd=s["price_usd"],
                    features="\n".join(s["features"])
                ))
            db.commit()
            print("Seeded offers.")
        else:
            print("Offers already exist; skipping.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
