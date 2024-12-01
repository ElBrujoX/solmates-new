import { Schema, model } from 'mongoose';

const ScamReportSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  scam_type: { type: String },
  contract_address: String,
  risk_level: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'disputed', 'resolved'],
    default: 'pending'
  },
  loss_amount: Number,
  victims_count: Number,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  collection: 'scamreports'
});

ScamReportSchema.index({ title: 'text', description: 'text' });

const RiskIndicatorSchema = new Schema({
  indicator_type: { type: String, required: true },
  description: { type: String, required: true },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  metadata: {
    affected_users: Number,
    related_links: [String]
  }
}, {
  collection: 'riskindicators'
});

const LiveUpdateSchema = new Schema({
  update_type: {
    type: String,
    enum: ['scam_alert', 'risk_indicator', 'verification', 'recovery'],
    required: true
  },
  title: { type: String, required: true },
  description: String,
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'liveupdates'
});

const VerifiedScamSchema = new Schema({
  description: { type: String, required: true },
  scam_type: { type: String, required: true },
  contract_address: String,
  total_loss: { type: Number, default: 0 },
  victims_count: { type: Number, default: 0 },
  verified_at: { type: Date, default: Date.now },
  evidence_links: [String],
  related_cases: [String]
}, {
  collection: 'verifiedscams'
});

export const ScamReport = model('ScamReport', ScamReportSchema);
export const RiskIndicator = model('RiskIndicator', RiskIndicatorSchema);
export const LiveUpdate = model('LiveUpdate', LiveUpdateSchema);
export const VerifiedScam = model('VerifiedScam', VerifiedScamSchema); 