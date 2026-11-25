# Gamehouse Kenya development agenda

This document lists topics to discuss and agree on. A listed topic is not approval to implement it.

## Working agreement

- Discuss the requirements, options and proposed changes first.
- Wait for the owner's explicit approval before changing application code, tests, migrations or database data.
- Approval applies only to the agreed scope. Bring additional changes back for discussion.
- The owner is handling tax, buying cost, profit and discount enhancements. Do not implement these without a separate explicit request.
- Gamehouse Kenya is one store managed by the owner's team, not a marketplace.
- The owner has confirmed a fresh database with `0001_initial.py` as the migration baseline.

## 0. Backend application structure

Discuss the proposed separation in [backend-architecture.md](backend-architecture.md):

- `products`: industries/departments, categories and products.
- `inventory`: stock balances, receipts and movement history.
- `accounts`: authentication, users, roles and shared permissions.
- `orders`: carts, checkout, orders and payments.

Agree model ownership, dependency direction, adverts, stock-balance storage and the migration/API compatibility plan before approving implementation.

## 1. Inventory

- Confirm how staff receive new stock without replacing the existing quantity.
- Review the current inventory screen, model and missing backend connections.
- Agree stock history, receipt references and protection against duplicate submissions.
- Define corrections, damaged stock, supplier returns and customer returns.
- Decide when sales deduct stock and cancellations restore it.

## 2. Roles and permissions

- Define customer, staff and administrator responsibilities.
- Decide who may create, edit or remove products, departments, categories and adverts.
- Agree access to inventory, orders and customer information.
- Review the legacy `SELLER` role against the single-store business model.

## 3. Cart

- Agree guest-cart and signed-in-cart behaviour.
- Define backend saving, quantity updates and item removal.
- Decide how guest and account carts merge after login.
- Handle unavailable products, insufficient stock and changed prices.
- Keep each customer's cart private.

## 4. Checkout

- Define required customer contact and delivery details.
- Agree guest checkout versus sign-in requirements.
- Define the final order review, delivery charges and authoritative totals.
- Agree validation and protection against repeated submissions.

## 5. Orders

- Define order creation, unique references and saved purchase prices.
- Agree stock validation, reservation and deduction timing.
- Define order statuses and who may change them.
- Agree cancellation, return and refund rules.
- Define customer confirmation, order history and staff fulfilment controls.

## 6. Payments and delivery

- Choose launch payment methods and when payment is collected.
- Define confirmed, pending and failed payment behaviour.
- Decide delivery regions, fees and pickup availability.
- Choose own delivery, courier delivery or both.
- Agree delivery updates, tracking and customer notifications.

## 7. Launch readiness

- Review the complete signup-to-delivery journey on mobile and desktop.
- Agree the required tests and acceptance criteria.
- Prepare representative products, photos, descriptions and stock.
- Confirm store contact information, delivery policies, returns and refunds.
- Plan hosting, HTTPS, configuration, backups, logging and recovery.

## Decision and approval log

No implementation is approved by this agenda. Record explicit approvals below as they are given.

| Date | Topic | Agreed scope | Approval status |
| --- | --- | --- | --- |
| 2026-11-23 | Backend application structure | Document the proposed four-app separation | Documentation only; implementation not approved |
