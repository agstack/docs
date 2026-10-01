---
title: INATrace
linkTitle: INATrace
weight: 30
description: >
  Open Source track and trace for agricultural supply chains.
---

INATrace is a digital open-source solution designed to enhance the economic conditions of smallholder farmers by improving the traceability of global supply chains. Funded by the German Federal Ministry for Economic Cooperation and Development (BMZ) and implemented by GIZ, INATrace provides an efficient internal management system for cooperatives, digitally stores supply chain data, and supports compliance with regulations like the EU Deforestation Regulation (EUDR). It provides:

- 🔗 **Full supply chain transparency** — trace every step from smallholder farm to final buyer
- ⛓️ **Blockchain-backed trust** — immutable records on Hyperledger Fabric
- 🏢 **Multi-tenant, multi-value-chain** — one system for multiple organizations and commodity types
- 📱 **Mobile-first field data** — GPS polygon mapping, offline-capable farmer registration
- 📊 **Quality & compliance** — assure quality standards and support EU Deforestation Regulation (EUDR) compliance
- 💰 **Fair pricing** — transparent pricing and payment tracking for smallholder farmers

> *INATrace enhances the economic conditions of smallholder farmers by improving traceability of global supply chains.*

## Architecture

```text
      Cooperative staff                      Field officers
              |                                     |
      +-------v--------+                   +--------v--------+
      |   Web client   |                   |   Mobile app    |
      |   (Angular)    |                   |  (Expo / RN)    |
      +-------+--------+                   +--------+--------+
              |                            | Realm store, MapBox
              |                            | works offline, syncs later
              |        HTTPS, JWT cookie            |
              +------------------+------------------+
                                 |
                      +----------v-----------+
                      |     Backend API      |
                      |  Spring Boot, /api   |
                      +----------+-----------+
                                 |
              +------------------+------------------+
              |                  |                  |
        +-----v-----+      +-----v-----+      +-----v------+
        |   MySQL   |      |   Beyco   |      |   SMTP,    |
        |  supply   |      |  orders   |      |  exchange  |
        |   chain   |      |           |      |   rates    |
        +-----------+      +-----------+      +------------+
```

Two clients talk to one Spring Boot API over HTTPS, authenticating with a JWT the
backend returns as an `inatrace-accessToken` cookie; every endpoint it defines sits
under `/api`. The Angular client is where cooperatives configure value chains,
companies, facilities and payments. The mobile app is built for the field — it keeps
its own Realm database so farmer registration and GPS polygon mapping work with no
connectivity, and syncs once a connection returns. MySQL holds the traceability
graph — farmers and their plots, deliveries, processing actions, stock and customer
orders, linked closely enough that a finished product can be traced back to the farms
it came from. Outbound, the backend pushes orders to Beyco, syncs daily exchange
rates for the currencies a tenant has enabled, and sends mail over SMTP.

## Component repositories

| Repository | Stack | Current documentation |
|---|---|---|
| [inatrace-backend](https://github.com/agstack/inatrace-backend) | Java, Spring Boot | `README.md` (~470 lines: config properties, auth, database, Docker), `TECHNICAL_DOCUMENTATION.md` |
| [inatrace-frontend](https://github.com/agstack/inatrace-frontend) | Angular, TypeScript | `README.md` (~310 lines: feature walkthrough) |



## 📜 License

All INATrace repositories are licensed under the **Mozilla Public License 2.0** (MPL-2.0).
