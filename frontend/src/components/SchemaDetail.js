import React, { useState, useEffect, useMemo } from 'react';
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
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';
import axios from 'axios';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [categories, setCategories] = useState([]); // State for categories
  const [users, setUsers] = useState([]); // State for users
  const [products, setProducts] = useState([]); // State for products
  const [orders, setOrders] = useState([]); // State for orders

  useEffect(() => {
    fetchItems();
    // Fetch related data based on schema
    if (schemaName.toLowerCase() === 'product') {
        fetchCategories();
    }
    if (schemaName.toLowerCase() === 'order') {
        fetchUsers();
    }
     if (schemaName.toLowerCase() === 'review') {
        fetchUsers();
        fetchProducts();
    }
    if (schemaName.toLowerCase() === 'wishlist') {
        fetchUsers();
        fetchProducts(); // Fetch products for wishlist
    }
    if (schemaName.toLowerCase() === 'payment') {
        fetchUsers();
        fetchOrders(); // Fetch orders for payment
    }
  }, [schemaName]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/category`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

     const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/product`);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/order`);
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };


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
        const value = itemCopy[key];
        // Special handling for nested address object in User schema
        if (schemaName.toLowerCase() === 'user' && key === 'address' && typeof value === 'object' && value !== null) {
            // Flatten address fields for form display
            formattedFormData['address.street'] = value.street || '';
            formattedFormData['address.city'] = value.city || '';
            formattedFormData['address.postalCode'] = value.postalCode || '';
            formattedFormData['address.country'] = value.country || '';
        } else if (schemaName.toLowerCase() === 'product' && key === 'category' && typeof value === 'object' && value !== null) {
             // For product category, store the ObjectId if populated, otherwise handle as string
             formattedFormData[key] = value._id || ''; // Assuming _id is present if populated
        } else if (schemaName.toLowerCase() === 'order' && key === 'user' && typeof value === 'object' && value !== null) {
            // For order user, store the ObjectId if populated
            formattedFormData[key] = value._id || '';
        } else if (schemaName.toLowerCase() === 'review' && key === 'user' && typeof value === 'object' && value !== null) {
            // For review user, store the ObjectId if populated
            formattedFormData[key] = value._id || '';
        } else if (schemaName.toLowerCase() === 'review' && key === 'product' && typeof value === 'object' && value !== null) {
            // For review product, store the ObjectId if populated
            formattedFormData[key] = value._id || '';
        } else if (schemaName.toLowerCase() === 'wishlist' && key === 'user' && typeof value === 'object' && value !== null) {
             // For wishlist user, store the ObjectId if populated
             formattedFormData[key] = value._id || '';
         } else if (schemaName.toLowerCase() === 'wishlist' && key === 'products' && Array.isArray(value)) {
             // For wishlist products, store the array of ObjectIds (if populated, value will be objects)
             formattedFormData[key] = value.map(p => p._id || p); // Map to _id if populated, otherwise keep ID
         } else if (schemaName.toLowerCase() === 'payment' && (key === 'user' || key === 'order') && typeof value === 'object' && value !== null) {
             // For payment user and order, store the ObjectId if populated
             formattedFormData[key] = value._id || '';
        } else if (typeof value === 'object' && value !== null) {
            // Stringify other objects for display
            formattedFormData[key] = JSON.stringify(value);
        } else {
            formattedFormData[key] = value;
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
        // Optionally show an error message to the user
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
    // Iterate through formData and reconstruct objects/arrays
    for (const key in formData) {
        const value = formData[key];
        // Special handling for nested address object in User schema
         if (schemaName.toLowerCase() === 'user' && key.startsWith('address.')) {
             const [objKey, prop] = key.split('.');
             if (!dataToSend[objKey]) {
                 dataToSend[objKey] = {};
             }
             dataToSend[objKey][prop] = value;
         } else if (schemaName.toLowerCase() === 'wishlist' && key === 'products' && Array.isArray(value)) {
            // For wishlist products, send the array of ObjectIds directly
            dataToSend[key] = value;
         } else {
            try {
                 // Attempt to parse if it looks like JSON, otherwise keep as string/primitive
                 // Handle case where value might be an ObjectId string (e.g., for user in Order, product/user in Review, user/order in Payment)
                dataToSend[key] = value && typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/) ? value : JSON.parse(value);
            } catch (e) {
                // Special handling for rating to ensure it's a number
                if (schemaName.toLowerCase() === 'review' && key === 'rating') {
                    dataToSend[key] = parseInt(value, 10);
                 } else {
                     // Special handling for amount to ensure it's a number
                    if (schemaName.toLowerCase() === 'payment' && key === 'amount') {
                         dataToSend[key] = parseFloat(value);
                    } else {
                         dataToSend[key] = value;
                    }
                 }
            }
        }
    }

    // Frontend validation for Review schema
    if (schemaName.toLowerCase() === 'review') {
        const rating = dataToSend.rating;
        if (rating < 1 || rating > 5) {
            alert('Rating must be between 1 and 5.');
            return; // Prevent submission
        }
    }

     // Frontend validation for Payment schema
     if (schemaName.toLowerCase() === 'payment') {
        const amount = dataToSend.amount;
        if (amount === undefined || amount === null || isNaN(amount) || amount < 0) {
            alert('Amount must be a positive number.');
            return; // Prevent submission
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
      // Optionally show an error message to the user
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (schemaName.toLowerCase() === 'wishlist' && name === 'products') {
        // For wishlist products multi-select, value is an array of selected IDs
        setFormData((prev) => ({
            ...prev,
            [name]: typeof value === 'string' ? value.split(',') : value,
          }));

    } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleSortDirectionChange = (event) => {
    setSortDirection(event.target.value);
  };

  const columns = items.length > 0
    ? Object.keys(items[0]).filter(key => key !== '_id' && key !== '__v')
    : [];

  const filteredAndSortedItems = useMemo(() => {
    let filteredItems = items;

    if (searchTerm) {
      filteredItems = items.filter(item =>
        Object.values(item).some(value =>
          value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortBy) {
      filteredItems.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue == null || bValue == null) return 0;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
             return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

         // Attempt to compare dates if possible
         const aDate = new Date(aValue);
         const bDate = new Date(bValue);

         if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
             return sortDirection === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
         }

        // Fallback for other types (e.g., booleans, objects converted to strings)
         const aStr = aValue.toString();
         const bStr = bValue.toString();
         return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);

      });
    }

    return filteredItems;
  }, [items, searchTerm, sortBy, sortDirection]);


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

      {/* Search and Sort Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
         <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy || ''}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="">None</MenuItem>
              {columns.map(column => (
                  <MenuItem key={column} value={column}>
                      {column.charAt(0).toUpperCase() + column.slice(1)}
                  </MenuItem>
              ))}
            </Select>
         </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small" disabled={!sortBy}> {/* Disable if no column is selected */}
            <InputLabel>Direction</InputLabel>
             <Select
              value={sortDirection}
              label="Direction"
              onChange={handleSortDirectionChange}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>

      </Box>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && items.length === 0 && <Typography>No data available for {schemaName}.</Typography>}

      {!loading && filteredAndSortedItems.length > 0 && (
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
              {filteredAndSortedItems.map((item) => (
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
                            } else if (value.length > 0 && typeof value[0] === 'object' && (value[0].product && (value[0].product.name || value[0].product.username || value[0].product.email))) {
                                // Handle array of embedded documents like in Order products
                                return value.map(item => item.product ? (item.product.name || item.product.username || item.product.email || JSON.stringify(item.product)) : JSON.stringify(item)).join(', ');
                             } else {
                              return `${value.length} items`;
                            }
                          }

                          if (column === 'address' && typeof value === 'object' && value !== null) {
                            return `${value.street}, ${value.city}, ${value.country}`; // Format address
                          }

                          if (typeof value === 'object' && value !== null && (value.name || value.username || value.email)) {
                              return value.name || value.username || value.email; // Display name, username, or email
                          }

                           if (typeof value === 'object' && value !== null && value.product && (value.product.name || value.product.username || value.product.email)) {
                             // Handle embedded document like product in Order products
                             return value.product.name || value.product.username || value.product.email || JSON.stringify(value.product);
                          }


                          if (value instanceof Date && !isNaN(value.getTime())) {
                              return value.toLocaleDateString(); // Format date
                          }
                           if (typeof value === 'string' && !isNaN(new Date(value).getTime())){
                             return new Date(value).toLocaleDateString(); // Format date strings
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
       {!loading && searchTerm && filteredAndSortedItems.length === 0 && (
            <Typography>No results found for "{searchTerm}".</Typography>
        )}

      {/* Form Dialog for Create and Edit */}
      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)}>
        <DialogTitle>{isEdit ? 'Edit' : 'Create'} {schemaName}</DialogTitle>
        <DialogContent>
           <DialogContentText>
            {isEdit ? `Editing ${schemaName} with ID: ${currentId}` : `Creating a new ${schemaName}`}
          </DialogContentText>
          {columns.map((column) => (
            // Render specific fields based on schema and column name
            schemaName.toLowerCase() === 'user' && column === 'address' ? (
                <Box key={column} sx={{ mt: 1, mb: 2, p: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
                    <Typography variant="subtitle1" gutterBottom>Address</Typography>
                    <TextField
                        margin="dense"
                        name="address.street"
                        label="Street"
                        type="text"
                        fullWidth
                        value={formData['address.street'] || ''}
                        onChange={handleInputChange}
                    />
                     <TextField
                        margin="dense"
                        name="address.city"
                        label="City"
                        type="text"
                        fullWidth
                        value={formData['address.city'] || ''}
                        onChange={handleInputChange}
                    />
                     <TextField
                        margin="dense"
                        name="address.postalCode"
                        label="Postal Code"
                        type="text"
                        fullWidth
                        value={formData['address.postalCode'] || ''}
                        onChange={handleInputChange}
                    />
                     <TextField
                        margin="dense"
                        name="address.country"
                        label="Country"
                        type="text"
                        fullWidth
                        value={formData['address.country'] || ''}
                        onChange={handleInputChange}
                    />
                </Box>
            ) : schemaName.toLowerCase() === 'product' && column === 'category' ? (
                 // Exclude category field from Product form
                 null
            ) : schemaName.toLowerCase() === 'product' && column === 'reviews' ? (
                // Exclude reviews field from Product form
                 null
            ) : schemaName.toLowerCase() === 'order' && column === 'user' ? (
                 // Render Select dropdown for user in Order schema
                <FormControl fullWidth margin="dense" key={column}>
                    <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                    <Select
                        name={column}
                        value={formData[column] || ''}
                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                        onChange={handleInputChange}
                    >
                        {users.map(user => (
                            <MenuItem key={user._id} value={user._id}>
                                {user.username || user.name || user._id}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : schemaName.toLowerCase() === 'order' && column === 'products' ? (
                // Exclude products field from Order form
                 null
            ) : schemaName.toLowerCase() === 'order' && column === 'deliveryStatus' ? (
                 // Render Select dropdown for deliveryStatus in Order schema
                <FormControl fullWidth margin="dense" key={column}>
                    <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                    <Select
                        name={column}
                        value={formData[column] || ''}
                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                        onChange={handleInputChange}
                    >
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                    </Select>
                </FormControl>

            ) : schemaName.toLowerCase() === 'review' && column === 'product' ? (
                 // Render Select dropdown for product in Review schema
                <FormControl fullWidth margin="dense" key={column}>
                    <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                    <Select
                        name={column}
                        value={formData[column] || ''}
                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                        onChange={handleInputChange}
                    >
                        {products.map(product => (
                            <MenuItem key={product._id} value={product._id}>
                                {product.name || product._id}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : schemaName.toLowerCase() === 'review' && column === 'user' ? (
                 // Render Select dropdown for user in Review schema
                <FormControl fullWidth margin="dense" key={column}>
                    <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                    <Select
                        name={column}
                        value={formData[column] || ''}
                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                        onChange={handleInputChange}
                    >
                        {users.map(user => (
                            <MenuItem key={user._id} value={user._id}>
                                {user.username || user.name || user._id}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : schemaName.toLowerCase() === 'review' && column === 'rating' ? (
                 // Render number input with max constraint for rating in Review schema
                <TextField
                    key={column}
                    margin="dense"
                    name={column}
                    label={column.charAt(0).toUpperCase() + column.slice(1)}
                    type="number"
                    fullWidth
                    value={formData[column] || ''}
                    onChange={handleInputChange}
                    inputProps={{ max: 5, min: 1 }}
                />
             ) : schemaName.toLowerCase() === 'wishlist' && column === 'user' ? (
                 // Render Select dropdown for user in Wishlist schema
                <FormControl fullWidth margin="dense" key={column}>
                    <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                    <Select
                        name={column}
                        value={formData[column] || ''}
                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                        onChange={handleInputChange}
                    >
                        {users.map(user => (
                            <MenuItem key={user._id} value={user._id}>
                                {user.username || user.name || user._id}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
             ) : schemaName.toLowerCase() === 'wishlist' && column === 'products' ? (
                 // Render multi-select dropdown for products in Wishlist schema
                 <FormControl fullWidth margin="dense" key={column}>
                     <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                     <Select
                        multiple
                        name={column}
                        value={Array.isArray(formData[column]) ? formData[column] : []} // Ensure value is always an array
                        onChange={handleInputChange}
                        input={<OutlinedInput label={column.charAt(0).toUpperCase() + column.slice(1)} />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((productId) => {
                                    // Find the product object by ID to display its name
                                    const product = products.find(p => p._id === productId);
                                    return (
                                        <Chip key={productId} label={product ? product.name : productId} />
                                    );
                                })}
                            </Box>
                        )}
                     >
                         {products.map(product => (
                             <MenuItem key={product._id} value={product._id}>
                                 {product.name || product._id}
                             </MenuItem>
                         ))}
                     </Select>
                 </FormControl>
            ) : schemaName.toLowerCase() === 'payment' && column === 'user' ? (
                 // Render Select dropdown for user in Payment schema
                <FormControl fullWidth margin="dense" key={column}>
                    <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                    <Select
                        name={column}
                        value={formData[column] || ''}
                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                        onChange={handleInputChange}
                    >
                        {users.map(user => (
                            <MenuItem key={user._id} value={user._id}>
                                {user.username || user.name || user._id}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : schemaName.toLowerCase() === 'payment' && column === 'order' ? (
                 // Render Select dropdown for order in Payment schema
                <FormControl fullWidth margin="dense" key={column}>
                    <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                    <Select
                        name={column}
                        value={formData[column] || ''}
                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                        onChange={handleInputChange}
                    >
                         {orders.map(order => (
                            <MenuItem key={order._id} value={order._id}>
                                {order._id} {order.user ? `(User: ${order.user.username || order.user.name || order.user._id})` : ''} {/* Display order ID and user info if available */}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : schemaName.toLowerCase() === 'payment' && column === 'paymentMethod' ? (
                 // Render Select dropdown for paymentMethod in Payment schema
                <FormControl fullWidth margin="dense" key={column}>
                    <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                    <Select
                        name={column}
                        value={formData[column] || ''}
                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                        onChange={handleInputChange}
                    >
                        <MenuItem value="card">Card</MenuItem>
                        <MenuItem value="paypal">PayPal</MenuItem>
                        <MenuItem value="bank">Bank</MenuItem>
                        <MenuItem value="crypto">Crypto</MenuItem>
                    </Select>
                </FormControl>
            ) : schemaName.toLowerCase() === 'payment' && column === 'paymentStatus' ? (
                 // Render Select dropdown for paymentStatus in Payment schema
                <FormControl fullWidth margin="dense" key={column}>
                    <InputLabel>{column.charAt(0).toUpperCase() + column.slice(1)}</InputLabel>
                    <Select
                        name={column}
                        value={formData[column] || ''}
                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                        onChange={handleInputChange}
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                </FormControl>
            ) : schemaName.toLowerCase() === 'payment' && column === 'amount' ? (
                // Render number input for amount in Payment schema
                <TextField
                    key={column}
                    margin="dense"
                    name={column}
                    label={column.charAt(0).toUpperCase() + column.slice(1)}
                    type="number"
                    fullWidth
                    value={formData[column] || ''}
                    onChange={handleInputChange}
                    inputProps={{ min: 0 }}
                />
            ) : (
                // Render a single TextField for other columns (e.g., transactionId, paidAt)
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
            )
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitClick} color="primary">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
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