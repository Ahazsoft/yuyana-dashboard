import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface BoxSegmentCriteria {
  country?: string;
  status?: string;
  subscriptionStatus?: string;
  leadStatus?: string;
  source?: string;
}

export async function getSegmentsByCriteria(criteria: BoxSegmentCriteria) {
  const where: any = {
    subscriptionStatus: criteria.subscriptionStatus || 'SUBSCRIBED',
  };

  if (criteria.country) {
    where.country = criteria.country;
  }
  if (criteria.status) {
    where.status = criteria.status;
  }
  if (criteria.source) {
    where.source = criteria.source;
  }

  // Relations
  if (criteria.leadStatus) {
    where.leads = {
      some: {
        status: criteria.leadStatus,
      },
    };
  }

  const customers = await prisma.customer.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  return customers;
}

export async function getSegmentRecipientCount(criteria: BoxSegmentCriteria) {
  const where: any = {
    subscriptionStatus: criteria.subscriptionStatus || 'SUBSCRIBED',
  };

  if (criteria.country) where.country = criteria.country;
  if (criteria.status) where.status = criteria.status;
  if (criteria.source) where.source = criteria.source;
  if (criteria.leadStatus) {
    where.leads = { some: { status: criteria.leadStatus } };
  }

  return await prisma.customer.count({ where });
}
