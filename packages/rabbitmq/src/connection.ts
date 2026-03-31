import amqp from "amqplib";
import { ENV } from "@repo/config";

// -----------------------------------------------------------------------------
// TYPE INFERENCE (The Fix)
// -----------------------------------------------------------------------------
// Instead of importing "Connection", we infer it from the connect function.
// This guarantees the type has 'createChannel' and 'close'.
type RabbitMQConnection = Awaited<ReturnType<typeof amqp.connect>>;
type RabbitMQChannel = Awaited<ReturnType<RabbitMQConnection["createChannel"]>>;

// -----------------------------------------------------------------------------
// STATE MANAGEMENT
// -----------------------------------------------------------------------------
let connection: RabbitMQConnection | null = null;
let channel: RabbitMQChannel | null = null;

let connectionPromise: Promise<RabbitMQConnection> | null = null;
let channelPromise: Promise<RabbitMQChannel> | null = null;

// -----------------------------------------------------------------------------
// LOGIC
// -----------------------------------------------------------------------------

export async function getRabbitMQConnection(): Promise<RabbitMQConnection> {
  if (connection) return connection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = amqp
    .connect(ENV.RABBITMQ_URL || "")
    .then((conn) => {
      connection = conn;
      console.log("✅ RabbitMQ Connected");

      // FIX: Typed 'err' as 'any' or 'unknown' to suppress "implicit any" error
      conn.on("error", (err: unknown) => {
        console.error("❌ RabbitMQ Connection Error:", err);
        resetConnection();
      });

      conn.on("close", () => {
        console.warn("⚠️ RabbitMQ Connection Closed");
        resetConnection();
      });

      return conn;
    })
    .catch((err: unknown) => {
      console.error("❌ Failed to connect to RabbitMQ:", err);
      resetConnection();
      throw err;
    });

  return connectionPromise;
}

export async function getRabbitMQChannel(): Promise<RabbitMQChannel> {
  if (channel) return channel;
  if (channelPromise) return channelPromise;

  channelPromise = getRabbitMQConnection()
    .then((conn) => conn.createChannel())
    .then((ch) => {
      channel = ch;
      console.log("✅ RabbitMQ Channel Created");

      // FIX: Typed 'err' as 'any' or 'unknown'
      ch.on("error", (err: unknown) => {
        console.error("❌ RabbitMQ Channel Error:", err);
        channel = null;
        channelPromise = null;
      });

      ch.on("close", () => {
        console.warn("⚠️ RabbitMQ Channel Closed");
        channel = null;
        channelPromise = null;
      });

      return ch;
    })
    .catch((err: unknown) => {
      console.error("❌ Failed to create RabbitMQ Channel:", err);
      channelPromise = null;
      throw err;
    });

  return channelPromise;
}

function resetConnection() {
  connection = null;
  connectionPromise = null;
  channel = null;
  channelPromise = null;
}

export async function closeRabbitMQ(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  } catch (err: unknown) {
    console.error("Error while closing RabbitMQ:", err);
  } finally {
    resetConnection();
    console.log("🛑 RabbitMQ connection closed gracefully.");
  }
}
