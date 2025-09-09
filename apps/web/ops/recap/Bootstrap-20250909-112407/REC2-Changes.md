REC2 Ã¢â‚¬â€ Changes (file paths + purpose)
- src\lib\offers.ts Ã¢â‚¬â€ Data access & validation; resolves ops\data\offers.json relative to __filename.
- src\app\api\offers\route.ts Ã¢â‚¬â€ List & create offers (GET, POST).
- src\app\api\offers\[id]\route.ts Ã¢â‚¬â€ Read/update/delete single offer (GET, PUT, DELETE).
- ops\data\offers.json Ã¢â‚¬â€ JSON storage for offers (array).