# Gamehouse Kenya backend review

## Current baseline — 23 November 2026

The owner confirmed an intentional fresh-database reset. The rewritten `0001_initial.py` is authoritative; references below to `0012`/`0013` describe historical work, not migration files to restore. The obsolete test for upgrading between removed migrations was removed. All 24 current authentication, department and category API tests pass with a fresh isolated test database; Django system checks and model/migration checks pass. Verification did not reset the local application database.

The StockMovement model and frontend Inventory screen remain, but the backend inventory module/routes and inventory-specific tests are currently absent. Reconcile those before calling inventory ready or moving on to backend cart persistence. Financial enhancements remain owner-managed.

## Confirmed business model

Gamehouse Kenya launches as one store managed by the owner's team, not a marketplace. Customers browse, save products and place orders. Store staff manage the shared catalogue and fulfil orders. Administrators manage staff access and store configuration.

The existing `SELLER` role and `Product.seller` relationship come from ToyZum's marketplace-style model. They must not become public seller onboarding. For the first compatibility pass, agree how to map existing seller accounts to store staff before renaming roles or migrating data. Product ownership should ultimately identify who added a product, rather than divide the store into independent sellers.

## Findings from the source

The table records the original audit. Authentication fixes completed afterwards are listed below; catalogue/order findings remain open.

| Area | Current behavior | Required direction |
| --- | --- | --- |
| Signup integration | Frontend posts signup data to `token/`, expecting HTTP 201. The backend exposes registration at `user/create/`; login uses `token/`. | Connect registration and login correctly, with consistent responses and automated tests. |
| Signup token claims | Registration creates tokens through `RefreshToken.for_user`; login adds profile/role claims through `MyTokenObtainPairSerializer`. | Use the same claim generation for both flows so the frontend has a consistent account shape. |
| Public registration | `CustomUserSerializer` exposes writable `role`; registration saves the supplied serializer data. | Public signup must create customers only. Staff/admin assignment must require administrative access. |
| Account editing | `custom_user_update` has no explicit authentication/ownership permission. The REST settings define JWT authentication but no default permission requirement. | Require authentication and scope edits to the authenticated account, with deliberate admin exceptions. |
| Password updates | Serializer update calls `set_password` even when no new password was supplied, passing the existing hash as a new password. | Preserve the password unless an explicit valid password change is requested. |
| Product management | Update/delete have reversed method arguments, use `product.objects` instead of `Product.objects`, and contain an incorrect role condition. | Correct the handlers and allow authorised store staff to manage the shared catalogue. Protect staff-only merchandising fields. |
| Order creation | Product and client are read-only serializer fields, but creation supplies them through input data rather than serializer save arguments. | Bind the authenticated customer and actual product on the server. Validate quantity and stock. |
| Order access | Order update does not check whether the caller owns the order or is authorised store staff. GraphQL exposes `all_orders` without a user-scoped resolver. | Customers see/change only their own permitted order data. Authorised store staff operate across the store. Scope GraphQL as well as REST. |
| Order integrity | No price snapshot or transactional stock handling is present. Order slug generation checks the product table instead of the order table. | Define price/stock rules and use consistent unique order identifiers. |
| Order statuses | The update endpoint accepts `SHIPPED`, which is absent from the model's status choices. | Agree one status lifecycle and enforce allowed transitions. |
| Adverts | Write views have no explicit staff permission. Update/delete call `get_object_or_404` without a model/queryset. | Restrict management to staff and repair lookups. |
| Product discovery | Products currently store gender/category but no age range, occasion, player count or duration. | Introduce explicit product suitability and play metadata independently of gender. |
| Tests | Backend tests contain only the generated placeholder. | Add regression tests for authentication, access boundaries and business rules as each slice is implemented. |

This is a source review. These issues have not been exercised against live accounts or production data. No backend files or database records were changed by the review.

## Authentication slice implemented

- Public signup creates `END_USER` accounts only. Role is read-only through the public account serializer; administrative flags cannot be assigned through signup or profile edits.
- Registration and login use the same JWT profile-claim generator. Login continues to accept an email or phone number through the existing `email` request field, including phone-only accounts.
- Account updates require JWT authentication and matching account ownership. Only an actual Django superuser (`is_superuser`) can edit another account; a `SUPERUSER` role label alone grants no exception. Role assignment remains outside this endpoint.
- Profile edits preserve the stored password hash unless a new password is supplied. Registration and explicit password changes enforce the project's configured Django password validators.
- Frontend signup now uses `user/create/`, strips password confirmation and privilege fields from its request, and displays server validation messages. Its password hint now matches the configured eight-character minimum instead of the separate six-character/symbol rule.
- Frontend session handling reads expiry from JWT claims, tolerates malformed/unavailable browser storage, restores expired access through a usable refresh token, retains refresh tokens when rotation is omitted, and prevents a late refresh response from restoring a logged-out session.

### Contract retained

| Operation | Request | Successful response |
| --- | --- | --- |
| Register | `POST /api/user/create/` with email, phone_number, first_name, last_name, password | HTTP 201, `{access, refresh}`; customer role/profile claims in tokens |
| Login | `POST /api/token/` with email (email or phone identifier), password | HTTP 200, `{access, refresh}` |
| Refresh | `POST /api/token/refresh/` with refresh | HTTP 200, new access and rotated refresh under current settings |
| Update profile | Authenticated `PUT /api/user/update/<email>/` with editable profile fields | HTTP 200, profile without password; role is read-only |

Validation: 14 Django API regression tests passed using an in-memory test database, including privilege injection, cross-account access, inactive users, password preservation and refresh rotation/blacklisting. Six frontend authentication tests and the existing frontend tests passed; the production frontend build passed. Live user accounts were not created or modified. No model changes or migrations were introduced.

Remaining limitations: existing privileged accounts and issued tokens were not retroactively audited or revoked; catalogue/order/advert permissions still need their planned slices. Profile/password editing UI remains deferred, and browser-driven authentication checks are still outstanding.

## Proposed implementation order

Catalogue/inventory additions: `Product.categories` is now a many-to-many field, with legacy category assignments preserved by migration `0012_product_categories` and a compatible primary category retained. Public catalogue reads include all categories and support filtering without duplicate products. Staff inventory endpoints are `GET /api/inventory/`, `GET /api/inventory/<slug>/` (latest 50 movements), and `POST /api/inventory/<slug>/receive/` with positive integer quantity, optional reference, and required UUID request_id. They require Django staff access, not a role label alone. Stock receipts use a transaction, row lock where supported and an atomic increment; retrying the same request ID is replayed without another increment, and reusing it with different details is rejected. Migration `0013_stockmovement` records existing positive stock as opening balances without changing quantities. New product creation records its own opening balance; normal product serializer updates reject direct quantity changes. Audited stock records protect their product from deletion. Adjustments, sales deductions and returns are not implemented yet.

Validation for these additions: 35 backend tests passed, including multi-category creation/filtering, preservation of existing category assignments, inventory permissions, receipt replay/conflicts, quantity validation, opening stock and transactional rollback. Both additive migrations were applied to the local database after SQLite backups. The later automated-pricing work was removed at the owner’s request; tax, cost, profit and discount enhancements will be implemented by the owner.

Department creation is now implemented as a focused addition: admin-only `POST /api/industry/new/` accepts a required unique name and optional image, generates the slug on the server, and returns HTTP 201 with the created department. It uses the existing Industry model and the same `IsAdminUser` permission as category creation. The frontend exposes “Add department” from account management, the account menu and the category form. Returning from the category form preserves its draft and selects the new department. No schema migration is required.

1. Authentication and access foundation: registration/login consistency, customer-only signup, protected account editing, password preservation, and tests. Wire the frontend to the agreed contract in the same slice.
2. Store staff permissions and catalogue operations: shared catalogue access, correct product/category/advert handlers, field validation and tests. Agree role migration before renaming existing values.
3. Product data and discovery: age suitability, adult-only classification where appropriate, occasions, player count, duration and server search/filtering. Adult occasions include couples, friends' meetups, drinking games and truth or dare; products can belong to more than one occasion.
4. Orders and checkout: customer/staff access boundaries, price snapshots, stock transactions, delivery/payment decisions, status transitions and matching frontend flows.

The frontend remodel remains the visual baseline. Backend slices should be paired with the matching frontend integration rather than introducing disconnected contracts.


## Pricing enhancement removed

At the owner's request, the tax, buying-cost, profit and profit-discount implementation has been removed. This includes the added financial model fields, calculator/model hooks, pricing API, VAT setting, UI preview, pricing-only tests and migration `0014_product_pricing`. The migration was unapplied after a SQLite backup, restoring the database to the inventory migration (`0013_stockmovement`). Existing product price, original optional sale price, stock, categories and inventory history remain in place.

The owner will implement these enhancements themselves. Do not automatically restore this pricing implementation or introduce new pricing rules. The product form uses the original manual price/sale-price fields. Backend files unrelated to the pricing pass were preserved.
