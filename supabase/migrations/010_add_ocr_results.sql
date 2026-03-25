-- Migration: 010_add_ocr_results
-- Description: Add OCR extraction columns to payments table for auto-matching

ALTER TABLE payments
  ADD COLUMN ocr_extracted_text TEXT,
  ADD COLUMN ocr_confidence DECIMAL(5,2),
  ADD COLUMN ocr_matched BOOLEAN DEFAULT false;
