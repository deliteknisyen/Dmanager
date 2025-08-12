import { getDb } from "@/lib/mongo";

async function ensureIndexes() {
  const db = await getDb();

  // Define collections and their indexes
  const specs: Array<{
    name: string;
    indexes?: Array<{ keys: Record<string, 1 | -1>; options?: Record<string, any> }>
  }> = [
    {
      name: "products",
      indexes: [
        { keys: { code: 1 }, options: { unique: true, name: "ux_products_code" } },
        { keys: { updatedAt: -1 }, options: { name: "ix_products_updatedAt" } },
      ],
    },
    {
      name: "orders",
      indexes: [
        { keys: { orderId: 1 }, options: { unique: true, name: "ux_orders_orderId" } },
        { keys: { createdAt: -1 }, options: { name: "ix_orders_createdAt" } },
      ],
    },
    {
      name: "shipments",
      indexes: [
        { keys: { trackingNumber: 1 }, options: { unique: true, name: "ux_shipments_trackingNumber" } },
        { keys: { updatedAt: -1 }, options: { name: "ix_shipments_updatedAt" } },
      ],
    },
    {
      name: "events",
      indexes: [
        { keys: { createdAt: -1 }, options: { name: "ix_events_createdAt" } },
        { keys: { type: 1 }, options: { name: "ix_events_type" } },
      ],
    },
    {
      name: "error_codes",
      indexes: [
        { keys: { code: 1 }, options: { unique: true, name: "ux_error_codes_code" } },
      ],
    },
    {
      name: "feedback",
      indexes: [
        { keys: { createdAt: -1 }, options: { name: "ix_feedback_createdAt" } },
      ],
    },
    {
      name: "cache",
      indexes: [
        { keys: { key: 1 }, options: { unique: true, name: "ux_cache_key" } },
        { keys: { expiresAt: 1 }, options: { name: "ix_cache_expiresAt" } },
      ],
    },
  ];

  // Ensure collections and indexes
  for (const spec of specs) {
    const exists = await db.listCollections({ name: spec.name }).hasNext();
    if (!exists) {
      await db.createCollection(spec.name);
      console.log(`Created collection: ${spec.name}`);
    }
    if (spec.indexes && spec.indexes.length) {
      await db.collection(spec.name).createIndexes(
        spec.indexes.map((i) => ({ key: i.keys, ...i.options })) as any
      );
      console.log(`Ensured indexes for: ${spec.name}`);
    }
  }
}

(async () => {
  try {
    await ensureIndexes();
    console.log("Database initialization complete.");
    process.exit(0);
  } catch (err) {
    console.error("DB init failed:", err);
    process.exit(1);
  }
})();
