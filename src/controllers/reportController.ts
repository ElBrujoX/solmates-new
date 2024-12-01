import { Request, Response, NextFunction } from 'express';
import { ScamReport } from '../models/Watchtower';

export const reportController = {
  // Get all reports
  getReports: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const risk_level = req.query.risk_level as string;
      const status = req.query.status as string;

      const query: any = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (risk_level) query.risk_level = risk_level;
      if (status) query.status = status;

      const total = await ScamReport.countDocuments(query);
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const reports = await ScamReport.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        data: reports,
        page,
        limit,
        total,
        pages,
        filters: { search, risk_level, status }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get trending reports
  getTrendingReports: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const date = new Date();
      date.setDate(date.getDate() - days);

      const reports = await ScamReport.find({
        created_at: { $gte: date }
      })
      .sort({ victims_count: -1, loss_amount: -1 })
      .limit(10);

      res.json({ data: reports });
    } catch (error) {
      next(error);
    }
  },

  // Get single report
  getReport: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await ScamReport.findById(req.params.id);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }
      res.json({ data: report });
    } catch (error) {
      next(error);
    }
  },

  // Create report
  createReport: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = new ScamReport(req.body);
      await report.save();
      res.status(201).json({ data: report });
    } catch (error) {
      next(error);
    }
  },

  // Update report
  updateReport: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await ScamReport.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }
      res.json({ data: report });
    } catch (error) {
      next(error);
    }
  },

  // Delete report
  deleteReport: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await ScamReport.findByIdAndDelete(req.params.id);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Get related reports
  getRelatedReports: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await ScamReport.findById(req.params.id);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const relatedReports = await ScamReport.find({
        _id: { $ne: report._id },
        $or: [
          { scam_type: report.scam_type },
          { risk_level: report.risk_level }
        ]
      })
      .limit(5);

      res.json({ data: relatedReports });
    } catch (error) {
      next(error);
    }
  }
}; 