# FINAL RECAP — QC Media v1.0.10

## Servers
- Runner:  http://localhost:5680/health
- Site:    http://localhost:3001/
- API:     http://localhost:3001/api/offers

## HTTP Smokes
GET /                                    200
GET /api/offers                          200
PUT /api/offers/id-l1teijrn              200
GET /api/offers/id-l1teijrn              200
DELETE /api/offers/id-l1teijrn              204
GET /api/offers/id-l1teijrn              404

## Block Pages (30–200)
- /qc-check-30-50 → 200 (titleOk=True)
- /qc-check-51-70 → 200 (titleOk=True)
- /qc-check-71-90 → 200 (titleOk=True)
- /qc-check-91-110 → 200 (titleOk=True)
- /qc-check-111-130 → 200 (titleOk=True)
- /qc-check-131-150 → 200 (titleOk=True)
- /qc-check-151-170 → 200 (titleOk=True)
- /qc-check-171-190 → 200 (titleOk=True)
- /qc-check-191-200 → 200 (titleOk=True)

## Policy
- "@/” remaining: 
- Rewrites this run: 

## Tiny Log
- final-seal-200-20250909-151054.log