import prisma from '@/lib/prisma';
import { sendEmail } from '../email/resend';
import { logAudit } from '@/lib/audit';

export async function triggerAutomation(trigger: string, customerId: string, meta: any = {}) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || customer.subscriptionStatus !== 'SUBSCRIBED') {
        return { success: false, reason: "Customer not eligible or unsubscribed" };
    }

    const rules = await prisma.automationRule.findMany({
      where: { trigger, active: true },
    });

    for (const rule of rules) {
      // Basic condition check (if meta matches some JSON criteria)
      // For now, simpler implementation: send to all active rules for the trigger
      
      const { success } = await sendEmail({
        to: customer.email,
        subject: rule.emailSubject,
        html: `<h1>Hello ${customer.firstName}</h1><p>Trigger: ${trigger}</p>`, // Template resolution placeholder
      });

      if (success) {
          await prisma.emailLog.create({
              data: {
                  userId: rule.createdBy, // The rule owner
                  recipientEmail: customer.email,
                  subject: rule.emailSubject,
                  status: "SENT",
              }
          });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Automation error:', error);
    return { success: false, error };
  }
}
