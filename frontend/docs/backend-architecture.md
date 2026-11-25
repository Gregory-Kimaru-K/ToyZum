# Gamehouse Kenya backend application structure

Status: written proposal for discussion. Implementation is not yet approved.

## Purpose

Separate the responsibilities currently grouped in `api_toyzum_app` into focused Django applications. Keep them in one Django project and database, with clear ownership of models and business operations.

This document authorises no code moves, model changes, migrations, database resets or API changes.

## Proposed applications

| Application | Responsibility | Existing models to move | Additional work to agree |
| --- | --- | --- | --- |
| `products` | Product catalogue, departments/industries, categories and product information | `Industry`, `Category`, `Product` | Product editing, discovery fields and the location of adverts |
| `inventory` | Stock balances, incoming stock and the history of stock changes | `StockMovement` | Stock balance storage, receipts, adjustments, sales deductions and returns |
| `accounts` | Authentication, user accounts, roles and shared access permissions | `CustomUser`, `CustomUserManager` | Staff/admin responsibilities, account management and recovery |
| `orders` | Shopping carts, checkout, orders and payments | `Cart`, `Order` | Payment models/integration, checkout rules, fulfilment and delivery updates |

The application names above are proposed Python package names. The business-facing label for `Industry` remains “Department”. Renaming that model is a separate decision.

## 1. Products application

Owns:

- Departments/industries.
- Categories and their relationship to departments.
- Products and their multiple category assignments.
- Product descriptions, images and catalogue visibility.
- Product creation, editing, browsing, searching and filtering.

Stock-changing operations belong to `inventory`. Cart, order and payment operations belong to `orders`.

The existing `seller` relationship needs review in the single-store model. Decide whether it remains temporarily for compatibility or becomes a record of the staff member who created the product. Do not rename it as part of an unapproved model redesign.

## 2. Inventory application

Owns:

- Receiving incoming stock by adding received units to the current balance.
- Recording stock movements, references, staff members, dates and resulting balances.
- Stock validation and the agreed adjustment/return operations.
- The stock-changing operations used when orders are placed, cancelled or returned.

`Product.quantity` currently stores the stock balance. We must agree whether to keep that field during the initial separation or move the balance into an inventory model. There must be one authoritative stock balance, not two independently updated quantities.

Orders should request stock changes through inventory operations so that the balance and movement history stay consistent. Reservation and deduction timing remain business decisions to agree.

## 3. Accounts application

Owns:

- The custom user and user manager.
- Customer registration, login, logout/session handling and token refresh.
- Authentication backends and JWT token serializers.
- Account/profile operations and password recovery.
- Shared role definitions and reusable customer/staff/admin access checks.

Each business application remains responsible for its resource-specific rules. For example, `orders` decides whether a customer may view a particular order, using the authenticated user supplied by `accounts`.

Other applications should reference the user through `settings.AUTH_USER_MODEL`, with `get_user_model()` where a runtime model lookup is needed. The proposed user setting after the move is `accounts.CustomUser`; changing it requires an approved migration plan.

## 4. Orders application

Owns:

- Guest/account cart behaviour and backend cart persistence.
- Cart item quantities, removal and guest-cart merging.
- Checkout contact and delivery details.
- Order creation, purchase-price snapshots, order references and status changes.
- Payment records, payment status and the chosen provider integration.
- Order confirmation, fulfilment and customer delivery updates.

Payments remain within `orders` for this proposed split. There is no existing Payment model to move; its design is a separate agenda item. Creating this application does not approve a payment provider or payment workflow.

The order flow coordinates with `inventory` for stock changes. Financial enhancements involving tax, buying cost, profit and discounts remain owner-managed and outside the implementation scope of this proposal.

## Relationships and dependency direction

- `accounts` does not depend on catalogue, inventory or order models.
- `products` may reference accounts for staff attribution.
- `inventory` references products and the staff member recording a movement.
- `orders` references customers and products, and calls inventory operations for stock changes.
- Products and inventory should not import order/payment models to carry out normal catalogue or stock operations.

Keep shared authentication checks in `accounts` and stock-changing logic in `inventory`. Avoid copying the same business operation into multiple applications.

## Proposed project layout

```text
backend/
├── manage.py
├── backend/          # Django project settings and root URL configuration
├── accounts/         # Users, authentication and shared permissions
├── products/         # Industries/departments, categories and products
├── inventory/        # Stock balances and movements
└── orders/           # Carts, checkout, orders and payments
```

Each application should own its models, serializers, views, URLs, admin registration, tests and migrations. Business operations can live in an application-level `services.py` or `services/` package when needed. GraphQL types/resolvers should live with their owning application; the project composes the root schema.

The Django project continues to compose the installed apps, API routes and configuration. Preserve existing frontend API contracts during the initial move unless a specific route or response change is separately approved.

## Decisions to settle before implementation

1. Confirm the package names: `products`, `inventory`, `accounts` and `orders`.
2. Decide whether the first pass only moves existing functionality or also introduces new models/fields. Proposed default: move existing functionality first, then approve enhancements separately.
3. Decide where `Adverts` belongs. A small merchandising area within `products` is an option; a separate marketing app can be considered later. It must have an agreed destination before retiring `api_toyzum_app`.
4. Decide whether to retain `Product.quantity` temporarily or introduce an inventory balance model.
5. Agree how existing `SELLER` roles and product staff attribution map to the single-store structure.
6. Agree the fresh-database migration sequence, including creating the custom user in the accounts app's initial migration and updating cross-app references.
7. Confirm whether existing API paths stay unchanged for the first pass.

## Implementation sequence to approve later

1. Agree the application boundaries and outstanding decisions above.
2. Prepare the model mapping, cross-app relationships and fresh-database migration plan.
3. Move accounts/authentication, then products, inventory and orders, following their dependencies.
4. Update settings, imports, admin registration, root URLs and root GraphQL composition.
5. Reconcile missing inventory connections and move the relevant tests to their owning apps.
6. Apply migrations to an isolated fresh test database and verify the existing API contracts.
7. Test frontend integration before retiring the old application.

Do not delete or reset a local database, remove the old application, or redesign financial logic merely because those actions appear in this plan. Each requires approval within the agreed implementation scope.
