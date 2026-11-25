# Gamehouse Kenya remodel

## Current work checklist — 23 November 2026

This checklist reflects the current checkout. Older implementation/test notes below are historical and do not establish that those features still work after subsequent changes.

### 1. Reconcile the current backend

- [x] Owner confirmed an intentional fresh-database reset. `0001_initial.py` is the new baseline; previous migration files stay removed. The local application database was not reset during this verification.
- [x] Removed the obsolete category migration-history test targeting deleted migrations. Existing category API tests remain; Django applies the new initial migration when creating each isolated test database.
- [ ] Reconcile inventory: the frontend still calls `inventory/`, `inventory/<slug>/` and `inventory/<slug>/receive/`, but the backend inventory module/routes and inventory-specific tests are currently absent. Agree whether to restore or replace that implementation.
- [x] Backend baseline verified: all 24 remaining API tests pass against a fresh isolated test database. Django system checks pass and there are no pending model/migration differences.
- [ ] Verify product creation, department/category selection and incoming stock through the UI after inventory is reconnected.

Read-only checks performed: Django system check passes and `makemigrations --check --dry-run` reports no model/migration differences. Those checks do not validate inventory endpoints or the obsolete migration-test targets.

### 2. Finish shared-store management and permissions

- [ ] Use consistent customer, staff and administrator permissions across frontend, REST and GraphQL.
- [ ] Repair product update/delete handlers and restrict product/category/advert writes to authorised staff.
- [ ] Ensure incoming stock is added through audited receipts, with corrections/returns handled deliberately.
- [ ] Protect customer orders and contact/location data from unrelated users.

### 3. Complete the customer purchase flow

- [ ] Verify actual browser signup, email/phone login, refresh and logout.
- [ ] Implement customer cart read/add/update/remove on the backend, including guest-cart merge and account isolation.
- [ ] Build checkout with contact/address details and a server-validated order review.
- [ ] Create orders with price snapshots, validated stock, unique references and duplicate-submission protection.
- [ ] Record stock deductions and cancellation/return restocking consistently with inventory history.
- [ ] Clear purchased cart lines only after confirmed order creation.

### 4. Business decisions needed from the owner

- [ ] Choose launch payment methods.
- [ ] Define delivery regions, fees, pickup availability and courier/own-delivery responsibilities.
- [ ] Define payment timing, cancellations, returns and refunds.
- [ ] Supply representative product photos, descriptions, prices, stock and age suitability.

### 5. Delivery and launch readiness

- [ ] Integrate the chosen payment method and confirmed payment status.
- [ ] Provide customer confirmation, order history and delivery progress.
- [ ] Give authorised staff fulfilment/status controls with an agreed order lifecycle.
- [ ] Complete password recovery and account-editing UI.
- [ ] Test mobile layouts, empty/error states and the complete purchase/fulfilment path.
- [ ] Configure hosting, HTTPS, permitted frontend/backend origins, backups, logging and final store contact/policy information.

**Owner-managed:** tax, buying cost, profit and discount enhancements remain yours to implement. No automated pricing work should be reintroduced without your explicit request.

**Immediate next step:** the fresh migration baseline is confirmed and passing. Reconcile the missing inventory backend with the existing inventory screen, then proceed to backend cart persistence.

ToyZum is being remastered as Gamehouse Kenya: a modern, simple, mobile-first games and toys store for kids, teens and adults. Text Book Centre’s games and toys offering is a competitor reference. The identity uses the supplied Gamehouse wordmark, cream backgrounds, forest green, clear typography and restrained playful accents.

Gamehouse Kenya is confirmed as one store managed by our team, not a marketplace. The backend review and proposed integration sequence are recorded in [backend-review.md](backend-review.md).

## Adult play occasions

Adult discovery must cover these occasions explicitly, alongside traditional board games, puzzles and strategy games:

- Couples and date nights: connection, conversation and games for two.
- Friends’ meetups: party games, icebreakers and group challenges.
- Drinking games: adult party games, clearly separated from kids’ and teens’ recommendations.
- Truth or dare: conversation and challenge games; age suitability depends on the specific edition and content.

The adult homepage currently links these interests to text searches. These are discovery suggestions, not age-verified category assignments. Proper age and occasion data will be designed together in the backend/frontend phase.

## Scope and working agreement

Complete the visual and interaction design across the existing application first, then pair backend changes with their frontend integration. The UI-only phase made no backend changes. The subsequent authentication slice is now implemented and tested; it introduces no schema migrations. Pre-existing backend edits in the checkout remain separate.

The UI phase included accessible forms, clear feedback, image previews, local bag interactions and displaying existing API responses. The subsequent authentication integration slice now includes backend fixes and regression tests, as recorded in [backend-review.md](backend-review.md). Client-side role visibility is not a substitute for backend authorization.

## Implemented UI

- Storefront and catalogue: branded homepage, age-group inspiration, adult occasions, actual categories, featured-first product shelf, full footer, search, sort and budget filters.
- Shared page and form system: consistent headings, panels, labelled fields, buttons, notices, empty states and responsive layouts.
- Login and signup: consistent authentication layout, password visibility, native form submission, loading/errors, autocomplete and safe local return links. Signup now uses the existing registration endpoint, and the configured Django password rules are enforced.
- Product creation: image upload/previews/removal, product information, manual price and optional sale price, initial quantity, multiple-category selection, existing audience choices and save feedback.
- Products can now belong to multiple categories across departments. The product form supports multiple selections; catalogue search/filtering and product labels use all assigned categories. Migration `0012_product_categories` preserves each existing category, and the legacy primary-category field remains for older clients.
- Inventory: account management now links to a shared-store Inventory screen. Staff can receive a new batch by entering only the units arriving and an optional receipt reference. The server increments the existing stock atomically and stores the change, resulting balance, date and staff member. Reusing a receipt request cannot add its stock twice. Recent history shows the latest 50 entries. Existing balances are preserved as opening-stock entries by migration `0013_stockmovement`; new product creation records its opening balance. Normal product API edits cannot overwrite an existing stock quantity.
- Department, category and advert creation: consistent forms, previews and feedback. Admins can add a department from account management or directly from the category form. The latter returns with the new department selected and the category draft preserved. Advert editing is explicitly unavailable rather than accidentally creating another advert. The promotional library is separate from the fixed homepage hero.
- Account and settings: account details, sign-out, shopper links and role-aware store management links.
- Bag: saved browser-local products, quantity controls, removal, effective sale prices, subtotal and a proper empty state.
- Orders: shopper/seller lists and detail views with loading, errors, retry, actual status and existing order information. Empty-list 404 responses from the current API are displayed as empty states.
- Product page: mobile-first image gallery, thumbnails, price/sale price, availability, description, quantity selector, add-to-bag feedback and loading/error/retry states.
- Original lightweight SVG artwork and a 6.5 KB optimized derivative of the supplied wordmark.
- Light/dark appearance across storefront, authentication, management forms, account, bag and orders. The header provides a toggle; Settings offers Light, Dark and Device preferences without requiring sign-in. The browser remembers the choice, follows live system changes in Device mode and applies the theme before React renders. Dark appearance uses an optimized copy of the supplied `game_house_dark_logo.png` in the header, footer and authentication layout.

## Signup-to-delivery integration status

1. **Signup/login — implemented and API-tested.** Customer-only registration, consistent token claims, email/phone login, refresh rotation and account-update ownership are connected to the frontend. Actual browser signup/login checks remain outstanding; password recovery and profile-editing UI remain open.
2. **Cart persistence — open.** The bag currently uses browser storage. The backend Cart model exists, but cart read/add/update/remove endpoints, per-customer isolation and guest-to-account merge are not yet implemented. Agree stock handling and prevent duplicate entries per product/customer.
3. **Checkout — open.** Build the delivery/contact form and final order review against server-calculated prices, stock, discounts and delivery charges. Prevent duplicate order submission. Do not trust browser-stored prices or quantities.
4. **Order creation — open.** Correct server binding of product/customer, snapshot prices and quantities, reserve/decrement stock transactionally, generate unique order identifiers and clear the saved cart only after confirmed success.
5. **Payment and delivery — decisions and implementation pending.** Confirm accepted payment methods, delivery areas/rates, pickup availability, required address/contact fields and fulfilment responsibilities before connecting payment or promising delivery. Then add order confirmation, customer order history, authorised staff status updates and customer delivery tracking.

Next integration sequence: verify signup/login in the browser, add server-backed customer carts with guest merge, implement checkout/order creation, then connect the agreed payment/delivery workflow. Theme changes in this pass do not implement checkout or modify backend records.

## Backend/frontend work to agree together

Tax, buying-cost, profit and profit-discount enhancements are owner-managed. The automated pricing work was removed at the owner's request: financial model fields, calculation helpers, preview API, VAT setting, pricing UI and pricing-only tests were removed, and migration `0014_product_pricing` was unapplied and removed. Manual price and the original optional sale-price behavior are restored. Do not implement these enhancements again unless explicitly requested. Inventory and multiple-category support remain in place.

Inventory receipts are implemented for incoming stock. Stock corrections, damage/write-offs, supplier returns, sales deductions and cancellation restocking remain to be designed with the order flow; they are not available through the receipt form. Cart quantities do not reserve stock. Receipt references are for auditing; retry protection uses an internal request ID, not reference-name uniqueness.

1. Product taxonomy: minimum/maximum age, adult-only content where applicable, play occasions, interests, player count, duration and safety information. Current audience buttons are inspiration, not age filters. Do not infer adult-only classification from gender.
2. Search and catalogue scale: the existing GraphQL schema has no text-search filter, so the frontend follows every product page and searches locally. Agree server search, sorting and pagination before catalogue growth.
3. Authentication: signup endpoint/claims, public role protection, profile-update ownership, password preservation and frontend refresh handling are now fixed and tested. Signup uses `user/create/`; login uses `token/`. Password recovery, profile-editing UI and wider administrative access still need their own pass. See [backend-review.md](backend-review.md) for the implemented contract.
4. Ordering and checkout: agree guest/account behavior, stock validation, payment, delivery, fulfilment and confirmation. The bag does not place orders. The incomplete legacy product ordering modal is no longer exposed; product selection currently ends at the bag. No payment or delivery promises are invented.
5. Order operations: agree confirmation/cancellation permissions, status transitions and delivery tracking before exposing write controls. Order detail UI is currently read-only.
6. Operations: department creation is now available through the admin-only `POST /api/industry/new/` endpoint, using the existing Industry model without migrations. Product/advert editing and wider store-staff authorization remain for the operations pass.
7. Business information: confirm delivery regions, contact information, returns and policies before displaying them publicly.

## Validation and remaining checks

`npm test` covers catalogue pagination, seller scoping, search, combined filters, effective sale prices and failure handling, plus form and local bag utilities. `npm run build` checks the production bundle. Render checks exercise authentication, shopper/admin views and empty/error/loading UI with fixture contexts, without creating real accounts, products or orders.

The storefront GraphQL query was accepted by the running local API during the first pass; it returned empty product/category lists. Real populated and authenticated workflows still need integration testing. The dark-mode pass was checked in the browser on desktop and at a 390-pixel mobile viewport, including light/dark switching, the supplied logo, signup-form appearance and preference persistence after reload. Full signup submission, checkout, delivery and physical-device testing remain outstanding. The backend URL in `src/constants/constants.jsx` stays as configured locally; phone testing needs an address reachable from the phone.
