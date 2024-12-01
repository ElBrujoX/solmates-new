import { Request, Response } from 'express';
import { ScamReport, RiskIndicator, LiveUpdate, VerifiedScam } from '../models/Watchtower';

export const watchtowerController = {
  // Scam Reports
  async createReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await ScamReport.create({
        ...req.body,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      });
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await ScamReport.find().sort({ created_at: -1 });
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const report = await ScamReport.findById(req.params.id);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async verifyReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await ScamReport.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'verified',
          updated_at: new Date()
        },
        { new: true }
      );
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async disputeReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await ScamReport.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'disputed',
          updated_at: new Date()
        },
        { new: true }
      );
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Risk Indicators
  async getRiskIndicators(req: Request, res: Response): Promise<void> {
    try {
      const indicators = await RiskIndicator.find().sort({ created_at: -1 });
      res.json(indicators);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createRiskIndicator(req: Request, res: Response): Promise<void> {
    try {
      const indicator = await RiskIndicator.create({
        ...req.body,
        is_active: true,
        created_at: new Date()
      });
      res.status(201).json(indicator);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async toggleRiskIndicator(req: Request, res: Response): Promise<void> {
    try {
      const indicator = await RiskIndicator.findById(req.params.id);
      if (!indicator) {
        res.status(404).json({ error: 'Indicator not found' });
        return;
      }
      
      indicator.is_active = !indicator.is_active;
      await indicator.save();
      res.json(indicator);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Live Updates
  async getLiveUpdates(req: Request, res: Response): Promise<void> {
    try {
      const updates = await LiveUpdate.find().sort({ created_at: -1 });
      res.json(updates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createUpdate(req: Request, res: Response): Promise<void> {
    try {
      const update = await LiveUpdate.create({
        ...req.body,
        created_at: new Date()
      });
      res.status(201).json(update);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Verified Scams
  async getVerifiedScams(req: Request, res: Response): Promise<void> {
    try {
      const scams = await VerifiedScam.find().sort({ verified_at: -1 });
      res.json(scams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}; 