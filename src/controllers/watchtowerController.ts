import { Request, Response } from 'express';
import { ScamReport, RiskIndicator, LiveUpdate, VerifiedScam } from '../models/Watchtower';

interface SortOptions {
  [key: string]: 1 | -1;
}

interface TrendingStats {
  scam_type: string;
  risk_level: string;
  count: number;
  total_loss: number;
  total_victims: number;
  latest_reports: any[];
}

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search as string;
      const sortField = (req.query.sort_by as string) || 'created_at';
      const sortOrder = req.query.sort_order === 'asc' ? 1 : -1;

      // Build query
      const query: any = {};

      // Search
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { contract_address: { $regex: search, $options: 'i' } }
        ];
      }

      // Filters
      if (req.query.risk_level) {
        query.risk_level = req.query.risk_level;
      }

      if (req.query.status) {
        query.status = req.query.status;
      }

      // Date range
      if (req.query.from || req.query.to) {
        query.created_at = {};
        if (req.query.from) {
          query.created_at.$gte = new Date(req.query.from as string);
        }
        if (req.query.to) {
          query.created_at.$lte = new Date(req.query.to as string);
        }
      }

      // Amount filters
      if (req.query.min_loss) {
        query.loss_amount = { $gte: parseFloat(req.query.min_loss as string) };
      }

      if (req.query.min_victims) {
        query.victims_count = { $gte: parseInt(req.query.min_victims as string) };
      }

      // Build sort options
      const sortOptions: SortOptions = { [sortField]: sortOrder };

      const reports = await ScamReport.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await ScamReport.countDocuments(query);

      res.json({
        data: reports,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        filters: {
          search,
          risk_level: req.query.risk_level,
          status: req.query.status,
          min_loss: req.query.min_loss,
          min_victims: req.query.min_victims,
          from: req.query.from,
          to: req.query.to
        }
      });
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search as string;

      // Build search query
      const query: any = {};
      if (search) {
        query.$or = [
          { indicator_type: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Add severity filter
      if (req.query.severity) {
        query.severity = req.query.severity;
      }

      // Add active status filter
      if (req.query.is_active) {
        query.is_active = req.query.is_active === 'true';
      }

      const indicators = await RiskIndicator.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await RiskIndicator.countDocuments(query);

      res.json({
        data: indicators,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      });
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search as string;

      // Build search query
      const query: any = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Add update type filter
      if (req.query.update_type) {
        query.update_type = req.query.update_type;
      }

      // Add active status filter
      if (req.query.is_active) {
        query.is_active = req.query.is_active === 'true';
      }

      const updates = await LiveUpdate.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await LiveUpdate.countDocuments(query);

      res.json({
        data: updates,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      });
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search as string;

      // Build search query
      const query: any = {};
      if (search) {
        query.$or = [
          { description: { $regex: search, $options: 'i' } },
          { scam_type: { $regex: search, $options: 'i' } },
          { contract_address: { $regex: search, $options: 'i' } }
        ];
      }

      // Add filters
      if (req.query.scam_type) {
        query.scam_type = req.query.scam_type;
      }

      if (req.query.min_loss) {
        query.total_loss = { $gte: parseFloat(req.query.min_loss as string) };
      }

      if (req.query.min_victims) {
        query.victims_count = { $gte: parseInt(req.query.min_victims as string) };
      }

      const scams = await VerifiedScam.find(query)
        .sort({ verified_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await VerifiedScam.countDocuments(query);

      res.json({
        data: scams,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await Promise.all([
        ScamReport.countDocuments(),
        ScamReport.countDocuments({ status: 'verified' }),
        ScamReport.countDocuments({ status: 'disputed' }),
        ScamReport.countDocuments({ risk_level: 'high' }),
        ScamReport.aggregate([
          {
            $group: {
              _id: null,
              totalLoss: { $sum: '$loss_amount' },
              totalVictims: { $sum: '$victims_count' }
            }
          }
        ])
      ]);

      res.json({
        total_reports: stats[0],
        verified_reports: stats[1],
        disputed_reports: stats[2],
        high_risk_reports: stats[3],
        total_loss: stats[4][0]?.totalLoss || 0,
        total_victims: stats[4][0]?.totalVictims || 0
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRiskStats(req: Request, res: Response): Promise<void> {
    try {
      const riskStats = await ScamReport.aggregate([
        {
          $group: {
            _id: '$risk_level',
            count: { $sum: 1 },
            total_loss: { $sum: '$loss_amount' },
            reports: { $push: '$$ROOT' }
          }
        },
        {
          $project: {
            risk_level: '$_id',
            count: 1,
            total_loss: 1,
            latest_reports: { $slice: ['$reports', 5] }
          }
        }
      ]);

      res.json(riskStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTrendingScams(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - days);

      const trendingScams = await ScamReport.aggregate([
        {
          $match: {
            created_at: { $gte: minDate }
          }
        },
        {
          $group: {
            _id: {
              scam_type: '$scam_type',
              risk_level: '$risk_level'
            },
            count: { $sum: 1 },
            total_loss: { $sum: '$loss_amount' },
            total_victims: { $sum: '$victims_count' },
            latest_reports: { $push: '$$ROOT' }
          }
        },
        {
          $project: {
            _id: 0,
            scam_type: '$_id.scam_type',
            risk_level: '$_id.risk_level',
            count: 1,
            total_loss: 1,
            total_victims: 1,
            latest_reports: { $slice: ['$latest_reports', 5] }
          }
        },
        {
          $sort: { count: -1, total_loss: -1 }
        }
      ]) as TrendingStats[];

      res.json({
        timeframe: `${days} days`,
        stats: trendingScams
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRelatedScams(req: Request, res: Response): Promise<void> {
    try {
      const reportId = req.query.reportId as string;
      if (!reportId) {
        res.status(400).json({ error: 'Report ID is required' });
        return;
      }

      const report = await ScamReport.findById(reportId);
      
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const relatedScams = await ScamReport.find({
        $and: [
          { _id: { $ne: reportId } },
          {
            $or: [
              { scam_type: report.get('scam_type') },
              { risk_level: report.get('risk_level') },
              { contract_address: report.get('contract_address') }
            ]
          }
        ]
      })
      .sort({ created_at: -1 })
      .limit(5);

      res.json({
        original_report: report,
        related_scams: relatedScams,
        similarity_factors: {
          same_type: relatedScams.filter(s => s.get('scam_type') === report.get('scam_type')).length,
          same_risk: relatedScams.filter(s => s.get('risk_level') === report.get('risk_level')).length,
          same_contract: relatedScams.filter(s => s.get('contract_address') === report.get('contract_address')).length
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}; 