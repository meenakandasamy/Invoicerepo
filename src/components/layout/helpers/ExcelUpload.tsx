import {
  Box,
  Divider,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  data: any;
  toBackend?: boolean;
  onClose: () => void;
  onUpload: () => void;
};

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '85%',
  minHeight: '60vh',
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 3,
  display: 'flex',
  flexDirection: 'column',
};

const formatCellValue = (value: any) => {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  if (value === null || value === undefined) return '';
  return value.toString();
};

const ExcelPreviewModal = ({
  open,
  data,
  toBackend,
  onClose,
  onUpload,
}: Props) => {
  if (!open) return null;

  const headers = data.length ? Object.keys(data[0]) : [];

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* ===== Header ===== */}
        <Box px={3} py={2}>
          <Typography fontWeight={600} fontSize="1.25rem">
            Rent Excel Upload
          </Typography>
        </Box>

        <Divider />

        {/* ===== Content (Scrollable) ===== */}
        <Box flex={1} overflow="auto" px={2} py={1}>
          {data.length === 0 ? (
            <Typography>No data found</Typography>
          ) : (
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 600,
                        backgroundColor: '#f5f7fa',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {data.map((row: any, rowIndex: any) => (
                  <TableRow key={rowIndex} hover>
                    {headers.map((header) => (
                      <TableCell key={header} sx={{ whiteSpace: 'nowrap' }}>
                        {formatCellValue(row[header])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>

        <Divider />

        {/* ===== Footer (Bottom Right Buttons) ===== */}
        <Box px={3} py={2} display="flex" justifyContent="flex-end" gap={1}>
          <Button
            onClick={onClose}
            variant="outline"
            className="cursor-pointer"
            disabled={toBackend}
          >
            Close
          </Button>
          <Button onClick={onUpload} className="cursor-pointer">
            {toBackend ? 'Uploading...' : 'Upload'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ExcelPreviewModal;
