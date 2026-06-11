import { prismaPostgres } from "@repo/db-postgres";

async function main() {
  const STALE_ORDER_MINUTES = 30;
  const staleBefore = new Date(Date.now() - STALE_ORDER_MINUTES * 60 * 1000);

  const staleOrders = await prismaPostgres.paymentOrder.findMany({
    where: {
      status: { in: ["PENDING", "PROCESSING"] },
      createdAt: { lt: staleBefore },
    },
  });

  console.log("Found stale orders:", staleOrders);

  for (const order of staleOrders) {
    console.log(`Failing stale order ${order.id}...`);
    await prismaPostgres.paymentOrder.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    console.log(`Failed order ${order.id}.`);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
