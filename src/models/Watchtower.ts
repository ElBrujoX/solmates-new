import { Schema, model } from 'mongoose';

const ScamReportSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  scam_type: { type: String },
  contract_address: String,
  risk_level: {
    type: String,
    required: true,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: '{VALUE} is not a valid risk level'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'disputed', 'resolved'],
    default: 'pending'
  },
  loss_amount: {
    type: Number,
    min: [0, 'Loss amount cannot be negative']
  },
  victims_count: {
    type: Number,
    min: [0, 'Victims count cannot be negative']
  },
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