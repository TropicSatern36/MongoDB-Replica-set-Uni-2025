import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  DialogContentText,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function SchemaDetail() {
  const { schemaName } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [schemaName]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/${schemaName.toLowerCase()}`);
      console.log(`Response for ${schemaName}:`, response.data);
      setItems(response.data);
    } catch (error) {
      console.error(`Error fetching ${schemaName}:`, error);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEdit(false);
    setFormData({});
    setOpenFormDialog(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    const itemCopy = { ...item };
    delete itemCopy._id;
    delete itemCopy.__v;
    const formattedFormData = {};
    for (const key in itemCopy) {
        if (typeof itemCopy[key] === 'object') {
            formattedFormData[key] = JSON.stringify(itemCopy[key]);
        } else {
            formattedFormData[key] = itemCopy[key];
        }
    }
    setFormData(formattedFormData);
    setCurrentId(item._id);
    setOpenFormDialog(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setConfirmAction('delete');
    setOpenConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setOpenConfirmDialog(false);
    if (confirmAction === 'delete' && itemToDelete) {
      try {
        await axios.delete(`${API_BASE_URL}/${schemaName.toLowerCase()}/${itemToDelete._id}`);
        fetchItems();
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    } else if (confirmAction === 'submit') {
        handleSubmit();
    }
    setConfirmAction(null);
  };

  const handleSubmitClick = () => {
      setConfirmAction('submit');
      setOpenConfirmDialog(true);
  };

  const handleSubmit = async () => {
    const dataToSend = {};
    for (const key in formData) {
        try {
            dataToSend[key] = JSON.parse(formData[key]);
        } catch (e) {
            dataToSend[key] = formData[key];
        }
    }

    try {
      if (isEdit) {
        await axios.put(`${API_BASE_URL}/${schemaName.toLowerCase()}/${currentId}`, dataToSend);
      } else {
        await axios.post(`${API_BASE_URL}/${schemaName.toLowerCase()}`, dataToSend);
      }
      setOpenFormDialog(false);
      fetchItems();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const columns = items.length > 0
    ? Object.keys(items[0]).filter(key => key !== '_id' && key !== '__v')
    : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {schemaName} Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add New {schemaName}
        </Button>
      </Box>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && items.length === 0 && <Typography>No data available for {schemaName}.</Typography>}

      {!loading && items.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {
                        (() => {
                          const value = item[column];
                          if (value == null) return '';

                          if (Array.isArray(value)) {
                            if (value.length > 0 && typeof value[0] === 'object' && (value[0].name || value[0].username || value[0].email)) {
                                return value.map(item => item.name || item.username || item.email || JSON.stringify(item)).join(', ');
                            } else if (value.length > 0 && typeof value[0] === 'string'){
                                return value.join(', ');
                            }
                             else {
                              return `${value.length} items`;
                            }
                          }

                          if (column === 'address' && typeof value === 'object' && value !== null) {
                            return `${value.street}, ${value.city}, ${value.country}`;
                          }

                          if (typeof value === 'object' && value !== null && (value.name || value.username || value.email)) {
                              return value.name || value.username || value.email;
                          }

                          if (value instanceof Date && !isNaN(value.getTime())) {
                              return value.toLocaleDateString();
                          }
                           if (typeof value === 'string' && !isNaN(new Date(value).getTime())){
                             return new Date(value).toLocaleDateString();
                          }

                          if (typeof value === 'object' && value !== null) {
                            return JSON.stringify(value);
                          }

                          return value;
                        })()
                      }
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton onClick={() => handleEdit(item)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(item)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)}>
        <DialogTitle>{isEdit ? 'Edit' : 'Create'} {schemaName}</DialogTitle>
        <DialogContent>
           <DialogContentText>
            {isEdit ? `Editing ${schemaName} with ID: ${currentId}` : `Creating a new ${schemaName}`}
          </DialogContentText>
          {columns.map((column) => (
            <TextField
              key={column}
              margin="dense"
              name={column}
              label={column.charAt(0).toUpperCase() + column.slice(1)}
              type="text"
              fullWidth
              value={formData[column] || ''}
              onChange={handleInputChange}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitClick} color="primary">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmAction === 'delete' ? 'Confirm Deletion' : 'Confirm Submission'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmAction === 'delete'
              ? `Are you sure you want to delete this ${schemaName} item?`
              : `Are you sure you want to ${isEdit ? 'update' : 'create'} this ${schemaName} item?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            {confirmAction === 'delete' ? 'Delete' : (isEdit ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SchemaDetail; 