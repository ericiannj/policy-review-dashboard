# API Reference — Tricura Policy Assessment API

**Base URL:** `http://localhost:4000`  
**Auth:** Tricura  
**CORS:** Open (any origin)  
**Interactive docs:** `http://localhost:4000/docs` (Swagger UI)  
**OpenAPI spec:** `http://localhost:4000/openapi.json`

> Data is in-memory. Server restarts reset all mutations to the 100 seed policies (POL-1001 – POL-1100).

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/policies` | Paginated, filtered list |
| `GET` | `/policies/:id` | Full nested policy detail |
| `POST` | `/policies` | Create policy |
| `PATCH` | `/policies/:id` | Partial update (deep merge) |
| `DELETE` | `/policies/:id` | Delete policy |

---

## GET /policies

Returns a **flat** list of policy summaries. The shape differs from `GET /policies/:id` — nested fields are not included.

### Query parameters

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–100 | `20` | |
| `search` | string | — | Case-insensitive substring on `account.name` |
| `region` | enum | — | `Northeast` \| `Southeast` \| `Midwest` \| `Southwest` \| `West` |
| `effectiveDateFrom` | ISO date | — | Inclusive lower bound on `renewal.effectiveDate` |
| `effectiveDateTo` | ISO date | — | Inclusive upper bound on `renewal.effectiveDate` |
| `premiumMin` | number | — | Inclusive lower bound on `financials.premium` |
| `premiumMax` | number | — | Inclusive upper bound on `financials.premium` |
| `claimsTotalMin` | number | — | Inclusive lower bound on `financials.claimsTotal` |
| `claimsTotalMax` | number | — | Inclusive upper bound on `financials.claimsTotal` |
| `reimbursementRiskMin` | number [0, 1] | — | Inclusive lower bound on `financials.reimbursementRisk` |
| `reimbursementRiskMax` | number [0, 1] | — | Inclusive upper bound on `financials.reimbursementRisk` |

**Range validation:** If both sides of a range are supplied, min must be ≤ max — otherwise 400.  
**Independent ranges:** `premiumMin` can be supplied without `premiumMax` and vice versa.

### Response `200`

```json
{
  "data": [
    {
      "id": "POL-1042",
      "accountName": "Green Valley Care Center",
      "region": "Southeast",
      "facilityCount": 4,
      "effectiveDate": "2026-06-01",
      "premium": 128000,
      "claimsTotal": 42100,
      "reimbursementRisk": 0.24
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

> `reimbursementRisk` is a float in [0, 1]. Convert to a risk label in the frontend:
> - `r >= 0.70` → **High**
> - `0.40 <= r < 0.70` → **Medium**
> - `r < 0.40` → **Low**

---

## GET /policies/:id

Returns the **full nested policy**. Use this when a row is expanded to fetch compliance, financials, and renewal detail.

### Response `200`

```json
{
  "id": "POL-1042",
  "account": {
    "name": "Green Valley Care Center",
    "region": "Southeast",
    "facilityCount": 4
  },
  "renewal": {
    "effectiveDate": "2026-06-01",
    "daysUntilRenewal": 29
  },
  "compliance": {
    "missingDocuments": 3,
    "expiredDocuments": 1,
    "pendingReviews": [
      {
        "type": "License",
        "dueDate": "2026-05-07",
        "severity": "high"
      },
      {
        "type": "Staff Training",
        "dueDate": "2026-05-18",
        "severity": "medium"
      }
    ]
  },
  "financials": {
    "premium": 128000,
    "claimsTotal": 42100,
    "reimbursementRisk": 0.24
  }
}
```

### Field types & enum values

| Field | Type | Enum values |
|-------|------|-------------|
| `account.region` | enum | `Northeast`, `Southeast`, `Midwest`, `Southwest`, `West` |
| `account.facilityCount` | integer ≥ 0 | |
| `renewal.daysUntilRenewal` | integer | Can be negative if past renewal date |
| `compliance.missingDocuments` | integer ≥ 0 | |
| `compliance.expiredDocuments` | integer ≥ 0 | |
| `compliance.pendingReviews[].type` | enum | `License`, `Staff Training`, `Incident Report`, `Billing Documentation`, `Care Plan`, `Medication Log`, `Facility Inspection`, `Insurance Certificate` |
| `compliance.pendingReviews[].severity` | enum | `low`, `medium`, `high`, `critical` |
| `financials.premium` | number ≥ 0 | |
| `financials.claimsTotal` | number ≥ 0 | |
| `financials.reimbursementRisk` | number [0, 1] | |

---

## POST /policies

Creates a new policy. **Do not include `id`** — the server generates it sequentially as `POL-XXXX`.

### Request body

Send the full nested policy object (same shape as `GET /policies/:id` response, without `id`):

```json
{
  "account": { "name": "...", "region": "Northeast", "facilityCount": 2 },
  "renewal": { "effectiveDate": "2026-12-01", "daysUntilRenewal": 208 },
  "compliance": {
    "missingDocuments": 0,
    "expiredDocuments": 0,
    "pendingReviews": []
  },
  "financials": { "premium": 95000, "claimsTotal": 12000, "reimbursementRisk": 0.15 }
}
```

### Response `201`

Returns the created policy with its server-generated `id`.

---

## PATCH /policies/:id

Partial update via **deep merge**. Send only the fields to change.

### Merge behavior

- **Nested objects** are deep-merged: `{ "financials": { "premium": 150000 } }` updates only `premium`, leaves `claimsTotal` and `reimbursementRisk` untouched.
- **Arrays are replaced wholesale**: if you send `compliance.pendingReviews`, the entire array is replaced — not appended to.
- After merge, the full policy is validated; invalid patches return `400`.

### Request body example

```json
{ "financials": { "premium": 150000 } }
```

### Response `200`

Returns the full updated policy.

---

## DELETE /policies/:id

### Response `200`

```json
{ "success": true }
```

---

## Error format

All error responses follow the same shape:

```json
{
  "error": {
    "code": "not_found",
    "message": "Policy not found",
    "details": {}
  }
}
```

| Status | Code | Scenario |
|--------|------|----------|
| `400` | `validation_error` | Invalid body, query params, or failed schema after PATCH |
| `400` | `request_error` | Other client error |
| `404` | `not_found` | Policy id does not exist; unknown route |
| `500` | `internal_error` | Server error |

Validation errors include a `details` object with per-field messages:

```json
{
  "error": {
    "code": "validation_error",
    "message": "...",
    "details": {
      "fieldErrors": { "premium": ["Number must be greater than or equal to 0"] },
      "formErrors": []
    }
  }
}
```

---

## Key integration notes

1. **List and detail shapes differ.** `GET /policies` returns flat summaries; `GET /policies/:id` returns the full nested object. Always fetch the detail endpoint when expanding a row.
2. **Pagination is server-side.** `page` and `limit` control what the server returns; do not slice client-side.
3. **Risk label is frontend-computed.** `reimbursementRisk` is a raw float — compute High/Medium/Low in the UI.
4. **PATCH replaces arrays.** When updating `pendingReviews`, send the full desired array.
5. **No `severity` filter.** The README mentions a `severity` query param but it is **not implemented** — do not expose it.
6. **Mutations reset on restart.** Useful for manual testing; do not rely on persisted state across restarts.
