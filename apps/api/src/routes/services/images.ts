import { Router } from 'express';
import multer from 'multer';
import { body, param, validationResult } from 'express-validator';
import { authenticate } from '../../middleware/auth.js';
import storageService from '../../services/storageService.js';
import { Service } from '../../models/Service.js';
import logger from '../../config/logger.js';
import { Request, Response, NextFunction } from 'express';

const router: Router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Validation middleware
const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  };
};

// Validation rules
const uploadImageValidation = [
  param('id').isMongoId().withMessage('Invalid service ID'),
];

/**
 * @route   POST /api/v1/services/:id/image
 * @desc    Upload image for a service
 * @access  Admin, Reception
 */
router.post(
  '/:id/image',
  authenticate,
  upload.single('image'),
  validate(uploadImageValidation),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      // Find the service
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      // Delete old image if exists
      if (service.imageUrl) {
        try {
          await storageService.deleteServiceImage(service.imageUrl);
        } catch (error) {
          logger.warn('Failed to delete old service image:', error);
          // Continue with upload even if old image deletion fails
        }
      }

      // Upload new image
      const imageUrl = await storageService.uploadServiceImage(
        id,
        file.buffer,
        file.originalname,
        file.mimetype
      );

      logger.info(`Image uploaded successfully: ${imageUrl}`);

      // Update service with new image URL
      service.imageUrl = imageUrl;
      logger.info(`About to save service with imageUrl: ${imageUrl}`);
      
      try {
        const savedService = await service.save();
        logger.info(`Service saved successfully: ${id}`, { imageUrl });
      } catch (saveError) {
        logger.error('Error saving service:', saveError);
        logger.error('Service data before save:', {
          id: service._id,
          name: service.name,
          imageUrl: service.imageUrl
        });
        throw saveError; // Re-throw to be caught by outer catch
      }

      res.json({
        success: true,
        message: 'Service image uploaded successfully',
        data: {
          service: {
            _id: service._id,
            name: service.name,
            imageUrl: service.imageUrl,
          },
        },
      });
    } catch (error) {
      logger.error('Service image upload failed:', error);
      
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB',
          });
        }
      }

      // Provide more specific error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Detailed error:', { 
        message: errorMessage, 
        stack: error instanceof Error ? error.stack : undefined 
      });

      res.status(500).json({
        success: false,
        message: 'Failed to upload service image',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/services/:id/image
 * @desc    Delete image for a service
 * @access  Admin, Reception
 */
router.delete(
  '/:id/image',
  authenticate,
  validate([param('id').isMongoId().withMessage('Invalid service ID')]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Find the service
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      if (!service.imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Service has no image to delete',
        });
      }

      // Delete image from storage
      await storageService.deleteServiceImage(service.imageUrl);

      // Remove image URL from service
      service.imageUrl = undefined;
      await service.save();

      logger.info(`Service image deleted: ${id}`);

      res.json({
        success: true,
        message: 'Service image deleted successfully',
        data: {
          service: {
            _id: service._id,
            name: service.name,
            imageUrl: null,
          },
        },
      });
    } catch (error) {
      logger.error('Service image deletion failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete service image',
      });
    }
  }
);

/**
 * @route   GET /api/v1/services/:id/image/upload-url
 * @desc    Get presigned URL for direct upload
 * @access  Admin, Reception
 */
router.get(
  '/:id/image/upload-url',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid service ID'),
    body('fileName').notEmpty().withMessage('File name is required'),
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fileName } = req.body;

      // Verify service exists
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      // Generate presigned URL
      const uploadUrl = await storageService.getPresignedUrl(`services/service-${id}-${Date.now()}.${fileName.split('.').pop()}`, 3600);

      res.json({
        success: true,
        data: {
          uploadUrl,
          serviceId: id,
        },
      });
    } catch (error) {
      logger.error('Failed to generate upload URL:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate upload URL',
      });
    }
  }
);

export default router;
