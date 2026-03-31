import { Logger } from "@repo/libs";
import { consumeQueue, Queues } from "@repo/rabbitmq";
import { sendEmail } from "../services/email.service.js";

const logger  = new Logger("EmailConsumer")
export async function startEmailConsumer() {
  await consumeQueue(Queues.EMAIL, async (message) => {
    try {
      const { to, template, data } = message;
      await sendEmail(to, template, data);
      logger.info("Email sent", { to, template });
    } catch (error) {
      logger.error('Failed to send email', error);
            throw error;
    }
  });
}
