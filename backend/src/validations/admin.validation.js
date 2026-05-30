import Joi from 'joi';

export const adminSubscriptionsQuerySchema = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
