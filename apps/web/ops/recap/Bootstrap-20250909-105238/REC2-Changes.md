REC2 â€” Changes (file paths + purpose)
- src\lib\offers.ts â€” Data access & validation; resolves ops\data\offers.json relative to __filename.
- src\app\api\offers\route.ts â€” List & create offers (GET, POST).
- src\app\api\offers\[id]\route.ts â€” Read/update/delete single offer (GET, PUT, DELETE).
- ops\data\offers.json â€” JSON storage for offers (array).