import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { ocrService, isOCRSupported, isAIParsingAvailable, type ParsedReceipt } from '../../services/ocrService';

interface Props {
  onReceiptParsed: (receipt: ParsedReceipt) => void;
  onClose: () => void;
  userCategories: Array<{ id: string; name: string }>;
}

export const ReceiptScanner = ({ onReceiptParsed, onClose, userCategories }: Props) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t('receipt.error_not_image') || 'Please select an image file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process receipt
    setLoading(true);
    setError(null);
    setProgress(10);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const result = await ocrService.scanReceipt(file, userCategories);

      clearInterval(progressInterval);
      setProgress(100);

      // Show success state briefly
      setSuccess(true);
      setTimeout(() => {
        onReceiptParsed(result);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan receipt');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearPreview = () => {
    setPreview(null);
    setError(null);
    setProgress(0);
    setSuccess(false);
  };

  if (!isOCRSupported()) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">
          {t('receipt.ocr_not_supported') || 'Receipt scanning is not supported in your browser'}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('receipt.scan_receipt')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={isAIParsingAvailable() ? 'Claude AI + OCR' : 'OCR Only'}
              size="small"
              color={isAIParsingAvailable() ? 'success' : 'default'}
            />
          </Stack>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Preview Area */}
      {preview ? (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <img
              src={preview}
              alt="Receipt preview"
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            {!loading && !success && (
              <IconButton
                onClick={handleClearPreview}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {loading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {progress < 30
                  ? t('receipt.processing_image')
                  : progress < 70
                  ? t('receipt.extracting_text')
                  : t('receipt.parsing_data')}
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}

          {success && (
            <Alert icon={<SuccessIcon />} severity="success" sx={{ mb: 2 }}>
              {t('receipt.scan_success')}
            </Alert>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            mb: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t('receipt.upload_instructions')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('receipt.upload_tips')}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={handleCameraClick}
              disabled={loading}
            >
              {t('receipt.take_photo')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleUploadClick}
              disabled={loading}
            >
              {t('receipt.upload_image')}
            </Button>
          </Stack>
        </Box>
      )}

      {/* Info */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          {isAIParsingAvailable()
            ? t('receipt.ai_info')
            : t('receipt.ocr_info')}
        </Typography>
      </Alert>

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1">
              {t('receipt.processing')}
            </Typography>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};
