# Security Specification: Hospital Database

## Data Invariants
1. **Categories Collection**: Reads are public. Writes (create, update, delete) are permitted for active users.
2. **Prompts Collection**: Reads are public. Writes are permitted for active users so that admins and dynamic users can save recipes/doctors safely.
3. **Medical Records**: Reads are public (since everyone can see the public records ledger). Writes are permitted for visitors to submit records.

## Rules Implementation (Draft)
Allow public read accesses and allow write checks validated via structure checks.
