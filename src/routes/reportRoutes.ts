import express, { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { validateReport } from '../middleware/validation';

const router: Router = express.Router();

// Get reports with filters and pagination
router.get('/', reportController.getReports);

// Get trending reports
router.get('/trending', reportController.getTrendingReports);

// Get single report
router.get('/:id', reportController.getReport as express.RequestHandler);

// Create report
router.post('/', validateReport, reportController.createReport as express.RequestHandler);

// Update report
router.put('/:id', validateReport, reportController.updateReport as express.RequestHandler);

// Delete report
router.delete('/:id', reportController.deleteReport as express.RequestHandler);

export { router as reportRoutes }; 