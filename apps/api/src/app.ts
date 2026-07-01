import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { attachPrincipal } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { asyncHandler, ok } from './lib/http.js';

import { authRouter } from './modules/auth/auth.router.js';
import { campaignsRouter } from './modules/campaigns/campaigns.router.js';
import { qrRouter, qrPublicRouter } from './modules/qr/qr.router.js';
import { stampsRouter } from './modules/stamps/stamps.router.js';
import { rewardsRouter } from './modules/rewards/rewards.router.js';
import { customerRouter } from './modules/customer/customer.router.js';
import { branchesRouter } from './modules/branches/branches.router.js';
import { staffRouter } from './modules/staff/staff.router.js';
import { crmRouter } from './modules/crm/crm.router.js';
import { analyticsRouter } from './modules/analytics/analytics.router.js';
import { fraudRouter } from './modules/fraud/fraud.router.js';
import { billingRouter } from './modules/billing/billing.router.js';
import { adminRouter } from './modules/admin/admin.router.js';
import { growthCustomerRouter, growthMerchantRouter } from './modules/growth/growth.router.js';

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));
  app.use(attachPrincipal);

  app.get('/health', asyncHandler(async (_req, res) => ok(res, { status: 'ok', ts: new Date().toISOString() })));

  const api = express.Router();
  api.use('/auth', authRouter);
  api.use('/campaigns', campaignsRouter);
  api.use('/qr', qrRouter);
  api.use('/public', qrPublicRouter); // GET /public/resolve/:token
  api.use('/stamps', stampsRouter);
  api.use('/rewards', rewardsRouter);
  api.use('/me', customerRouter); // customer self-service
  api.use('/branches', branchesRouter);
  api.use('/staff', staffRouter);
  api.use('/crm', crmRouter);
  api.use('/analytics', analyticsRouter);
  api.use('/fraud', fraudRouter);
  api.use('/billing', billingRouter);
  api.use('/admin', adminRouter);
  api.use('/growth', growthCustomerRouter); // customer growth actions
  api.use('/growth/merchant', growthMerchantRouter); // merchant growth dashboards
  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
