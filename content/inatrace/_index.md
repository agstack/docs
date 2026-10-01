---
title: INATrace
linkTitle: INATrace
weight: 30
description: >
  Open Source track and trace for agricultural supply chains.
---

INATrace is a digital open-source solution designed to enhance the economic conditions of smallholder farmers by improving the traceability of global supply chains. Funded by the German Federal Ministry for Economic Cooperation and Development (BMZ) and implemented by GIZ, INATrace provides an efficient internal management system for cooperatives, digitally stores supply chain data, and supports compliance with regulations like the EU Deforestation Regulation (EUDR). It provides:

- 🔗 **Full supply chain transparency** — trace every step from smallholder farm to final buyer
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

Web Client and mobile app talk to one Spring Boot API over HTTPS.
The Web Client is where cooperatives and associations configure value chains,
companies, facilities and payments.

The mobile app is built for the field — it keeps its own Realm database so
farmer registration and GPS polygon mapping work with no connectivity, and
syncs once a connection returns.
 
The system holds the traceability graph — farmers and their plots, deliveries,
processing actions, stock and customer orders, linked closely enough that a finished
product can be traced back to the farms it came from. Outbound, the backend pushes
orders to Beyco, syncs daily exchange rates for the currencies a tenant has enabled,
and sends mail over SMTP.

## Component repositories

| Repository | Stack | Documentation |
|---|---|---|
| [inatrace-frontend](https://github.com/agstack/inatrace-frontend) | Angular, TypeScript | [Web frontend](frontend/) — imported from its `docs/` |
| [inatrace-backend](https://github.com/agstack/inatrace-backend) | Java, Spring Boot | [Backend](backend/) — imported from its `docs/` |

## License

All INATrace repositories are licensed under the **Mozilla Public License 2.0** (MPL-2.0).
